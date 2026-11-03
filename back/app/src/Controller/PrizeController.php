<?php

namespace App\Controller;

use App\Entity\Prize;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class PrizeController
{
    #[Route('/api/prizes', name: 'api_prizes_index', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        return new JsonResponse($this->serializePrizes($entityManager));
    }

    #[Route('/api/prizes/public', name: 'api_prizes_public', methods: ['GET'])]
    public function public(EntityManagerInterface $entityManager): JsonResponse
    {
        return new JsonResponse($this->serializePrizes($entityManager));
    }

    private function serializePrizes(EntityManagerInterface $entityManager): array
    {
        return array_map(static fn (Prize $prize): array => [
            'id' => $prize->getId(),
            'name' => $prize->getName(),
            'description' => $prize->getDescription(),
            'imageUrl' => $prize->getImageUrl(),
            'value' => $prize->getValue() === null ? null : number_format((float) $prize->getValue(), 2, '.', ''),
        ], $entityManager->getRepository(Prize::class)->findAll());
    }
}