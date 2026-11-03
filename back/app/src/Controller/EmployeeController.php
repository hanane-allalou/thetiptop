<?php

namespace App\Controller;

use App\Entity\Claim;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Winner;
use App\Service\PrometheusService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class EmployeeController
{
    #[Route('/api/employee/ticket/{code}', name: 'api_employee_ticket', methods: ['GET'])]
    public function ticket(string $code, EntityManagerInterface $entityManager): JsonResponse
    {
        if (strlen($code) !== 10) {
            return new JsonResponse(['message' => 'Code de ticket invalide'], Response::HTTP_BAD_REQUEST);
        }

        $ticket = $entityManager->getRepository(Ticket::class)->findOneBy(['code' => $code]);
        if (!$ticket instanceof Ticket) {
            return new JsonResponse(['message' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if (!$ticket->isUsed() || !$ticket->getUser() instanceof User) {
            return new JsonResponse(['message' => "Ce ticket n'a pas encore été utilisé"], Response::HTTP_BAD_REQUEST);
        }

        return new JsonResponse($this->serializeTicket($ticket, $entityManager));
    }

    #[Route('/api/employee/search', name: 'api_employee_search', methods: ['GET'])]
    public function search(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $term = trim((string) $request->query->get('query', ''));
        if (mb_strlen($term) < 2) {
            return new JsonResponse(['message' => 'Le terme de recherche doit contenir au moins 2 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        if (preg_match('/^[A-Za-z0-9]{10}$/', $term)) {
            $ticket = $entityManager->getRepository(Ticket::class)->findOneBy(['code' => $term]);
            if ($ticket instanceof Ticket) {
                if (!$ticket->isUsed() || !$ticket->getUser() instanceof User) {
                    return new JsonResponse(['message' => "Ce ticket n'a pas encore été utilisé"], Response::HTTP_BAD_REQUEST);
                }

                return new JsonResponse([$this->serializeTicket($ticket, $entityManager)]);
            }
        }

        $tickets = $entityManager->createQueryBuilder()
            ->select('ticket', 'user', 'prize')
            ->from(Ticket::class, 'ticket')
            ->innerJoin('ticket.user', 'user')->addSelect('user')
            ->innerJoin('ticket.prize', 'prize')->addSelect('prize')
            ->andWhere('ticket.isUsed = true')
            ->andWhere('(LOWER(user.name) LIKE :term OR LOWER(user.email) LIKE :term)')
            ->setParameter('term', '%' . mb_strtolower($term) . '%')
            ->getQuery()->getResult();

        return new JsonResponse(array_map(fn (Ticket $ticket): array => $this->serializeTicket($ticket, $entityManager), $tickets));
    }

    #[Route('/api/employee/search-winners', name: 'api_employee_search_winners', methods: ['GET'])]
    public function searchWinners(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $term = trim((string) $request->query->get('query', ''));
        if (mb_strlen($term) < 2) {
            return new JsonResponse(['message' => 'Le terme de recherche doit contenir au moins 2 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        $winners = $entityManager->createQueryBuilder()
            ->select('winner', 'participation', 'user', 'ticket')
            ->from(Winner::class, 'winner')
            ->innerJoin('winner.participation', 'participation')->addSelect('participation')
            ->innerJoin('participation.user', 'user')->addSelect('user')
            ->innerJoin('participation.ticket', 'ticket')->addSelect('ticket')
            ->andWhere('(LOWER(user.name) LIKE :term OR LOWER(user.email) LIKE :term OR LOWER(ticket.code) LIKE :term)')
            ->setParameter('term', '%' . mb_strtolower($term) . '%')
            ->getQuery()->getResult();

        return new JsonResponse(array_map(static function (Winner $winner): array {
            $participation = $winner->getParticipation();
            $user = $participation->getUser();
            $ticket = $participation->getTicket();

            return [
                'id' => $winner->getId(),
                'participationId' => $participation->getId(),
                'prizeDescription' => $winner->getPrizeDescription(),
                'prizeValue' => $winner->getPrizeValue(),
                'drawDate' => $winner->getDrawDate()->format(DATE_ATOM),
                'claimedDate' => $winner->getClaimedDate()?->format(DATE_ATOM),
                'participation' => [
                    'user' => ['id' => $user->getId(), 'name' => $user->getName(), 'email' => $user->getEmail()],
                    'ticket' => ['id' => $ticket->getId(), 'code' => $ticket->getCode()],
                ],
            ];
        }, $winners));
    }

    #[Route('/api/employee/claim/{ticketId}', name: 'api_employee_claim', methods: ['POST'], requirements: ['ticketId' => '\\d+'])]
    public function claim(int $ticketId, Request $request, #[CurrentUser] ?User $employee, EntityManagerInterface $entityManager, PrometheusService $prometheus): JsonResponse
    {
        if (!$employee instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $ticket = $entityManager->getRepository(Ticket::class)->find($ticketId);
        if (!$ticket instanceof Ticket) {
            return new JsonResponse(['message' => 'Lot invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!$ticket->isUsed() || !$ticket->getUser() instanceof User) {
            return new JsonResponse(['message' => "Ce ticket n'a pas encore été gagné et ne peut pas être revendiqué."], Response::HTTP_BAD_REQUEST);
        }

        if ($entityManager->getRepository(Claim::class)->findOneBy(['ticket' => $ticket])) {
            return new JsonResponse(['message' => 'Ce lot a déjà été revendiqué et remis.'], Response::HTTP_BAD_REQUEST);
        }

        $body = $request->getContent() === '' ? [] : $request->toArray();
        $notes = $body['notes'] ?? null;
        if ($notes !== null && !is_string($notes)) {
            return new JsonResponse(['message' => 'Notes invalides'], Response::HTTP_BAD_REQUEST);
        }

        $entityManager->persist(new Claim($ticket->getUser(), $ticket, $employee->getEmail(), $notes, new \DateTimeImmutable()));
        $entityManager->flush();
        $prometheus->prizeClaimed($ticketId);

        return new JsonResponse([
            'success' => true,
            'message' => 'Lot marqué comme remis avec succès',
        ], Response::HTTP_CREATED);
    }

    private function serializeTicket(Ticket $ticket, EntityManagerInterface $entityManager): array
    {
        $claim = $entityManager->getRepository(Claim::class)->findOneBy(['ticket' => $ticket]);
        $user = $ticket->getUser();
        $prize = $ticket->getPrize();

        return [
            'id' => $ticket->getId(),
            'ticketCode' => $ticket->getCode(),
            'prizeType' => $prize->getValue(),
            'prizeDescription' => $prize->getName(),
            'claimed' => $claim instanceof Claim,
            'claimedDate' => $claim?->getClaimedAt()?->format(DATE_ATOM),
            'claimedBy' => $claim?->getClaimedByEmployee(),
            'user' => [
                'name' => $user?->getName(),
                'email' => $user?->getEmail(),
                'phone' => $user?->getOccupation(),
            ],
        ];
    }
}