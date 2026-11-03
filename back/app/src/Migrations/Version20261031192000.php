<?php

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261031192000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create the initial TheTipTop schema for users, prizes, tickets, participations, claims and winners.';
    }

    public function up(Schema $schema): void
    {
        $users = $schema->createTable('users');
        $users->addColumn('id', 'integer', ['autoincrement' => true]);
        $users->addColumn('name', 'string', ['length' => 255]);
        $users->addColumn('email', 'string', ['length' => 255]);
        $users->addColumn('password', 'string', ['length' => 255]);
        $users->addColumn('provider_id', 'string', ['length' => 255, 'notnull' => false]);
        $users->addColumn('avatar', 'string', ['length' => 255, 'notnull' => false]);
        $users->addColumn('gender', 'string', ['length' => 16, 'notnull' => false]);
        $users->addColumn('opt_in_email', 'boolean', ['default' => false]);
        $users->addColumn('age', 'integer', ['notnull' => false]);
        $users->addColumn('city', 'string', ['length' => 100, 'notnull' => false]);
        $users->addColumn('occupation', 'string', ['length' => 100, 'notnull' => false]);
        $users->addColumn('registration_method', 'string', ['length' => 32, 'notnull' => false, 'default' => 'formulaire']);
        $users->addColumn('created_at', 'datetime', ['notnull' => false, 'default' => 'CURRENT_TIMESTAMP']);
        $users->addColumn('updated_at', 'datetime', ['notnull' => false, 'default' => 'CURRENT_TIMESTAMP']);
        $users->addColumn('role', 'string', ['length' => 16, 'default' => 'client']);
        $users->setPrimaryKey(['id']);
        $users->addUniqueIndex(['email'], 'uniq_users_email');
        $users->addIndex(['provider_id'], 'idx_users_provider_id');

        $prizes = $schema->createTable('prizes');
        $prizes->addColumn('id', 'integer', ['autoincrement' => true]);
        $prizes->addColumn('name', 'string', ['length' => 100]);
        $prizes->addColumn('description', 'string', ['length' => 255, 'notnull' => false]);
        $prizes->addColumn('image_url', 'string', ['length' => 255, 'notnull' => false]);
        $prizes->addColumn('value', 'decimal', ['precision' => 10, 'scale' => 2, 'notnull' => false, 'default' => '0.00']);
        $prizes->setPrimaryKey(['id']);

        $tickets = $schema->createTable('tickets');
        $tickets->addColumn('id', 'integer', ['autoincrement' => true]);
        $tickets->addColumn('code', 'string', ['length' => 10]);
        $tickets->addColumn('user_id', 'integer', ['notnull' => false]);
        $tickets->addColumn('prize_id', 'integer');
        $tickets->addColumn('is_used', 'boolean', ['default' => false]);
        $tickets->addColumn('created_at', 'datetime', ['notnull' => false, 'default' => 'CURRENT_TIMESTAMP']);
        $tickets->addColumn('used_date', 'datetime_immutable', ['notnull' => false]);
        $tickets->setPrimaryKey(['id']);
        $tickets->addUniqueIndex(['code'], 'uniq_tickets_code');
        $tickets->addIndex(['user_id'], 'idx_tickets_user_id');
        $tickets->addIndex(['prize_id'], 'idx_tickets_prize_id');
        $tickets->addForeignKeyConstraint('users', ['user_id'], ['id'], ['onDelete' => 'SET NULL'], 'fk_tickets_user');
        $tickets->addForeignKeyConstraint('prizes', ['prize_id'], ['id'], ['onDelete' => 'RESTRICT'], 'fk_tickets_prize');

        $participations = $schema->createTable('participations');
        $participations->addColumn('id', 'integer', ['autoincrement' => true]);
        $participations->addColumn('user_id', 'integer');
        $participations->addColumn('ticket_id', 'integer');
        $participations->addColumn('participation_date', 'datetime_immutable', ['notnull' => false, 'default' => 'CURRENT_TIMESTAMP']);
        $participations->setPrimaryKey(['id']);
        $participations->addUniqueIndex(['user_id', 'ticket_id'], 'uniq_participations_user_ticket');
        $participations->addIndex(['ticket_id'], 'idx_participations_ticket_id');
        $participations->addForeignKeyConstraint('users', ['user_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_participations_user');
        $participations->addForeignKeyConstraint('tickets', ['ticket_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_participations_ticket');

        $claims = $schema->createTable('claims');
        $claims->addColumn('id', 'integer', ['autoincrement' => true]);
        $claims->addColumn('user_id', 'integer');
        $claims->addColumn('ticket_id', 'integer');
        $claims->addColumn('claimed_at', 'datetime_immutable', ['notnull' => false, 'default' => 'CURRENT_TIMESTAMP']);
        $claims->addColumn('claimed_by_employee', 'string', ['length' => 255, 'notnull' => false]);
        $claims->addColumn('is_delivered', 'boolean', ['default' => false]);
        $claims->addColumn('delivery_date', 'datetime_immutable', ['notnull' => false]);
        $claims->addColumn('notes', 'text', ['notnull' => false]);
        $claims->setPrimaryKey(['id']);
        $claims->addIndex(['user_id'], 'idx_claims_user_id');
        $claims->addIndex(['ticket_id'], 'idx_claims_ticket_id');
        $claims->addForeignKeyConstraint('users', ['user_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_claims_user');
        $claims->addForeignKeyConstraint('tickets', ['ticket_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_claims_ticket');

        $winners = $schema->createTable('winner');
        $winners->addColumn('id', 'integer', ['autoincrement' => true]);
        $winners->addColumn('participationId', 'integer');
        $winners->addColumn('prizeDescription', 'string', ['length' => 255]);
        $winners->addColumn('prizeValue', 'decimal', ['precision' => 10, 'scale' => 2]);
        $winners->addColumn('drawDate', 'datetime_immutable');
        $winners->addColumn('claimedDate', 'datetime_immutable', ['notnull' => false]);
        $winners->setPrimaryKey(['id']);
        $winners->addUniqueIndex(['participationId'], 'uniq_winner_participation');
        $winners->addForeignKeyConstraint('participations', ['participationId'], ['id'], ['onDelete' => 'CASCADE'], 'fk_winner_participation');
    }

    public function down(Schema $schema): void
    {
        foreach (['winner', 'claims', 'participations', 'tickets', 'prizes', 'users'] as $table) {
            if ($schema->hasTable($table)) {
                $schema->dropTable($table);
            }
        }
    }
}