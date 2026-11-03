<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class CorsControllerTest extends WebTestCase
{
    public function testLocalFrontendCanMakeCredentialedApiRequests(): void
    {
        $client = static::createClient();
        $client->request('OPTIONS', '/api/auth/login', server: [
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,authorization',
        ]);

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('access-control-allow-origin', 'http://localhost:5173');
        self::assertResponseHeaderSame('access-control-allow-credentials', 'true');
        self::assertStringContainsString('POST', $client->getResponse()->headers->get('access-control-allow-methods'));
    }
}