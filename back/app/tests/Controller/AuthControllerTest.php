<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AuthControllerTest extends WebTestCase
{
    public function testRegisterLoginAndRefresh(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $metadata = $entityManager->getClassMetadata(User::class);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema([$metadata]);
        $schemaTool->createSchema([$metadata]);

        $client->request('GET', '/api/auth/profile');
        self::assertResponseStatusCodeSame(401);

        $client->jsonRequest('POST', '/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'correct-horse-battery',
            'gender' => 'Other',
            'age' => 28,
            'optInEmail' => true,
        ]);

        self::assertResponseStatusCodeSame(201);
        self::assertSame(['message' => 'Compte créé avec succès'], json_decode($client->getResponse()->getContent(), true));

        $client->jsonRequest('POST', '/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'correct-horse-battery',
        ]);

        self::assertResponseIsSuccessful();
        $login = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertNotEmpty($login['access_token']);
        self::assertSame('client', $login['user']['role']);
        $setCookie = $client->getResponse()->headers->get('set-cookie');
        self::assertStringContainsString('refresh_token=', $setCookie);
        self::assertStringContainsString('path=/api/auth/refresh', $setCookie);

        $client->request('GET', '/api/auth/profile', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $login['access_token'],
        ]);

        self::assertResponseIsSuccessful();
        self::assertSame('test@example.com', json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['email']);

        $client->request('GET', '/api/auth/refresh');

        self::assertResponseIsSuccessful();
        self::assertNotEmpty(json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['accessToken']);
    }
}