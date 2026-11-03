<?php

namespace App\Controller;

use App\Service\PrometheusService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MetricsController
{
    #[Route('/metrics', name: 'app_metrics', methods: ['GET'])]
    public function __invoke(PrometheusService $prometheus): Response
    {
        return new Response($prometheus->getMetrics(), Response::HTTP_OK, [
            'Content-Type' => 'text/plain; version=0.0.4; charset=utf-8',
        ]);
    }
}