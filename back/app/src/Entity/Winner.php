<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'winner')]
#[ORM\UniqueConstraint(name: 'REL_f46fcdfdd7b634a68387610907', columns: ['participationId'])]
class Winner
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Participation::class)]
    #[ORM\JoinColumn(name: 'participationId', nullable: false)]
    private Participation $participation;

    #[ORM\Column(name: 'prizeDescription', length: 255)]
    private string $prizeDescription;

    #[ORM\Column(name: 'prizeValue', type: 'decimal', precision: 10, scale: 2)]
    private string $prizeValue;

    #[ORM\Column(name: 'drawDate', type: 'datetime_immutable')]
    private \DateTimeImmutable $drawDate;

    #[ORM\Column(name: 'claimedDate', type: 'datetime_immutable', nullable: true, columnDefinition: 'TIMESTAMP NULL DEFAULT NULL')]
    private ?\DateTimeImmutable $claimedDate = null;

    public function __construct(Participation $participation, string $prizeDescription, string $prizeValue, \DateTimeImmutable $drawDate)
    {
        $this->participation = $participation;
        $this->prizeDescription = $prizeDescription;
        $this->prizeValue = $prizeValue;
        $this->drawDate = $drawDate;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getParticipation(): Participation
    {
        return $this->participation;
    }

    public function getPrizeDescription(): string
    {
        return $this->prizeDescription;
    }

    public function getPrizeValue(): string
    {
        return $this->prizeValue;
    }

    public function getDrawDate(): \DateTimeImmutable
    {
        return $this->drawDate;
    }

    public function getClaimedDate(): ?\DateTimeImmutable
    {
        return $this->claimedDate;
    }

    public function claim(\DateTimeImmutable $date): void
    {
        $this->claimedDate = $date;
    }
}