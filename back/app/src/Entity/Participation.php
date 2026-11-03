<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'participations')]
#[ORM\UniqueConstraint(name: 'user_id', columns: ['user_id', 'ticket_id'])]
#[ORM\Index(name: 'idx_participations_user_id', columns: ['user_id'])]
#[ORM\Index(name: 'idx_participations_ticket_id', columns: ['ticket_id'])]
class Participation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: Ticket::class, inversedBy: 'participations')]
    #[ORM\JoinColumn(name: 'ticket_id', nullable: false, onDelete: 'CASCADE')]
    private Ticket $ticket;

    #[ORM\Column(name: 'participation_date', type: 'datetime_immutable', nullable: true, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $participationDate = null;

    public function __construct(User $user, Ticket $ticket, \DateTimeImmutable $participationDate)
    {
        $this->user = $user;
        $this->ticket = $ticket;
        $this->participationDate = $participationDate;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getTicket(): Ticket
    {
        return $this->ticket;
    }

    public function getParticipationDate(): ?\DateTimeImmutable
    {
        return $this->participationDate;
    }
}