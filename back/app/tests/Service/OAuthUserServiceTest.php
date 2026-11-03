<?php

namespace App\Tests\Service;

use App\Entity\User;
use App\Service\OAuthUserService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class OAuthUserServiceTest extends KernelTestCase
{
    public function testOAuthProfilesReuseTheSameAccountByProviderOrEmail(): void
    {
        self::bootKernel();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $metadata = $entityManager->getClassMetadata(User::class);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema([$metadata]);
        $schemaTool->createSchema([$metadata]);
        $oauthUsers = static::getContainer()->get(OAuthUserService::class);

        $googleUser = $oauthUsers->findOrCreate('Google', [
            'sub' => 'google-123',
            'email' => 'person@example.com',
            'name' => 'Person Example',
            'picture' => 'https://example.com/avatar.png',
        ]);
        $sameGoogleUser = $oauthUsers->findOrCreate('Google', [
            'sub' => 'google-123',
            'email' => 'person@example.com',
            'name' => 'Updated Name',
        ]);
        $sameEmailUser = $oauthUsers->findOrCreate('Facebook', [
            'id' => 'facebook-456',
            'email' => 'person@example.com',
            'name' => 'Person Example',
        ]);

        self::assertSame($googleUser->getId(), $sameGoogleUser->getId());
        self::assertSame($googleUser->getId(), $sameEmailUser->getId());
        self::assertSame('Google', $googleUser->getRegistrationMethod());
        self::assertSame(1, $entityManager->getRepository(User::class)->count([]));
    }
}