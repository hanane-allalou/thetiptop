# Cahier des charges — Boutique de thés et recherche IA

**Version :** 1.0  
**Date :** 1 novembre 2026  
**Projet :** TheTipTop — évolution de la plateforme de jeu-concours vers une boutique en ligne

## 1. Contexte et objectif

La plateforme actuelle permet de participer à un jeu-concours au moyen de codes de tickets. Elle n’est pas une boutique : il n’y a pas encore de catalogue commercial, de panier, de paiement, de livraison ni de suivi de commandes.

L’objectif est d’ajouter la vente en ligne de thés et d’infusions tout en conservant le jeu-concours comme fonctionnalité distincte. Une recherche en langage naturel devra aider les visiteurs à trouver des produits à partir de leurs préférences, sans formuler de diagnostic ni de promesse médicale.

## 2. État de départ

- API : Symfony 7.4 dans `back/app`.
- Site public : React dans `front/`.
- Administration : React/Vite dans `admin/app/`.
- Les deux interfaces appellent l’API Symfony ; en développement, celle-ci est accessible sur `http://localhost:8000`.
- Les tables MySQL actuelles concernent les utilisateurs et le jeu-concours (`users`, `tickets`, `participations`, `prizes`, `claims`, `winner`). Elles sont séparées des futurs produits commerciaux.
- Le schéma actuel est baseliné dans Doctrine Migrations. Toute évolution de la base doit passer par de nouvelles migrations, sans synchronisation automatique destructive.
- Les tables de la base locale sont actuellement vides. Les parcours existants sont testés avec SQLite ; les tests sur données métier réelles nécessiteront des données de développement.

## 3. Périmètre fonctionnel

### Inclus

- Catalogue de thés et d’infusions, variantes commerciales, prix et stock.
- Recherche, filtres et pages de détail produit.
- Panier, validation de commande, paiement et suivi de commande.
- Gestion du catalogue, des stocks et des commandes dans l’administration.
- Recherche assistée par IA, fondée sur les données validées du catalogue.
- Conservation du jeu-concours actuel, indépendant des commandes.

### Hors périmètre initial

- Abonnements récurrents, programme de fidélité et tarifs professionnels.
- Vente sur des marketplaces externes.
- Conseils médicaux, diagnostic ou recommandation de traitement.
- Stockage des numéros de carte bancaire par TheTipTop.

## 4. Utilisateurs et droits

- **Visiteur** : consulter et rechercher les produits, gérer un panier temporaire et commencer une commande.
- **Client connecté** : commander, consulter ses commandes et gérer ses coordonnées.
- **Employé** : consulter les informations de préparation et mettre à jour les étapes de traitement autorisées.
- **Administrateur** : gérer produits, variantes, prix, stocks, commandes, contenus et paramètres commerciaux.

Chaque opération sensible doit être contrôlée côté API. Un client ne peut consulter que ses propres commandes ; les droits employés et administrateurs ne doivent pas être déduits d’une valeur envoyée par le navigateur.

## 5. Catalogue

### Fiche produit

Chaque produit commercial comporte au minimum :

- nom, slug, description courte et description détaillée ;
- catégorie (thé, infusion, coffret, accessoire) ;
- prix courant, devise, SKU et statut de publication ;
- images avec texte alternatif ;
- ingrédients et allergènes connus ;
- informations factuelles : origine, type de feuilles, arômes, présence et quantité connue de caféine ;
- conseils de préparation validés : quantité, température et durée d’infusion ;
- stock disponible et seuil d’alerte.

Les variantes (par exemple poids ou format de boîte) possèdent un SKU, un prix et un stock propres. Un produit masqué ou épuisé ne peut pas être ajouté au panier.

### Règles catalogue

- Prix stockés en unité monétaire entière (centimes) dans les nouveaux modèles de commande.
- Les textes marketing et attributs liés à la santé sont relus et validés avant publication.
- Le lot remporté dans le jeu-concours reste un `Prize` ; il ne devient jamais automatiquement un produit achetable.

## 6. Parcours d’achat

1. Le client consulte le catalogue et ouvre une fiche produit.
2. Il choisit une variante et une quantité ; l’API valide disponibilité et quantité maximale.
3. Le panier affiche sous-total, frais et total, avec la devise utilisée.
4. Le client saisit ou choisit une adresse de facturation et de livraison.
5. L’API recalcule prix, frais, taxes et stock côté serveur avant de créer le paiement.
6. Le client paie via une page hébergée par un prestataire de paiement.
7. Un webhook signé confirme le paiement ; l’API finalise la commande et réserve définitivement le stock.
8. Le client reçoit une confirmation et peut suivre l’état de sa commande.

L’abandon ou l’échec du paiement ne doit pas créer une commande payée. Les webhooks doivent être idempotents : recevoir deux fois le même événement ne crée ni double commande ni double décrément de stock.

### États de commande proposés

`pending_payment`, `paid`, `preparing`, `shipped`, `delivered`, `cancelled`, `refunded`.

Les transitions autorisées et leurs effets sur le stock doivent être explicites. Une annulation ou un remboursement ne supprime pas l’historique de commande.

## 7. Paiement, livraison et sécurité

- Utiliser un prestataire reconnu (choix recommandé pour le MVP : Stripe Checkout).
- Ne jamais stocker de numéro de carte, cryptogramme ou donnée de paiement sensible dans MySQL ou les logs.
- Vérifier la signature des webhooks et leur identifiant avant toute mise à jour de commande.
- Garder les clés secrètes côté serveur dans `.env.local` en développement et dans le gestionnaire de secrets du déploiement.
- Configurer pays desservis, modes de livraison, frais, seuil de livraison gratuite et délais avant lancement commercial.
- Réserver le stock de façon transactionnelle afin d’éviter la vente au-delà du stock disponible.
- Journaliser les changements d’état utiles sans enregistrer mots de passe, jetons de paiement ou données de carte.

## 8. Recherche classique

La boutique fournit une recherche textuelle et des filtres structurés : catégorie, prix, type de thé, présence de caféine, arôme, origine, ingrédients et disponibilité. Les résultats sont triés selon un ordre explicite (pertinence, nouveauté ou prix).

La recherche classique doit rester fonctionnelle si le fournisseur IA est indisponible.

## 9. Recherche assistée par IA

### Expérience attendue

Une barre de recherche accepte une phrase, par exemple : « Je cherche une infusion douce, sans caféine, à boire le soir ». L’API extrait les critères et renvoie une liste de produits réellement publiés, disponibles et compatibles avec les attributs renseignés.

### Comportement attendu

- Transformer la demande en critères de recherche compréhensibles et affichables : sans caféine, floral, fruité, origine, budget, moment de consommation.
- Utiliser une recherche hybride : filtres structurés et recherche textuelle, puis classement sémantique si nécessaire.
- Limiter les réponses aux produits et informations provenant du catalogue validé.
- Présenter les raisons factuelles d’une suggestion, par exemple « sans caféine selon la fiche produit » ou « arôme floral ».
- Proposer des questions de clarification lorsque la demande est ambiguë.
- Fournir une solution de repli vers la recherche classique en cas d’erreur, de latence ou d’indisponibilité du modèle.

### Garde-fous santé

Les termes « detox », « équilibre hormonal », « sommeil », « anxiété » ou autres demandes liées à la santé ne doivent pas entraîner de promesse thérapeutique. L’IA ne diagnostique pas et ne prétend pas qu’un produit soigne, détoxifie ou régule une fonction corporelle. Elle peut reformuler la demande en préférences non médicales et proposer uniquement des caractéristiques vérifiées. Toute allégation commerciale doit être validée avant d’être affichée.

### Données et confidentialité

- Envoyer au fournisseur IA uniquement le texte de recherche nécessaire, sans adresse, identité ou historique de commande.
- Ne pas utiliser les requêtes des clients pour entraîner un modèle sans consentement et cadre juridique explicites.
- Définir durée de conservation, journalisation, quotas, coût maximal et comportement en cas de dépassement.
- Évaluer les réponses sur un jeu de demandes représentatif, incluant des questions médicales et des tentatives d’injection d’instructions.

## 10. Administration

L’interface admin doit permettre aux utilisateurs autorisés de :

- créer, modifier, publier, dépublier et archiver un produit ;
- gérer variantes, SKU, prix, images, ingrédients et attributs de recherche ;
- ajuster le stock et consulter un journal des mouvements ;
- rechercher et filtrer les commandes ;
- changer les états de traitement et saisir un numéro de suivi ;
- consulter des indicateurs de ventes, de stock bas et d’échecs de paiement ;
- gérer les textes validés fournis à la recherche IA.

Les actions importantes (variation de prix/stock, remboursement, annulation) doivent être traçables avec auteur et date.

## 11. Modèle de données cible

Ajouter par migrations Doctrine, sans modifier les tables du jeu au-delà du nécessaire :

- `products` et `product_variants` ;
- `categories` ;
- `inventory_movements` ou un journal de stock équivalent ;
- `carts` et `cart_items` (ou panier local temporaire synchronisé à la connexion) ;
- `orders` et `order_items` avec instantanés du nom, SKU, prix et quantité ;
- `addresses` ;
- `payments` et références d’événements webhook ;
- `shipments` et informations de suivi.

Les commandes conservent leurs lignes même si le produit est ensuite renommé, dépublié ou archivé. Le catalogue et les prix du concours restent des domaines séparés.

## 12. API proposée

- `GET /api/products`, `GET /api/products/{slug}`, `GET /api/products/search?q=...` ;
- `GET|POST|PATCH|DELETE /api/cart/items` selon le modèle de panier retenu ;
- `POST /api/checkout/session` ;
- `POST /api/payments/webhook/{provider}` ;
- `GET /api/orders/mine`, `GET /api/orders/{id}` ;
- routes `ROLE_ADMIN` pour produits, variantes, stocks, commandes et remboursements ;
- `POST /api/ai/product-search` pour l’interprétation des demandes en langage naturel.

Les contrats précis (pagination, validation, erreurs et formats JSON) seront documentés avant l’implémentation de chaque module.

## 13. Découpage de réalisation

1. **Découverte produit** : confirmer pays, devise, taxes, catalogue initial, variantes, prestataire de paiement et règles de livraison.
2. **Catalogue** : modèles Doctrine, migrations, données de démonstration et pages liste/détail.
3. **Panier** : ajout, modification, suppression, recalcul côté serveur et gestion des visiteurs non connectés.
4. **Commande** : coordonnées, frais/taxes, instantané des lignes, réservation et libération du stock.
5. **Paiement** : session hébergée, webhooks signés/idempotents, confirmation, annulation et remboursement.
6. **Administration e-commerce** : gestion catalogue, stock et commandes, avec permissions et audit.
7. **Recherche IA** : commencer par extraction de critères et recherche hybride ; intégrer un fournisseur de modèle seulement après validation des garde-fous et du coût.
8. **Préproduction** : tests intégrés sur MySQL, clés de test du prestataire, tests navigateur et vérification sécurité/confidentialité.

Chaque phase doit être livrable et testable indépendamment. Le jeu-concours reste fonctionnel pendant l’ajout de la boutique.

## 14. Critères d’acceptation du MVP

- Un client peut parcourir les produits, filtrer, consulter les attributs et choisir une variante disponible.
- Le panier recalcule les prix côté API et refuse quantités invalides ou stock insuffisant.
- Un paiement de test confirmé par webhook crée une seule commande payée et décrémente le stock une seule fois.
- Un échec ou un abandon ne crée pas de commande payée et ne perd pas le stock sans règle de réservation explicite.
- Un client ne peut jamais consulter la commande d’un autre client.
- Un administrateur peut gérer catalogue/stock et suivre les commandes.
- Une demande IA ne retourne que des produits du catalogue et justifie chaque résultat avec des données validées.
- Les demandes médicales ne reçoivent ni diagnostic, ni promesse de guérison, ni affirmation non vérifiée.
- Les routes de jeu-concours et les tables existantes continuent de fonctionner indépendamment de la boutique.

## 15. Décisions à confirmer avant l’implémentation

- Pays de vente, devise et règles fiscales.
- Pays de livraison, transporteurs, tarifs et seuil de livraison offerte.
- Prestataire de paiement et statut juridique/compte marchand.
- Liste des produits, variantes, prix, stocks, ingrédients, allergènes et contenus validés.
- Création de compte obligatoire ou achat invité.
- Fournisseur IA, budget, région de traitement des données et durée de conservation des recherches.
- Formulation autorisée des contenus liés au bien-être, après validation réglementaire.