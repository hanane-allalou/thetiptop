<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

final class OAuthUserService
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function findOrCreate(string $provider, array $profile): User
    {
        $providerId = (string) ($profile['id'] ?? $profile['sub'] ?? '');
        $email = mb_strtolower(trim((string) ($profile['email'] ?? '')));
        if ($providerId === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException(sprintf('%s n’a pas fourni un identifiant et une adresse e-mail valides.', $provider));
        }

        $repository = $this->entityManager->getRepository(User::class);
        $user = $repository->findOneBy(['providerId' => $providerId]);
        if ($user instanceof User) {
            return $user;
        }

        $user = $repository->findOneBy(['email' => $email]);
        if ($user instanceof User) {
            return $user;
        }

        $name = trim((string) ($profile['name'] ?? ''));
        if ($name === '') {
            $name = trim((string) ($profile['given_name'] ?? $profile['first_name'] ?? '') . ' ' . (string) ($profile['family_name'] ?? $profile['last_name'] ?? ''));
        }
        if ($name === '') {
            $name = strstr($email, '@', true) ?: $email;
        }

        $avatar = $profile['picture'] ?? null;
        if (is_array($avatar)) {
            $avatar = $avatar['data']['url'] ?? null;
        }

        $user = new User();
        $user->setName($name);
        $user->setEmail($email);
        $user->setPassword('');
        $user->setProviderId($providerId);
        $user->setAvatar(is_string($avatar) ? $avatar : null);
        $user->setRegistrationMethod($provider);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }
}