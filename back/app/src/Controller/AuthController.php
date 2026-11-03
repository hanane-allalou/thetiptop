<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\AuthService;
use App\Service\OAuthUserService;
use App\Service\PrometheusService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class AuthController
{
    #[Route('/api/auth/profile', name: 'api_auth_profile', methods: ['GET'])]
    public function profile(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'gender' => $user->getGender(),
        ]);
    }

    #[Route('/api/auth/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        PrometheusService $prometheus,
    ): JsonResponse {
        $data = $request->toArray();
        $allowedFields = ['name', 'email', 'password', 'city', 'gender', 'age', 'occupation', 'optInEmail'];
        if (array_diff(array_keys($data), $allowedFields) !== []) {
            return new JsonResponse(['message' => 'Données supplémentaires non autorisées'], Response::HTTP_BAD_REQUEST);
        }

        $data['optInEmail'] ??= false;

        $violations = $validator->validate($data, new Assert\Collection(
            fields: [
                'name' => [new Assert\NotBlank(), new Assert\Type('string')],
                'email' => [new Assert\NotBlank(), new Assert\Email()],
                'password' => [new Assert\NotBlank(), new Assert\Length(min: 6)],
                'gender' => [new Assert\NotBlank(), new Assert\Choice(choices: ['M', 'F', 'Other'])],
                'age' => [new Assert\NotNull(), new Assert\Type('integer')],
                'city' => new Assert\Optional(constraints: [new Assert\Type('string')]),
                'occupation' => new Assert\Optional(constraints: [new Assert\Type('string')]),
                'optInEmail' => [new Assert\Type('boolean')],
            ],
        ));

        if (count($violations) > 0) {
            return new JsonResponse(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        $repository = $entityManager->getRepository(User::class);
        if ($repository->findOneBy(['email' => mb_strtolower($data['email'])])) {
            return new JsonResponse(['message' => 'Cette adresse e-mail est déjà utilisée'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setName($data['name']);
        $user->setEmail($data['email']);
        $user->setGender($data['gender']);
        $user->setAge($data['age']);
        $user->setCity($data['city'] ?? null);
        $user->setOccupation($data['occupation'] ?? null);
        $user->setOptInEmail($data['optInEmail']);
        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['message' => 'Cette adresse e-mail est déjà utilisée'], Response::HTTP_CONFLICT);
        }

        $prometheus->playerRegistered();

        return new JsonResponse(['message' => 'Compte créé avec succès'], Response::HTTP_CREATED);
    }

    #[Route('/api/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        AuthService $authService,
        PrometheusService $prometheus,
    ): Response {
        $data = $request->toArray();
        if (!isset($data['email'], $data['password']) || !is_string($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL) || !is_string($data['password'])) {
            return new JsonResponse(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => mb_strtolower($data['email'])]);
        if (!$user instanceof User || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            $prometheus->authFailed('invalid_credentials');
            return new JsonResponse(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        $tokens = $authService->issueTokens($user);
        $response = new JsonResponse([
            'access_token' => $tokens['accessToken'],
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'gender' => $user->getGender(),
            ],
        ]);

        return $this->withRefreshCookie($response, $tokens['refreshToken']);
    }

    #[Route('/api/auth/refresh', name: 'api_auth_refresh', methods: ['GET'])]
    public function refresh(Request $request, EntityManagerInterface $entityManager, AuthService $authService): Response
    {
        $token = $request->cookies->get('refresh_token');
        if (!is_string($token) || $token === '') {
            return new JsonResponse(['message' => 'Token de rafraîchissement invalide'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = $authService->decodeRefreshToken($token);
        $user = $entityManager->getRepository(User::class)->find((int) $payload->sub);
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur introuvable'], Response::HTTP_UNAUTHORIZED);
        }

        $tokens = $authService->issueTokens($user);
        $response = new JsonResponse(['accessToken' => $tokens['accessToken']]);

        return $this->withRefreshCookie($response, $tokens['refreshToken']);
    }

    #[Route('/auth/google', name: 'api_auth_google', methods: ['GET'])]
    public function google(ClientRegistry $clients): RedirectResponse
    {
        return $clients->getClient('google')->redirect(['email', 'profile']);
    }

    #[Route('/auth/google/redirect', name: 'api_auth_google_redirect', methods: ['GET'])]
    public function googleRedirect(ClientRegistry $clients, OAuthUserService $oauthUsers, AuthService $authService): Response
    {
        return $this->completeOAuth($clients->getClient('google')->fetchUser()->toArray(), 'Google', $oauthUsers, $authService);
    }

    #[Route('/auth/facebook', name: 'api_auth_facebook', methods: ['GET'])]
    public function facebook(ClientRegistry $clients): RedirectResponse
    {
        return $clients->getClient('facebook')->redirect(['email', 'public_profile']);
    }

    #[Route('/auth/facebook/redirect', name: 'api_auth_facebook_redirect', methods: ['GET'])]
    public function facebookRedirect(ClientRegistry $clients, OAuthUserService $oauthUsers, AuthService $authService): Response
    {
        return $this->completeOAuth($clients->getClient('facebook')->fetchUser()->toArray(), 'Facebook', $oauthUsers, $authService);
    }

    private function completeOAuth(array $profile, string $provider, OAuthUserService $oauthUsers, AuthService $authService): Response
    {
        $user = $oauthUsers->findOrCreate($provider, $profile);
        $tokens = $authService->issueTokens($user);
        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000', '/');
        $response = new RedirectResponse($frontendUrl . '/oauth-success?accessToken=' . rawurlencode($tokens['accessToken']));

        return $this->withRefreshCookie($response, $tokens['refreshToken']);
    }

    private function withRefreshCookie(Response $response, string $token): Response
    {
        $response->headers->setCookie(Cookie::create('refresh_token')
            ->withValue($token)
            ->withExpires(new \DateTimeImmutable('+7 days'))
            ->withPath('/api/auth/refresh')
            ->withHttpOnly()
            ->withSecure(($_ENV['APP_ENV'] ?? 'dev') === 'prod')
            ->withSameSite(Cookie::SAMESITE_LAX));

        return $response;
    }
}