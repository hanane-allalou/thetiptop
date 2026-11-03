<?php

namespace App\Tests\Controller;

use App\Entity\Participation;
use App\Entity\Claim;
use App\Entity\Prize;
use App\Entity\Ticket;
use App\Entity\User;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ParticipationControllerTest extends WebTestCase
{
    public function testTicketCanOnlyBeUsedOnceAndAppearsInUserHistory(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $classes = [User::class, Prize::class, Ticket::class, Participation::class, Claim::class];
        $metadata = array_map(fn (string $class) => $entityManager->getClassMetadata($class), $classes);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);

        $user = new User();
        $user->setName('Participation User');
        $user->setEmail('participation@example.com');
        $user->setPassword('not-used-in-this-test');
        $user->setGender('Other');
        $user->setAge(30);
        $prize = new Prize('Coffret découverte', 'Une sélection de thés', '/lots/coffret.png', '25.00');
        $ticket = new Ticket('TICKET001', $prize);
        $entityManager->persist($user);
        $entityManager->persist($prize);
        $entityManager->persist($ticket);
        $entityManager->flush();

        $token = static::getContainer()->get(AuthService::class)->issueTokens($user)['accessToken'];
        $client->jsonRequest('POST', '/api/participations', ['ticketCode' => 'TICKET001'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseStatusCodeSame(201);
        self::assertSame('Coffret découverte', json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['prize']['name']);

        $client->jsonRequest('POST', '/api/participations', ['ticketCode' => 'TICKET001'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseStatusCodeSame(409);

        $client->request('GET', '/api/participations/my', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseIsSuccessful();
        $history = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertCount(1, $history);
        self::assertSame('TICKET001', $history[0]['ticket']['code']);
        self::assertSame(25.0, (float) $history[0]['ticket']['prize']['value']);

        $client->request('GET', '/api/participations', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseIsSuccessful();
        self::assertCount(1, json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR));

        $client->request('GET', '/api/participations/' . $history[0]['id'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);
        self::assertResponseIsSuccessful();
        self::assertSame($history[0]['id'], json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)[0]['id']);

        $client->request('GET', '/api/tickets/' . $ticket->getId() . '/delivered');
        self::assertResponseIsSuccessful();
        self::assertFalse(json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['delivered']);
    }
}