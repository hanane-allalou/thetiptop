<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'email', columns: ['email'])]
#[ORM\UniqueConstraint(name: 'IDX_97672ac88f789774dd47f7c8be', columns: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 255)]
    private string $email;

    #[ORM\Column(length: 255)]
    private string $password;

    #[ORM\Column(name: 'provider_id', length: 255, nullable: true)]
    private ?string $providerId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(length: 16, nullable: true)]
    private ?string $gender = null;

    #[ORM\Column(name: 'opt_in_email', options: ['default' => false])]
    private bool $optInEmail = false;

    #[ORM\Column(nullable: true)]
    private ?int $age = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $occupation = null;

    #[ORM\Column(name: 'registration_method', length: 32, nullable: true, options: ['default' => 'formulaire'])]
    private ?string $registrationMethod = 'formulaire';

    #[ORM\Column(name: 'created_at', type: 'datetime', nullable: true, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: 'datetime', nullable: true, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(length: 16, options: ['default' => 'client'])]
    private string $role = 'client';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        return ['ROLE_' . strtoupper($this->role)];
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function eraseCredentials(): void
    {
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = mb_strtolower($email);
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getProviderId(): ?string
    {
        return $this->providerId;
    }

    public function setProviderId(?string $providerId): void
    {
        $this->providerId = $providerId;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function getAge(): ?int
    {
        return $this->age;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function getRegistrationMethod(): ?string
    {
        return $this->registrationMethod;
    }

    public function getOptInEmail(): bool
    {
        return $this->optInEmail;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setGender(?string $gender): void
    {
        $this->gender = $gender;
    }

    public function setAge(?int $age): void
    {
        $this->age = $age;
    }

    public function setCity(?string $city): void
    {
        $this->city = $city;
    }

    public function setOccupation(?string $occupation): void
    {
        $this->occupation = $occupation;
    }

    public function setAvatar(?string $avatar): void
    {
        $this->avatar = $avatar;
    }

    public function getOccupation(): ?string
    {
        return $this->occupation;
    }

    public function setOptInEmail(bool $optInEmail): void
    {
        $this->optInEmail = $optInEmail;
    }

    public function setRegistrationMethod(?string $registrationMethod): void
    {
        $this->registrationMethod = $registrationMethod;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): void
    {
        $this->role = $role;
    }
}