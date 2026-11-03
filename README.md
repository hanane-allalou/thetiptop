# TheTipTop

Application composée d’une API Symfony, d’un site public React et d’une interface d’administration React/Vite.

## Prérequis

- PHP 8.2+ et Composer
- Node.js 20.18.0 et npm
- MySQL 8
- Docker Compose, uniquement pour lancer MySQL dans un conteneur

## Cloner le dépôt

```powershell
git clone https://github.com/hanane-allalou/thetiptop.git
cd thetiptop
```

## Installer et configurer

API Symfony :

```powershell
cd back/app
composer install
Copy-Item .env.local.example .env.local
```

Renseigne les identifiants MySQL et les secrets locaux dans `back/app/.env.local`. Pour utiliser la base MySQL fournie par Compose, renseigne aussi `DATABASE_ROOT_PASSWORD`, puis lance depuis `back/app` :

```powershell
docker compose --env-file .env.local up -d database
```

Si MySQL est déjà installé sur ta machine, cette étape Docker est inutile. Les instructions détaillées sur les migrations et les tests sont dans [le README de l’API](back/app/README.md).

Site public :

```powershell
cd front
npm ci
Copy-Item .env.example .env.local
```

Interface d’administration :

```powershell
cd admin/app
npm ci
Copy-Item .env.example .env.local
```

Les variables `REACT_APP_API_URL` et `VITE_API_URL` doivent pointer vers l’API Symfony, par défaut `http://localhost:8000`.

## Démarrer

Lance chaque commande dans un terminal séparé, depuis la racine du dépôt :

```powershell
cd back/app
php -S 127.0.0.1:8000 -t public public/index.php
```

```powershell
cd front
npm start
```

```powershell
cd admin/app
npm run dev
```

Le site public est disponible sur `http://localhost:3000`, l’interface d’administration sur `http://localhost:5173` et l’API sur `http://localhost:8000`.