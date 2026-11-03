<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class UserControllerTest extends WebTestCase
{
    public function testUsersCanOnlyManageTheirOwnProfile(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $metadata = $entityManager->getClassMetadata(User::class);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema([$metadata]);
        $schemaTool->createSchema([$metadata]);

        $owner = new User();
        $owner->setName('Owner');
        $owner->setEmail('owner@example.com');
        $owner->setPassword('test-password');
        $other = new User();
        $other->setName('Other');
        $other->setEmail('other@example.com');
        $other->setPassword('test-password');
        $entityManager->persist($owner);
        $entityManager->persist($other);
        $entityManager->flush();

        $token = static::getContainer()->get(AuthService::class)->issueTokens($owner)['accessToken'];

        $client->jsonRequest('PATCH', '/api/users/' . $owner->getId(), ['name' => 'Updated Owner'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseIsSuccessful();
        self::assertSame('Updated Owner', json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['name']);

        $client->jsonRequest('PATCH', '/api/users/' . $other->getId(), ['name' => 'Stolen Update'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseStatusCodeSame(403);

        $client->request('DELETE', '/api/users/' . $owner->getId(), server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseStatusCodeSame(204);
    }
}