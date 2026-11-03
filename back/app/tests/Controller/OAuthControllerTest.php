<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class OAuthControllerTest extends WebTestCase
{
    public function testGoogleAndFacebookStartRoutesRedirectToTheirProviders(): void
    {
        $client = static::createClient();
        $client->request('GET', '/auth/google');

        self::assertResponseRedirects();
        self::assertStringContainsString('accounts.google.com', $client->getResponse()->headers->get('location'));

        $client->request('GET', '/auth/facebook');

        self::assertResponseRedirects();
        self::assertStringContainsString('facebook.com', $client->getResponse()->headers->get('location'));
    }
}