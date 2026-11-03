<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'tickets')]
#[ORM\UniqueConstraint(name: 'code', columns: ['code'])]
#[ORM\UniqueConstraint(name: 'IDX_c6e20a830c0f8b571abd331b77', columns: ['code'])]
#[ORM\Index(name: 'idx_tickets_code', columns: ['code'])]
#[ORM\Index(name: 'idx_tickets_user_id', columns: ['user_id'])]
#[ORM\Index(name: 'idx_tickets_prize_id', columns: ['prize_id'])]
class Ticket
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    private string $code;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Prize::class, inversedBy: 'tickets')]
    #[ORM\JoinColumn(name: 'prize_id', nullable: false, onDelete: 'RESTRICT')]
    private Prize $prize;

    #[ORM\Column(name: 'is_used', options: ['default' => false])]
    private bool $isUsed = false;

    #[ORM\Column(name: 'created_at', type: 'datetime', nullable: true, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(name: 'used_date', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $usedDate = null;

    /** @var Collection<int, Claim> */
    #[ORM\OneToMany(mappedBy: 'ticket', targetEntity: Claim::class)]
    private Collection $claims;

    /** @var Collection<int, Participation> */
    #[ORM\OneToMany(mappedBy: 'ticket', targetEntity: Participation::class)]
    private Collection $participations;

    public function __construct(string $code, Prize $prize)
    {
        $this->claims = new ArrayCollection();
        $this->participations = new ArrayCollection();
        $this->code = $code;
        $this->prize = $prize;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function getPrize(): Prize
    {
        return $this->prize;
    }

    public function isUsed(): bool
    {
        return $this->isUsed;
    }

    public function markUsed(User $user, \DateTimeImmutable $date): void
    {
        $this->user = $user;
        $this->isUsed = true;
        $this->usedDate = $date;
    }

    public function getUsedDate(): ?\DateTimeImmutable
    {
        return $this->usedDate;
    }

    /** @return Collection<int, Claim> */
    public function getClaims(): Collection
    {
        return $this->claims;
    }
}