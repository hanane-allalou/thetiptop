# Back Symfony

API du projet, construite avec Symfony 7.4 et PHP 8.2+.

## Configuration locale

Copier `.env.local.example` vers `.env.local`, puis renseigner les identifiants MySQL et remplacer `APP_SECRET`, `JWT_SECRET` et `JWT_REFRESH_SECRET` par des valeurs locales aléatoires. Ne pas utiliser les valeurs de développement de `.env` en production.

Pour OAuth local, enregistrer `http://localhost:8000/auth/google/redirect` et `http://localhost:8000/auth/facebook/redirect` comme callback URLs chez les fournisseurs, puis renseigner les IDs et secrets dans `.env.local`. En production, utiliser les domaines HTTPS correspondants.

Le serveur MySQL local utilise `127.0.0.1:3307`, base `tiptop`. Pour le démarrer dans Docker, configure `DATABASE_PASSWORD` et `DATABASE_ROOT_PASSWORD` dans `.env.local`, puis lance `docker compose --env-file .env.local up -d database` depuis ce dossier. Il contient les six tables métier préexistantes, actuellement sans lignes. La migration initiale a été enregistrée comme baseline dans `doctrine_migration_versions` sans exécuter de `CREATE TABLE`. Les tests fonctionnels utilisent SQLite isolée et ne modifient pas MySQL.

Sur cette base existante, ne pas lancer `doctrine:schema:update --force` : Doctrine signale encore des index redondants et une normalisation de colonnes ENUM, qui ne sont pas nécessaires au fonctionnement des endpoints. Pour une base neuve uniquement, la migration initiale crée les six tables.

## Lancer et tester

```powershell
php -S 127.0.0.1:8000 -t public public/index.php
```

Dans un autre terminal :

```powershell
php bin/console about
php bin/console doctrine:mapping:info
php bin/console doctrine:migrations:status
php bin/console doctrine:migrations:migrate
php vendor/bin/phpunit
php bin/console lint:container
```

La migration `Version20261031192000` décrit les tables `users`, `prizes`, `tickets`, `participations`, `claims` et `winner`. Pour une installation neuve uniquement, vérifier que le serveur MySQL est disponible et que `DATABASE_DB` désigne une base vide avant `doctrine:migrations:migrate`.

## Routes déjà portées

- `GET /` : endpoint de vérification du serveur Symfony.
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/refresh`, `GET /api/auth/profile` : authentification locale, JWT et cookie de renouvellement.
- `GET /auth/google`, `GET /auth/google/redirect`, `GET /auth/facebook`, `GET /auth/facebook/redirect` : OAuth2 et redirection vers le site public. Les tests vérifient les URL de départ ; le callback réel nécessite des identifiants fournisseur.
- `GET /api/prizes` et `GET /api/prizes/public` : lecture des lots.
- `POST /api/participations`, `GET /api/participations`, `GET /api/participations/{id}`, `GET /api/participations/my` : participation et historique.
- `GET /api/tickets/{id}` et `GET /api/tickets/{id}/delivered` : consultation de ticket.
- `GET /api/employee/ticket/{code}`, `GET /api/employee/search`, `GET /api/employee/search-winners`, `POST /api/employee/claim/{ticketId}` : recherche et remise de lots.
- `/api/admin/*` : statistiques, utilisateurs paginés, export CSV et gestion du grand gagnant.
- `GET|PATCH|DELETE /api/users/{id}` : profil propriétaire ou administrateur.
- `GET /metrics` : métriques Prometheus au format texte, stockées dans `var/prometheus.sqlite`.

Les routes CRUD de réclamations et la création/modification/suppression de tickets et de lots restent à implémenter. Le schéma MySQL existant est raccordé et baseliné ; les tables métier sont actuellement vides.