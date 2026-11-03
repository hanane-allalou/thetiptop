<?php

namespace App\Security;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

final class JwtAuthenticator extends AbstractAuthenticator
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function supports(Request $request): ?bool
    {
        $path = $request->getPathInfo();

        return $path === '/api/auth/profile'
            || str_starts_with($path, '/api/participations')
            || str_starts_with($path, '/api/employee')
            || str_starts_with($path, '/api/admin')
            || str_starts_with($path, '/api/users');
    }

    public function authenticate(Request $request): Passport
    {
        $authorization = $request->headers->get('Authorization', '');
        if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
            throw new CustomUserMessageAuthenticationException('Token d’accès manquant');
        }

        try {
            $payload = JWT::decode($matches[1], new Key($this->secret(), 'HS256'));
        } catch (\Throwable) {
            throw new CustomUserMessageAuthenticationException('Token d’accès invalide');
        }

        if (!isset($payload->sub) || !is_numeric($payload->sub)) {
            throw new CustomUserMessageAuthenticationException('Token d’accès invalide');
        }

        $userId = (int) $payload->sub;

        return new SelfValidatingPassport(new UserBadge((string) $userId, function () use ($userId): User {
            $user = $this->entityManager->getRepository(User::class)->find($userId);
            if (!$user instanceof User) {
                throw new UserNotFoundException();
            }

            return $user;
        }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['message' => $exception->getMessageKey()], Response::HTTP_UNAUTHORIZED);
    }

    private function secret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: '';
        if (strlen($secret) < 32) {
            throw new \RuntimeException('JWT_SECRET doit contenir au moins 32 caractères.');
        }

        return $secret;
    }
}