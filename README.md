<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
# Gestion de Commandes avec NestJS et MongoDB

Ce projet est une API backend développée avec le framework [NestJS](https://nestjs.com/) pour la gestion de commandes. Il interagit avec une base de données MongoDB et gère les opérations CRUD pour les collections **customers**, **orders**, et **products**. Le système comprend également une authentification des utilisateurs avec des tokens d'accès et de rafraîchissement.

## Fonctionnalités principales

- Authentification sécurisée (tokens JWT).
- Opérations CRUD sur les collections **customers**, **orders**, et **products**.
- Gestion des utilisateurs, des commandes, et des produits.
- Utilisation de variables d'environnement pour la configuration.

## Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur recommandé)
- [MongoDB](https://www.mongodb.com/) (local ou hébergé)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/votre-projet.git
   cd votre-projet
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet et ajoutez-y les clés nécessaires :
   ```env
   DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=3600
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRATION=86400
   PORT=3000
   ```

## Lancement de l'application

Démarrez le serveur en mode développement :

```bash
npm run start:dev
```

L'API sera accessible sur `http://localhost:3000`.

## Endpoints disponibles

### Authentification

- `POST /auth/login` : Connexion utilisateur.
- `POST /auth/logout` : Déconnexion utilisateur.

### Customers

- `GET /customers/all` : Récupérer tous les clients.
- `GET /customers/email/email?` : Rechercher un client par email.
- `GET /customers/customer/customerId?` : Récupérer un client par ID.
- `POST /customers/create` : Créer un nouveau client.
- `PUT /customers/update/customerId?` : Mettre à jour un client.
- `DELETE /customers/delete/customerId?` : Supprimer un client.

### Products

- `GET /products/all` : Récupérer tous les produits.
- `GET /products/productId?` : Récupérer un produit par ID.
- `POST /products/create` : Créer un nouveau produit.
- `PUT /products/update/productId?` : Mettre à jour un produit.
- `DELETE /products/delete/productId?` : Supprimer un produit.

### Orders

- `POST /orders/create` : Créer une nouvelle commande.
- `GET /orders/order/orderId?` : Récupérer une commande par ID.
- `GET /orders/user/customerId?` : Récupérer les commandes d'un client.
- `GET /orders/all` : Récupérer toutes les commandes.
- `PUT /orders/update/orderId?` : Mettre à jour une commande.
- `DELETE /orders/delete/orderId?` : Supprimer une commande.

## Dépendances principales

- **@nestjs/common** : Fonctionnalités principales de NestJS.
- **@nestjs/config** : Gestion des variables d'environnement.
- **@nestjs/jwt** : Gestion des tokens JWT.
- **mongodb** : Driver MongoDB pour Node.js.
- **argon2** : Hachage sécurisé des mots de passe.
- **cookie-parser** : Gestion des cookies.
- **joi** : Validation des données.

## Développement

Pour démarrer le projet en mode développement :

```bash
npm run start:dev
```
