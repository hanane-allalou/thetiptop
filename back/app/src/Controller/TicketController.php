<?php

namespace App\Controller;

use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class TicketController
{
    #[Route('/api/tickets/{id}/delivered', name: 'api_tickets_delivered', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function delivered(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $ticket = $entityManager->getRepository(Ticket::class)->find($id);
        $delivered = $ticket instanceof Ticket && count(array_filter(
            $ticket->getClaims()->toArray(),
            static fn ($claim): bool => $claim->isDelivered(),
        )) > 0;

        return new JsonResponse(['id' => $ticket?->getId(), 'delivered' => $delivered]);
    }

    #[Route('/api/tickets/{id}', name: 'api_tickets_show', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function show(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $ticket = $entityManager->getRepository(Ticket::class)->find($id);
        if (!$ticket instanceof Ticket) {
            return new JsonResponse([]);
        }

        $claims = array_map(static fn ($claim): array => [
            'id' => $claim->getId(),
            'claimedAt' => $claim->getClaimedAt()?->format(DATE_ATOM),
            'claimedByEmployee' => $claim->getClaimedByEmployee(),
            'isDelivered' => $claim->isDelivered(),
            'deliveryDate' => $claim->getDeliveryDate()?->format(DATE_ATOM),
            'notes' => null,
        ], $ticket->getClaims()->toArray());

        return new JsonResponse([[
            'id' => $ticket->getId(),
            'code' => $ticket->getCode(),
            'userId' => $ticket->getUser()?->getId(),
            'prizeId' => $ticket->getPrize()->getId(),
            'isUsed' => $ticket->isUsed(),
            'usedDate' => $ticket->getUsedDate()?->format(DATE_ATOM),
            'claims' => $claims,
        ]]);
    }
}