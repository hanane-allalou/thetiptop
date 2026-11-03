<?php

namespace App\Service;

use Prometheus\CollectorRegistry;
use Prometheus\Counter;
use Prometheus\Histogram;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\PDO as PrometheusPDO;
use Symfony\Component\HttpKernel\KernelInterface;

final class PrometheusService
{
    private CollectorRegistry $registry;
    private Counter $httpRequestsTotal;
    private Histogram $httpRequestDuration;
    private Counter $playersTotal;
    private Counter $participationsTotal;
    private Counter $prizesClaimedTotal;
    private Counter $authFailuresTotal;

    public function __construct(KernelInterface $kernel)
    {
        $databasePath = $kernel->getProjectDir() . '/var/prometheus.sqlite';
        $pdo = new \PDO('sqlite:' . $databasePath);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $this->registry = new CollectorRegistry(new PrometheusPDO($pdo));

        $this->httpRequestsTotal = $this->registry->getOrRegisterCounter(
            '', 'http_requests_total', 'Nombre de requêtes HTTP', ['method', 'route', 'status'],
        );
        $this->httpRequestDuration = $this->registry->getOrRegisterHistogram(
            '', 'http_request_duration_seconds', 'Durée des requêtes HTTP', ['method', 'route', 'status'], [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
        );
        $this->playersTotal = $this->registry->getOrRegisterCounter('', 'players_total', 'Nombre total de joueurs inscrits');
        $this->participationsTotal = $this->registry->getOrRegisterCounter('', 'participations_total', 'Nombre total de participations au jeu');
        $this->prizesClaimedTotal = $this->registry->getOrRegisterCounter('', 'prizes_claimed_total', 'Nombre total de lots remis', ['prize_id']);
        $this->authFailuresTotal = $this->registry->getOrRegisterCounter('', 'auth_failures_total', 'Nombre de tentatives de connexion échouées', ['reason']);
    }

    public function getMetrics(): string
    {
        return (new RenderTextFormat())->render($this->registry->getMetricFamilySamples());
    }

    public function observeRequest(string $method, string $route, int $status, float $duration): void
    {
        $labels = [$method, $route, (string) $status];
        $this->httpRequestsTotal->inc($labels);
        $this->httpRequestDuration->observe($duration, $labels);
    }

    public function playerRegistered(): void
    {
        $this->playersTotal->inc();
    }

    public function participationCreated(): void
    {
        $this->participationsTotal->inc();
    }

    public function prizeClaimed(int $ticketId): void
    {
        $this->prizesClaimedTotal->inc([(string) $ticketId]);
    }

    public function authFailed(string $reason): void
    {
        $this->authFailuresTotal->inc([$reason]);
    }
}