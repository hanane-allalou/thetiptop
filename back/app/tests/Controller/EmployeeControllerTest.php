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

final class EmployeeControllerTest extends WebTestCase
{
    public function testOnlyEmployeesCanValidateAndDeliverAClaimOnce(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $classes = [User::class, Prize::class, Ticket::class, Participation::class, Claim::class, Winner::class];
        $metadata = array_map(fn (string $class) => $entityManager->getClassMetadata($class), $classes);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);

        $customer = new User();
        $customer->setName('Customer');
        $customer->setEmail('customer@example.com');
        $customer->setPassword('test-password');
        $customer->setGender('Other');
        $customer->setAge(28);
        $employee = new User();
        $employee->setName('Employee');
        $employee->setEmail('employee@example.com');
        $employee->setPassword('test-password');
        $employee->setGender('Other');
        $employee->setAge(30);
        $employee->setRole('employee');
        $prize = new Prize('Thé vert', 'Lot test', null, '15.00');
        $ticket = new Ticket('TICKET0002', $prize);
        $ticket->markUsed($customer, new \DateTimeImmutable());
        $participation = new Participation($customer, $ticket, new \DateTimeImmutable());
        $winner = new Winner($participation, 'Lot test', '15.00', new \DateTimeImmutable());
        foreach ([$customer, $employee, $prize, $ticket, $participation, $winner] as $entity) {
            $entityManager->persist($entity);
        }
        $entityManager->flush();

        $authService = static::getContainer()->get(AuthService::class);
        $customerToken = $authService->issueTokens($customer)['accessToken'];
        $employeeToken = $authService->issueTokens($employee)['accessToken'];

        $client->request('GET', '/api/employee/ticket/TICKET0002', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $customerToken,
        ]);
        self::assertResponseStatusCodeSame(403);

        $client->request('GET', '/api/employee/ticket/TICKET0002', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseIsSuccessful();
        self::assertFalse(json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)['claimed']);

        $client->request('GET', '/api/employee/search?query=customer%40example.com', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseIsSuccessful();
        self::assertSame('TICKET0002', json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)[0]['ticketCode']);

        $client->request('GET', '/api/employee/search-winners?query=TICKET0002', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseIsSuccessful();
        self::assertSame('TICKET0002', json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR)[0]['participation']['ticket']['code']);

        $client->jsonRequest('POST', '/api/employee/claim/' . $ticket->getId(), [], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseStatusCodeSame(201);

        $client->jsonRequest('POST', '/api/employee/claim/' . $ticket->getId(), [], server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseStatusCodeSame(400);

        $client->request('POST', '/api/admin/claim-grand-prize/' . $winner->getId(), server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $employeeToken,
        ]);
        self::assertResponseIsSuccessful();
    }
}