<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class UserController
{
    #[Route('/api/users/{id}', name: 'api_users_show', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function show(int $id, #[CurrentUser] ?User $currentUser, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->canManage($id, $currentUser)) {
            return new JsonResponse(['message' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($this->serializeUser($user));
    }

    #[Route('/api/users/{id}', name: 'api_users_update', methods: ['PATCH'], requirements: ['id' => '\\d+'])]
    public function update(int $id, Request $request, #[CurrentUser] ?User $currentUser, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->canManage($id, $currentUser)) {
            return new JsonResponse(['message' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = $request->toArray();
        $allowed = ['name', 'email', 'gender', 'age', 'city', 'avatar'];
        if ($data === [] || array_diff(array_keys($data), $allowed) !== []) {
            return new JsonResponse(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }
        if (isset($data['name']) && (!is_string($data['name']) || trim($data['name']) === '')) {
            return new JsonResponse(['message' => 'Nom invalide'], Response::HTTP_BAD_REQUEST);
        }
        if (isset($data['email']) && (!is_string($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL))) {
            return new JsonResponse(['message' => 'Adresse e-mail invalide'], Response::HTTP_BAD_REQUEST);
        }
        if (array_key_exists('gender', $data) && $data['gender'] !== null && !in_array($data['gender'], ['M', 'F', 'Other'], true)) {
            return new JsonResponse(['message' => 'Genre invalide'], Response::HTTP_BAD_REQUEST);
        }
        if (array_key_exists('age', $data) && $data['age'] !== null && !is_int($data['age'])) {
            return new JsonResponse(['message' => 'Âge invalide'], Response::HTTP_BAD_REQUEST);
        }
        foreach (['city', 'avatar'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] !== null && !is_string($data[$field])) {
                return new JsonResponse(['message' => sprintf('%s invalide', $field)], Response::HTTP_BAD_REQUEST);
            }
        }

        if (isset($data['name'])) {
            $user->setName(trim($data['name']));
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (array_key_exists('gender', $data)) {
            $user->setGender($data['gender']);
        }
        if (array_key_exists('age', $data)) {
            $user->setAge($data['age']);
        }
        if (array_key_exists('city', $data)) {
            $user->setCity($data['city']);
        }
        if (array_key_exists('avatar', $data)) {
            $user->setAvatar($data['avatar']);
        }

        try {
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['message' => 'Cette adresse e-mail est déjà utilisée'], Response::HTTP_CONFLICT);
        }

        return new JsonResponse($this->serializeUser($user));
    }

    #[Route('/api/users/{id}', name: 'api_users_delete', methods: ['DELETE'], requirements: ['id' => '\\d+'])]
    public function delete(int $id, #[CurrentUser] ?User $currentUser, EntityManagerInterface $entityManager): Response
    {
        if (!$this->canManage($id, $currentUser)) {
            return new JsonResponse(['message' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function canManage(int $id, ?User $currentUser): bool
    {
        return $currentUser instanceof User && ($currentUser->getId() === $id || $currentUser->getRole() === 'admin');
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'gender' => $user->getGender(),
            'age' => $user->getAge(),
            'city' => $user->getCity(),
            'occupation' => $user->getOccupation(),
            'avatar' => $user->getAvatar(),
            'optInEmail' => $user->getOptInEmail(),
            'role' => $user->getRole(),
            'createdAt' => $user->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}