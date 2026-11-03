<?php

namespace App\Service;

use App\Entity\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Service\PrometheusService;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

final class AuthService
{
    public function __construct(private readonly PrometheusService $prometheus)
    {
    }

    public function issueTokens(User $user): array
    {
        $issuedAt = time();
        $payload = [
            'sub' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'iat' => $issuedAt,
        ];

        return [
            'accessToken' => JWT::encode($payload + ['exp' => $issuedAt + 14400], $this->secret('JWT_SECRET'), 'HS256'),
            'refreshToken' => JWT::encode($payload + ['exp' => $issuedAt + 604800, 'token_use' => 'refresh'], $this->secret('JWT_REFRESH_SECRET'), 'HS256'),
        ];
    }

    public function decodeRefreshToken(string $token): object
    {
        try {
            $payload = JWT::decode($token, new Key($this->secret('JWT_REFRESH_SECRET'), 'HS256'));
        } catch (\Throwable) {
            $this->prometheus->authFailed('invalid_refresh_token');
            throw new UnauthorizedHttpException('Bearer', 'Token de rafraîchissement invalide');
        }

        if (($payload->token_use ?? null) !== 'refresh' || !isset($payload->sub)) {
            throw new UnauthorizedHttpException('Bearer', 'Token de rafraîchissement invalide');
        }

        return $payload;
    }

    private function secret(string $name): string
    {
        $secret = $_ENV[$name] ?? $_SERVER[$name] ?? getenv($name) ?: '';
        if (strlen($secret) < 32) {
            throw new \RuntimeException(sprintf('%s doit contenir au moins 32 caractères.', $name));
        }

        return $secret;
    }
}