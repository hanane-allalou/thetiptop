<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'claims')]
#[ORM\Index(name: 'idx_claims_user_id', columns: ['user_id'])]
#[ORM\Index(name: 'idx_claims_ticket_id', columns: ['ticket_id'])]
class Claim
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: Ticket::class, inversedBy: 'claims')]
    #[ORM\JoinColumn(name: 'ticket_id', nullable: false, onDelete: 'CASCADE')]
    private Ticket $ticket;

    #[ORM\Column(name: 'claimed_at', type: 'datetime_immutable', nullable: true, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $claimedAt;

    #[ORM\Column(name: 'claimed_by_employee', length: 255, nullable: true)]
    private ?string $claimedByEmployee;

    #[ORM\Column(name: 'is_delivered', options: ['default' => false])]
    private bool $isDelivered;

    #[ORM\Column(name: 'delivery_date', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $deliveryDate;

    #[ORM\Column(type: 'text', nullable: true, columnDefinition: 'TEXT NULL')]
    private ?string $notes;

    public function __construct(User $user, Ticket $ticket, string $employee, ?string $notes, \DateTimeImmutable $date)
    {
        $this->user = $user;
        $this->ticket = $ticket;
        $this->claimedByEmployee = $employee;
        $this->notes = $notes;
        $this->claimedAt = $date;
        $this->deliveryDate = $date;
        $this->isDelivered = true;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isDelivered(): bool
    {
        return $this->isDelivered;
    }

    public function getClaimedAt(): ?\DateTimeImmutable
    {
        return $this->claimedAt;
    }

    public function getClaimedByEmployee(): ?string
    {
        return $this->claimedByEmployee;
    }

    public function getDeliveryDate(): ?\DateTimeImmutable
    {
        return $this->deliveryDate;
    }
}