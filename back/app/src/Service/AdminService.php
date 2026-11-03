<?php

namespace App\Service;

use App\Entity\Claim;
use App\Entity\Participation;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Winner;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class AdminService
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function statistics(): array
    {
        $ticketRepository = $this->entityManager->getRepository(Ticket::class);
        $users = $this->entityManager->getRepository(User::class)->findAll();
        $totalTickets = $ticketRepository->count([]);
        $usedTickets = $ticketRepository->count(['isUsed' => true]);

        $distribution = $this->entityManager->createQueryBuilder()
            ->select('prize.name AS prizeName', 'COUNT(ticket.id) AS count')
            ->from(Ticket::class, 'ticket')
            ->innerJoin('ticket.prize', 'prize')
            ->andWhere('ticket.isUsed = true')
            ->groupBy('prize.name')
            ->getQuery()->getArrayResult();

        $genderRows = $this->entityManager->createQueryBuilder()
            ->select('user.gender AS name', 'COUNT(user.id) AS value')
            ->from(User::class, 'user')
            ->andWhere('user.gender IS NOT NULL')
            ->groupBy('user.gender')
            ->getQuery()->getArrayResult();
        $genderCounts = [];
        foreach ($genderRows as $row) {
            $genderCounts[$row['name']] = (int) $row['value'];
        }

        $ageCounts = [];
        foreach ($users as $user) {
            $age = $user->getAge();
            if ($age === null) {
                continue;
            }
            $group = match (true) {
                $age >= 18 && $age <= 25 => '18-25',
                $age >= 26 && $age <= 35 => '26-35',
                $age >= 36 && $age <= 45 => '36-45',
                $age >= 46 && $age <= 60 => '46-60',
                $age > 60 => '60+',
                default => 'Non spécifié',
            };
            $ageCounts[$group] = ($ageCounts[$group] ?? 0) + 1;
        }

        $since = new \DateTimeImmutable('-30 days');
        $dailyCounts = [];
        foreach ($this->entityManager->getRepository(Participation::class)->findAll() as $participation) {
            $date = $participation->getParticipationDate();
            if ($date !== null && $date >= $since) {
                $key = $date->format('Y-m-d');
                $dailyCounts[$key] = ($dailyCounts[$key] ?? 0) + 1;
            }
        }

        $dailyParticipation = [];
        for ($offset = 30; $offset >= 0; --$offset) {
            $date = (new \DateTimeImmutable('today'))->modify(sprintf('-%d days', $offset));
            $dailyParticipation[] = [
                'date' => $date->format('d/m'),
                'participants' => $dailyCounts[$date->format('Y-m-d')] ?? 0,
            ];
        }

        return [
            'totalTickets' => $totalTickets,
            'usedTickets' => $usedTickets,
            'totalPrizes' => $usedTickets,
            'totalClaims' => $this->entityManager->getRepository(Claim::class)->count([]),
            'users' => count($users),
            'prizeDistribution' => array_map(fn (array $row): array => [
                'name' => $row['prizeName'],
                'value' => (int) $row['count'],
                'color' => $this->prizeColor($row['prizeName']),
            ], $distribution),
            'dailyParticipation' => $dailyParticipation,
            'userDemographics' => [
                'gender' => array_map(static fn (string $name, int $value): array => compact('name', 'value'), array_keys($genderCounts), array_values($genderCounts)),
                'ageGroups' => array_map(static fn (string $name, int $value): array => compact('name', 'value'), array_keys($ageCounts), array_values($ageCounts)),
            ],
        ];
    }

    public function users(int $page, int $limit, ?string $search): array
    {
        if ($page < 1 || $limit < 1 || $limit > 100) {
            throw new BadRequestHttpException('Page et limit doivent être valides.');
        }

        $query = $this->entityManager->createQueryBuilder()
            ->select('user')
            ->from(User::class, 'user')
            ->andWhere('user.role != :admin')->setParameter('admin', 'admin')
            ->orderBy('user.createdAt', 'DESC');
        $countQuery = $this->entityManager->createQueryBuilder()
            ->select('COUNT(user.id)')
            ->from(User::class, 'user')
            ->andWhere('user.role != :admin')->setParameter('admin', 'admin');

        if ($search !== null && trim($search) !== '') {
            foreach ([$query, $countQuery] as $builder) {
                $builder->andWhere('(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)')
                    ->setParameter('search', '%' . mb_strtolower(trim($search)) . '%');
            }
        }

        $total = (int) $countQuery->getQuery()->getSingleScalarResult();
        $items = $query->setFirstResult(($page - 1) * $limit)->setMaxResults($limit)->getQuery()->getResult();

        return [
            'users' => array_map(fn (User $user): array => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'age' => $user->getAge() ?? 0,
                'gender' => $user->getGender() ?? 'Non spécifié',
                'participations' => $this->entityManager->getRepository(Ticket::class)->count(['user' => $user]),
                'claimsCount' => $this->entityManager->getRepository(Claim::class)->count(['user' => $user]),
                'optInEmail' => $user->getOptInEmail(),
                'registrationDate' => $user->getCreatedAt()?->format(DATE_ATOM) ?? '',
            ], $items),
            'total' => $total,
        ];
    }

    public function exportEmails(array $filters): string
    {
        $query = $this->entityManager->createQueryBuilder()
            ->select('user')
            ->from(User::class, 'user')
            ->andWhere('user.optInEmail = true');

        if (isset($filters['userIds'])) {
            $ids = is_array($filters['userIds']) ? array_values(array_filter($filters['userIds'], 'is_numeric')) : [];
            if ($ids === []) {
                return $this->csv([]);
            }
            $query->andWhere('user.id IN (:ids)')->setParameter('ids', $ids);
        }
        if (!empty($filters['gender']) && $filters['gender'] !== 'all') {
            $query->andWhere('user.gender = :gender')->setParameter('gender', $filters['gender']);
        }
        if (!empty($filters['ageGroup']) && $filters['ageGroup'] !== 'all') {
            if (!preg_match('/^(\d+)-(\d+)$/', $filters['ageGroup'], $matches)) {
                throw new BadRequestHttpException('Format ageGroup invalide. Attendu : "min-max"');
            }
            $query->andWhere('user.age BETWEEN :min AND :max')
                ->setParameter('min', (int) $matches[1])
                ->setParameter('max', (int) $matches[2]);
        }

        $users = $query->getQuery()->getResult();
        $rows = array_map(fn (User $user): array => [
            $user->getName(),
            $user->getEmail(),
            $user->getAge(),
            $user->getGender(),
            $this->entityManager->getRepository(Ticket::class)->count(['user' => $user]),
            $this->entityManager->getRepository(Claim::class)->count(['user' => $user]),
            $user->getOccupation(),
            'formulaire',
            $user->getOptInEmail() ? 'true' : 'false',
        ], $users);

        return $this->csv($rows);
    }

    public function drawWinner(): array
    {
        $description = 'Un an de thé';
        if ($this->entityManager->getRepository(Winner::class)->findOneBy(['prizeDescription' => $description])) {
            throw new BadRequestHttpException('Le tirage au sort pour "Un an de thé" a déjà été effectué.');
        }
        if (new \DateTimeImmutable() < new \DateTimeImmutable('2025-09-10T00:00:00+00:00')) {
            throw new BadRequestHttpException('Le tirage au sort n’est pas encore ouvert.');
        }

        $participations = $this->entityManager->getRepository(Participation::class)->findAll();
        if ($participations === []) {
            throw new BadRequestHttpException('Aucun participant trouvé pour le tirage au sort.');
        }

        $byUser = [];
        foreach ($participations as $participation) {
            $byUser[$participation->getUser()->getId()][] = $participation;
        }
        $userIds = array_keys($byUser);
        $selectedUser = $userIds[random_int(0, count($userIds) - 1)];
        $eligible = $byUser[$selectedUser];
        $participation = $eligible[random_int(0, count($eligible) - 1)];
        $winner = new Winner($participation, $description, '360.00', new \DateTimeImmutable());
        $this->entityManager->persist($winner);
        $this->entityManager->flush();

        return [
            'message' => 'Tirage au sort effectué avec succès !',
            'winner' => [
                'id' => $winner->getId(),
                'userName' => $participation->getUser()->getName(),
                'userEmail' => $participation->getUser()->getEmail(),
                'prize' => $winner->getPrizeDescription(),
                'value' => (float) $winner->getPrizeValue(),
                'drawDate' => $winner->getDrawDate()->format(DATE_ATOM),
            ],
        ];
    }

    public function claimGrandPrize(int $id): array
    {
        $winner = $this->entityManager->getRepository(Winner::class)->find($id);
        if (!$winner instanceof Winner) {
            throw new NotFoundHttpException(sprintf('Gagnant avec l’ID %d non trouvé.', $id));
        }
        if ($winner->getClaimedDate() !== null) {
            throw new BadRequestHttpException('Ce lot a déjà été réclamé.');
        }

        $winner->claim(new \DateTimeImmutable());
        $this->entityManager->flush();

        return ['message' => sprintf('Grand lot réclamé avec succès pour le gagnant ID %d.', $id)];
    }

    public function winners(?string $description = null): array
    {
        $query = $this->entityManager->createQueryBuilder()
            ->select('winner', 'participation', 'user', 'ticket')
            ->from(Winner::class, 'winner')
            ->innerJoin('winner.participation', 'participation')->addSelect('participation')
            ->innerJoin('participation.user', 'user')->addSelect('user')
            ->innerJoin('participation.ticket', 'ticket')->addSelect('ticket')
            ->orderBy('winner.drawDate', 'DESC');

        if ($description !== null && $description !== '') {
            $query->andWhere('LOWER(winner.prizeDescription) LIKE :description')
                ->setParameter('description', '%' . mb_strtolower($description) . '%');
        }

        return array_map(fn (Winner $winner): array => $this->serializeWinner($winner), $query->getQuery()->getResult());
    }

    public function grandPrizeWinner(): ?array
    {
        return $this->winners('Un an de thé')[0] ?? null;
    }

    private function serializeWinner(Winner $winner): array
    {
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
                'id' => $participation->getId(),
                'user' => ['id' => $user->getId(), 'name' => $user->getName(), 'email' => $user->getEmail()],
                'ticket' => ['id' => $ticket->getId(), 'code' => $ticket->getCode()],
            ],
        ];
    }

    private function csv(array $rows): string
    {
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, ['nom', 'email', 'age', 'genre', 'participations', 'lots_gagnes', 'occupation', 'registration_method', 'opt_in'], ';');
        foreach ($rows as $row) {
            fputcsv($stream, $row, ';');
        }
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }

    private function prizeColor(string $name): string
    {
        return match (mb_strtolower($name)) {
            'infuseur' => '#059669',
            'detox' => '#10b981',
            'signature' => '#34d399',
            'coffret_39' => '#6ee7b7',
            'coffret_69' => '#a7f3d0',
            default => '#059669',
        };
    }
}