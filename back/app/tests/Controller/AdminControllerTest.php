<?php

namespace App\Tests\Controller;

use App\Entity\Claim;
use App\Entity\Participation;
use App\Entity\Prize;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Winner;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AdminControllerTest extends WebTestCase
{
    public function testAdminDashboardExportAndWinnerWorkflow(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $classes = [User::class, Prize::class, Ticket::class, Participation::class, Claim::class, Winner::class];
        $metadata = array_map(fn (string $class) => $entityManager->getClassMetadata($class), $classes);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);

        $customer = new User();
        $customer->setName('Opted In Customer');
        $customer->setEmail('opted@example.com');
        $customer->setPassword('test-password');
        $customer->setGender('F');
        $customer->setAge(17);
        $customer->setOptInEmail(true);
        $administrator = new User();
        $administrator->setName('Administrator');
        $administrator->setEmail('admin@example.com');
        $administrator->setPassword('test-password');
        $administrator->setRole('admin');
        $prize = new Prize('Infuseur', 'Lot test', null, '10.00');
        $ticket = new Ticket('TICKET0003', $prize);
        $ticket->markUsed($customer, new \DateTimeImmutable());
        $participation = new Participation($customer, $ticket, new \DateTimeImmutable());
        foreach ([$customer, $administrator, $prize, $ticket, $participation] as $entity) {
            $entityManager->persist($entity);
        }
        $entityManager->flush();

        $authService = static::getContainer()->get(AuthService::class);
        $customerToken = $authService->issueTokens($customer)['accessToken'];
        $adminToken = $authService->issueTokens($administrator)['accessToken'];

        $client->request('GET', '/api/admin/statistics', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $customerToken,
        ]);
        self::assertResponseStatusCodeSame(403);

        $client->request('GET', '/api/admin/statistics', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        self::assertResponseIsSuccessful();
        $statistics = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(1, $statistics['totalTickets']);
        self::assertSame(1, $statistics['usedTickets']);
        self::assertSame(2, $statistics['users']);
        self::assertSame('Infuseur', $statistics['prizeDistribution'][0]['name']);
        self::assertSame('Non spécifié', $statistics['userDemographics']['ageGroups'][0]['name']);

        $client->request('GET', '/api/admin/users?page=1&limit=10', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        $users = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(1, $users['total']);
        self::assertSame('opted@example.com', $users['users'][0]['email']);

        $client->jsonRequest('POST', '/api/admin/export-emails', ['userIds' => [$customer->getId()]], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        self::assertResponseIsSuccessful();
        self::assertStringContainsString('opted@example.com', $client->getResponse()->getContent());
        self::assertStringContainsString('text/csv', $client->getResponse()->headers->get('content-type'));

        $client->request('POST', '/api/admin/draw-winner', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        self::assertResponseStatusCodeSame(201);
        $draw = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('Opted In Customer', $draw['winner']['userName']);

        $client->request('GET', '/api/admin/winners?prize=Un%20an%20de%20th%C3%A9', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        $winners = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('TICKET0003', $winners[0]['participation']['ticket']['code']);

        $client->request('POST', '/api/admin/claim-grand-prize/' . $draw['winner']['id'], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        self::assertResponseIsSuccessful();

        $client->request('GET', '/api/admin/grand-prize-winner', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $adminToken,
        ]);
        self::assertNotNull(json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['claimedDate']);
    }
}