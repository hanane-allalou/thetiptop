<?php

namespace App\Controller;

use App\Entity\Participation;
use App\Entity\Prize;
use App\Entity\Ticket;
use App\Entity\User;
use App\Service\PrometheusService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class ParticipationController
{
    #[Route('/api/participations', name: 'api_participations_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] ?User $user, EntityManagerInterface $entityManager, PrometheusService $prometheus): JsonResponse
    {
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = $request->toArray();
        if (array_diff(array_keys($data), ['ticketCode']) !== [] || !isset($data['ticketCode']) || !is_string($data['ticketCode']) || trim($data['ticketCode']) === '') {
            return new JsonResponse(['message' => 'Code ticket invalide'], Response::HTTP_BAD_REQUEST);
        }

        $ticket = $entityManager->getRepository(Ticket::class)->findOneBy(['code' => $data['ticketCode']]);
        if (!$ticket instanceof Ticket) {
            return new JsonResponse(['message' => 'Ticket introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($ticket->isUsed() || $ticket->getUser() !== null) {
            return new JsonResponse(['message' => 'Ce ticket a déjà été utilisé.'], Response::HTTP_CONFLICT);
        }

        $prize = $ticket->getPrize();
        $now = new \DateTimeImmutable();

        try {
            $entityManager->getConnection()->transactional(function () use ($entityManager, $ticket, $user, $now): void {
                $updated = $entityManager->getConnection()->executeStatement(
                    'UPDATE tickets SET user_id = ?, used_date = ?, is_used = 1 WHERE id = ? AND user_id IS NULL AND is_used = 0',
                    [$user->getId(), $now->format('Y-m-d H:i:s'), $ticket->getId()],
                    [Types::INTEGER, Types::STRING, Types::INTEGER],
                );

                if ($updated !== 1) {
                    throw new \DomainException('Ce ticket a déjà été utilisé.');
                }

                $entityManager->persist(new Participation($user, $ticket, $now));
                $entityManager->flush();
            });
        } catch (\DomainException|UniqueConstraintViolationException) {
            return new JsonResponse(['message' => 'Ce ticket a déjà été utilisé.'], Response::HTTP_CONFLICT);
        }

        $prometheus->participationCreated();

        return new JsonResponse([
            'message' => 'Félicitation, vous venez de gagner! ',
            'user' => ['name' => $user->getName(), 'email' => $user->getEmail()],
            'participationDate' => $now->format(DATE_ATOM),
            'prize' => $this->serializePrize($prize),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/participations', name: 'api_participations_list', methods: ['GET'])]
    public function all(#[CurrentUser] ?User $user, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $participations = $entityManager->getRepository(Participation::class)->createQueryBuilder('participation')
            ->leftJoin('participation.ticket', 'ticket')->addSelect('ticket')
            ->leftJoin('ticket.prize', 'prize')->addSelect('prize')
            ->leftJoin('participation.user', 'user')->addSelect('user')
            ->orderBy('participation.participationDate', 'DESC')
            ->getQuery()->getResult();

        return new JsonResponse(array_map(fn (Participation $participation): array => $this->serializeParticipation($participation), $participations));
    }

    #[Route('/api/participations/{id}', name: 'api_participations_show', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function show(int $id, #[CurrentUser] ?User $user, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $participation = $entityManager->getRepository(Participation::class)->find($id);
        if (!$participation instanceof Participation) {
            return new JsonResponse([], Response::HTTP_OK);
        }

        return new JsonResponse([$this->serializeParticipation($participation)]);
    }

    #[Route('/api/participations/my', name: 'api_participations_my', methods: ['GET'])]
    public function mine(#[CurrentUser] ?User $user, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $participations = $entityManager->getRepository(Participation::class)->createQueryBuilder('participation')
            ->leftJoin('participation.ticket', 'ticket')->addSelect('ticket')
            ->leftJoin('ticket.prize', 'prize')->addSelect('prize')
            ->andWhere('participation.user = :user')->setParameter('user', $user)
            ->orderBy('participation.participationDate', 'DESC')
            ->getQuery()->getResult();

        return new JsonResponse(array_map(fn (Participation $participation): array => $this->serializeParticipation($participation), $participations));
    }

    private function serializeParticipation(Participation $participation): array
    {
        $ticket = $participation->getTicket();
        $prize = $ticket->getPrize();

        return [
            'id' => $participation->getId(),
            'userId' => $participation->getUser()->getId(),
            'ticketId' => $ticket->getId(),
            'participationDate' => $participation->getParticipationDate()?->format(DATE_ATOM),
            'user' => [
                'id' => $participation->getUser()->getId(),
                'name' => $participation->getUser()->getName(),
                'email' => $participation->getUser()->getEmail(),
            ],
            'ticket' => [
                'id' => $ticket->getId(),
                'code' => $ticket->getCode(),
                'isUsed' => $ticket->isUsed(),
                'usedDate' => $ticket->getUsedDate()?->format(DATE_ATOM),
                'prizeId' => $prize->getId(),
                'prize' => $this->serializePrize($prize),
                'claims' => array_map(static fn ($claim): array => [
                    'id' => $claim->getId(),
                    'isDelivered' => $claim->isDelivered(),
                    'deliveryDate' => $claim->getDeliveryDate()?->format(DATE_ATOM),
                ], $ticket->getClaims()->toArray()),
            ],
        ];
    }

    private function serializePrize(Prize $prize): array
    {
        return [
            'id' => $prize->getId(),
            'name' => $prize->getName(),
            'description' => $prize->getDescription(),
            'imageUrl' => $prize->getImageUrl(),
            'value' => $prize->getValue(),
        ];
    }
}