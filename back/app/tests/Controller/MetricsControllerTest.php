<?php

namespace App\Tests\Controller;

use App\Service\PrometheusService;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class MetricsControllerTest extends WebTestCase
{
    public function testMetricsEndpointReturnsPrometheusTextFormat(): void
    {
        $client = static::createClient();
        $prometheus = static::getContainer()->get(PrometheusService::class);
        $prometheus->playerRegistered();
        $prometheus->participationCreated();
        $client->request('GET', '/');
        $client->request('GET', '/metrics');

        self::assertResponseIsSuccessful();
        self::assertStringContainsString('text/plain', $client->getResponse()->headers->get('content-type'));
        self::assertStringContainsString('# HELP http_requests_total', $client->getResponse()->getContent());
        self::assertStringContainsString('# TYPE http_request_duration_seconds histogram', $client->getResponse()->getContent());
        self::assertStringContainsString('# HELP players_total', $client->getResponse()->getContent());
        self::assertStringContainsString('# HELP participations_total', $client->getResponse()->getContent());
    }
}