<?php

namespace App\Tests\Migrations;

use App\Migrations\Version20261031192000;
use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Schema\Schema;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

final class InitialSchemaMigrationTest extends TestCase
{
    public function testInitialSchemaCanBeAppliedAndRolledBackOnSqlite(): void
    {
        $connection = DriverManager::getConnection(['driver' => 'pdo_sqlite', 'memory' => true]);
        $schema = new Schema();
        $migration = new Version20261031192000($connection, new NullLogger());

        $migration->up($schema);
        foreach ($schema->toSql($connection->getDatabasePlatform()) as $statement) {
            $connection->executeStatement($statement);
        }

        self::assertEqualsCanonicalizing(
            ['claims', 'participations', 'prizes', 'tickets', 'users', 'winner'],
            $connection->createSchemaManager()->listTableNames(),
        );

        $connection->close();
    }
}