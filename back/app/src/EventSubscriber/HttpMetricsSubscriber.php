<?php

namespace App\EventSubscriber;

use App\Service\PrometheusService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class HttpMetricsSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly PrometheusService $prometheus)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onRequest', 100],
            KernelEvents::RESPONSE => ['onResponse', -100],
        ];
    }

    public function onRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $event->getRequest()->attributes->set('_metrics_start', microtime(true));
    }

    public function onResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest() || $event->getRequest()->getPathInfo() === '/metrics') {
            return;
        }

        $request = $event->getRequest();
        $start = $request->attributes->get('_metrics_start');
        if (!is_float($start)) {
            return;
        }

        $route = (string) ($request->attributes->get('_route') ?? $request->getPathInfo());
        $this->prometheus->observeRequest(
            $request->getMethod(),
            $route,
            $event->getResponse()->getStatusCode(),
            max(0, microtime(true) - $start),
        );
    }
}