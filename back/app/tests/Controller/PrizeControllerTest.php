<?php

namespace App\Tests\Controller;

use App\Entity\Prize;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class PrizeControllerTest extends WebTestCase
{
    public function testPublicPrizesAreReturnedAsJson(): void
    {
        $client = static::createClient();
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $metadata = $entityManager->getClassMetadata(Prize::class);
        $schemaTool = new SchemaTool($entityManager);
        $schemaTool->dropSchema([$metadata]);
        $schemaTool->createSchema([$metadata]);

        $entityManager->persist(new Prize('Coffret découverte', 'Une sélection de thés', '/lots/coffret.png', '25.00'));
        $entityManager->flush();

        $client->request('GET', '/api/prizes/public');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/json');
        self::assertSame([
            [
                'id' => 1,
                'name' => 'Coffret découverte',
                'description' => 'Une sélection de thés',
                'imageUrl' => '/lots/coffret.png',
                'value' => '25.00',
            ],
        ], json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR));

        $client->request('GET', '/api/prizes');

        self::assertResponseIsSuccessful();
        self::assertSame([
            [
                'id' => 1,
                'name' => 'Coffret découverte',
                'description' => 'Une sélection de thés',
                'imageUrl' => '/lots/coffret.png',
                'value' => '25.00',
            ],
        ], json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR));
    }
}