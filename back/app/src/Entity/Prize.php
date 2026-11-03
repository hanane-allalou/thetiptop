<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'prizes')]
class Prize
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $name;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description;

    #[ORM\Column(name: 'image_url', length: 255, nullable: true)]
    private ?string $imageUrl;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true, options: ['default' => '0.00'])]
    private ?string $value;

    /** @var Collection<int, Ticket> */
    #[ORM\OneToMany(mappedBy: 'prize', targetEntity: Ticket::class)]
    private Collection $tickets;

    public function __construct(
        string $name,
        ?string $description = null,
        ?string $imageUrl = null,
        ?string $value = null,
    ) {
        $this->tickets = new ArrayCollection();
        $this->name = $name;
        $this->description = $description;
        $this->imageUrl = $imageUrl;
        $this->value = $value;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    /** @return Collection<int, Ticket> */
    public function getTickets(): Collection
    {
        return $this->tickets;
    }
}