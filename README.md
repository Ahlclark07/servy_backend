# Servy Backend (API)

Servy, c’est le backend que j’ai développé pour mon projet de soutenance en Licence : une plateforme locale de freelance “en présentiel” (menuiserie, plomberie, électricité, peinture, etc.). L’objectif était simple : permettre à un client de **trouver un artisan proche**, comparer des services, commander, puis suivre la prestation de bout en bout.

Ce dépôt contient l’API Node.js/Express + MongoDB (Mongoose), avec Firebase Auth côté authentification, des uploads médias (images/audio) et une base pour la monétisation (portefeuille + retraits, intégration FedaPay partiellement branchée).

## Ce que fait l’API (en clair)

| Bloc                  | Ce que j’ai construit                                                    | Où dans le code                                                      |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Auth & sessions       | Vérification des `idToken` Firebase et chargement de l’utilisateur en DB | `middleware/auth.js`, `config/firebase-config.js`                    |
| Utilisateurs          | Profil client, passage vendeur/vendeur pro, modération via demandes      | `controllers/front/*.js`, `models/user.js`, `models/demande.js`      |
| Catalogue             | Catégories + services (CRUD + activation)                                | `controllers/admin/adminController.js`, `models/*service*.js`        |
| Prestations           | Publication d’offres “service prestataire” avec médias, validation admin | `models/servicePrestataire.js`, `routes/users.js`, `routes/admin.js` |
| Commandes             | Création, statut, annulation, fin, évaluation                            | `models/commande.js`, `controllers/front/*Controller.js`             |
| Paiement (base)       | Stub FedaPay + callback qui passe la commande “en attente”               | `controllers/front/userController.js`                                |
| Portefeuille          | Montant disponible / en attente + demandes de retrait (modération)       | `models/portefeuille.js`, `models/retrait.js`                        |
| Notifications (prépa) | Enregistrement tokens FCM (admin ou user)                                | `models/fcmToken.js`, `controllers/front/userController.js`          |
| Uploads               | Stockage fichiers dans `public/uploads/...` (images/audio)               | `middleware/multer-config.js`                                        |
| “Proximité”           | Tri des vendeurs par distance (Haversine)                                | `utils/usefulFunctions.js`                                           |

## Démo rapide (local)

### 1) Installer / lancer

```bash
npm install
npm run start-dev
```

Serveur : `http://localhost:300` (par défaut).

### Scripts npm

| Script      | Commande            | Usage                 |
| ----------- | ------------------- | --------------------- |
| `start`     | `node ./bin/www`    | Démarrage “simple”    |
| `start-dev` | `nodemon ./bin/www` | Dev avec rechargement |

### 2) Configurer l’environnement (`.env`)

Le projet lit les variables d’environnement via `dotenv`. Le fichier `.env` n’est pas versionné.

| Variable                      | Utilité                                    | Exemple   |
| ----------------------------- | ------------------------------------------ | --------- |
| `PORT`                        | Port HTTP                                  | `300`     |
| `MONGO_USERNAME`              | User MongoDB Atlas                         | `myUser`  |
| `MONGO_PASSWORD`              | Mot de passe Atlas                         | `***`     |
| `FIREBASE_PROJECT_ID`…        | Credentials service account Firebase Admin | `...`     |
| `FEDAPAY_API_SECRET_KEY`      | (Optionnel) Paiement                       | `...`     |
| `FEDAPAY_ENVIRONMENT`         | `sandbox`/`live`                           | `sandbox` |
| `FEDAPAY_TRANSACTION_WEBHOOK` | (Optionnel) secret webhook                 | `...`     |

Exemple (minimal) :

```bash
PORT=300
MONGO_USERNAME=...
MONGO_PASSWORD=...
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_AUTH_PROVIDER_x509_CERT_URL=...
FIREBASE_CLIENT_x509_CERT_URL=...
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

Note MongoDB : la connexion actuelle est construite dans `app.js` et pointe vers Atlas. Elle ne fixe pas explicitement un nom de base (DB) dans l’URI (à adapter si besoin).

## Stack technique

| Sujet       | Choix                                                             |
| ----------- | ----------------------------------------------------------------- |
| API         | Express (`app.js`, `bin/www`)                                     |
| DB          | MongoDB + Mongoose                                                |
| Auth        | Firebase Admin SDK (vérification `idToken`)                       |
| Uploads     | Multer (stockage local dans `public/uploads`)                     |
| Logs        | Morgan                                                            |
| Date/format | Luxon                                                             |
| Images      | Sharp (présent, mais le middleware de resize n’est pas central)   |
| Vue         | Jade (principalement pages d’erreur héritées d’Express generator) |

## Architecture

```text
servy_backend/
  app.js
  bin/www
  routes/
    users.js
    admin.js
  controllers/
    front/
    admin/
  models/
  middleware/
  utils/
  public/uploads/
```

## Auth (Firebase)

La plupart des endpoints s’utilisent avec :

```http
Authorization: Bearer <FirebaseIdToken>
```

Ce token est vérifié, puis l’utilisateur MongoDB est chargé via `idFirebase` (UID Firebase). Le middleware renseigne `req.user` (avec `adresses` et `portefeuille` en `populate`).

## Uploads (médias)

Les fichiers sont enregistrés dans `public/uploads/...` et servis via `express.static('public')`.

| Type                | Champ(s) attendus                                         | Dossier                                                                                    |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Catégorie           | `image`                                                   | `public/uploads/images/categories`                                                         |
| Service             | `image`                                                   | `public/uploads/images/services`                                                           |
| Matériau            | `image`                                                   | `public/uploads/images/materiaux`                                                          |
| Profil vendeur      | `carteidentite`, `photodeprofil`, `attestationprofession` | `public/uploads/images/*`                                                                  |
| Service prestataire | `images` (multi), `audio` (optionnel)                     | `public/uploads/images/servicesprestataires`, `public/uploads/audios/servicesprestataires` |

Note : dans le code actuel, le champ d’attestation est déclaré côté upload en `attestationprofession` (minuscule), mais il est lu ailleurs avec une casse différente. Si tu intègres un front, standardise ce point (voir roadmap).

## API (vitrine)

Le projet expose 2 groupes : `users` (front) et `admin` (back-office).

### `/users` (front)

| Méthode | Route                                    | Auth | Description                                            |
| ------- | ---------------------------------------- | ---: | ------------------------------------------------------ |
| GET     | `/users/getUser`                         |  Oui | Récupérer l’utilisateur courant (+ demande éventuelle) |
| GET     | `/users/servicesList`                    |  Oui | Liste des services (catalogue)                         |
| GET     | `/users/vendeursProches`                 |  Oui | Vendeurs triés par proximité (via coordonnées)         |
| GET     | `/users/vendeursList`                    |  Non | Liste vendeurs (public)                                |
| GET     | `/users/servicesPrestatairesList`        |  Non | Liste d’offres validées (public)                       |
| GET     | `/users/getVendeurServiceBySearch/:nom`  |  Non | Recherche vendeurs + offres                            |
| POST    | `/users/becomeClient`                    |  Oui | Création du profil client en DB (à partir de Firebase) |
| POST    | `/users/becomeSeller`                    |  Oui | Demande de passage vendeur (pièces + modération)       |
| POST    | `/users/becomeProSeller`                 |  Oui | Demande “vendeur pro” (attestation + modération)       |
| PUT     | `/users/updateUserInfo`                  |  Oui | Mise à jour infos utilisateur                          |
| POST    | `/users/registerFcmToken`                |  Oui | Enregistrer un token FCM                               |
| POST    | `/users/materiel`                        |  Non | Créer/mettre à jour un matériau (image + infos)        |
| DELETE  | `/users/materiel`                        |  Non | Supprimer un matériau                                  |
| POST    | `/users/createserviceprestataire`        |  Oui | Publier une offre (images/audio)                       |
| GET     | `/users/getservicesofaprestataire/:id`   |  Non | Offres d’un prestataire                                |
| POST    | `/users/placeOrder`                      |  Oui | Créer une commande                                     |
| GET     | `/users/getOrder/:id`                    |  Oui | Détails d’une commande                                 |
| GET     | `/users/listOrder`                       |  Oui | Commandes côté vendeur                                 |
| GET     | `/users/clientListOrder`                 |  Oui | Commandes côté client                                  |
| GET     | `/users/listOrderByStatus/:statut`       |  Oui | Vendeur : commandes filtrées par statut                |
| GET     | `/users/clientListOrderByStatus/:statut` |  Oui | Client : commandes filtrées par statut                 |
| PATCH   | `/users/validateOrder/:id`               |  Oui | Vendeur : valider une commande                         |
| PATCH   | `/users/cancelOrder/:id`                 |  Oui | Vendeur : annuler                                      |
| PATCH   | `/users/clientCancelOrder/:id`           |  Oui | Client : annuler                                       |
| PATCH   | `/users/cancelOrderRequest/:id`          |  Oui | Client : demander l’annulation                         |
| PATCH   | `/users/endOrderRequest/:id`             |  Oui | Vendeur : demander la validation de fin                |
| PATCH   | `/users/endOrder/:id/:evaluation`        |  Oui | Client : terminer + noter                              |
| GET     | `/users/callback-paiement`               |  Non | Callback paiement (met statut à jour)                  |
| GET     | `/users/listcommandes`                   |  Oui | Liste des commandes du client (variante)               |
| POST    | `/users/makeRetrait`                     |  Oui | Vendeur : demander un retrait                          |
| GET     | `/users/getCategories`                   |  Non | Catégories actives                                     |
| GET     | `/users/getServicesByCat/:categorie`     |  Non | Offres par catégorie                                   |

### Exemples `curl`

Récupérer le profil (token Firebase requis) :

```bash
curl -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  http://localhost:300/users/getUser
```

Lister les catégories (public) :

```bash
curl http://localhost:300/users/getCategories
```

Créer une commande (exemple minimal, token requis) :

```bash
curl -X POST -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"service\":\"<servicePrestataireId>\"}" \
  http://localhost:300/users/placeOrder
```

### `/admin` (back-office)

Important : dans l’état actuel du code, ces routes ne sont pas protégées par un middleware “admin”. Le front admin était prévu pour tourner dans un contexte contrôlé (projet de soutenance), mais en production il faut ajouter une vraie protection.

| Domaine             | Exemples de routes                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catégories          | `GET /admin/getCategories/:nom/:skip`, `POST /admin/createCategorie`, `POST /admin/updateCategorie`, `GET /admin/supprimerCategorie/:id`, `GET /admin/updateCategorieState/:id` |
| Services            | `GET /admin/getServices/:nom/:skip`, `POST /admin/createService`, `POST /admin/updateService`, `GET /admin/supprimerService/:id`, `GET /admin/updateServiceState/:id`           |
| Offres prestataires | `GET /admin/getServicesPrestataire/:nom/:skip`, `POST /admin/updateServicePrestataireState`, `GET /admin/supprimerServicePrestataire/:id`                                       |
| Utilisateurs        | `GET /admin/getUsers/:role/:nom/:skip`, `GET /admin/getClientsEnTransition/:nom/:skip`, `GET /admin/updateUserState/:id`, `POST /admin/updateDemandeState`                      |
| Retraits            | `GET /admin/getRetraits/:nom/:skip`, `POST /admin/updateRetraitState`                                                                                                           |

## Modèle de données (Mongoose)

| Modèle               | À quoi il sert                   | Champs clés                                                      |
| -------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `User`               | Compte applicatif lié à Firebase | `idFirebase`, `role`, `adresses`, `portefeuille`, `enTransition` |
| `Adresse`            | Localisation d’un user           | `departement`, `ville`, `quartier`, `localisationMap`            |
| `CategorieDeService` | Catégories du catalogue          | `nom`, `description`, `image`, `actif`                           |
| `Service`            | Services d’une catégorie         | `nom`, `categorie`, `image`, `actif`                             |
| `ServicePrestataire` | Offre “vendable” d’un vendeur    | `service`, `vendeur`, `tarif`, `delai`, `images`, `verifie`      |
| `Commande`           | Commande d’un client             | `client`, `service`, `statut`, `id_transaction`, `evaluation`    |
| `Portefeuille`       | Comptabilité vendeur             | `montant`, `montantEnAttente`                                    |
| `Demande`            | Modération transition de rôle    | `user`, `status`, `message`                                      |
| `Retrait`            | Demande de retrait               | `vendeur`, `montant`, `etat`                                     |
| `FcmToken`           | Token de notification            | `user`, `token`, `isAdmin`                                       |

`localisationMap` : format attendu `"lat | long"` (ex: `"6.3703 | 2.3912"`).

## Paiement (FedaPay) : état actuel

Le code contient les briques pour créer une transaction FedaPay et rediriger vers une URL de paiement, mais le flux est partiellement commenté. Aujourd’hui :

- la commande est créée avec un `id_transaction` “temporaire”,
- `GET /users/callback-paiement` met la commande à `en_attente` et crédite `montantEnAttente` côté vendeur (90%).

## Ce que je ferais pour passer en prod (roadmap)

| Priorité | Amélioration                                                                      |
| -------: | --------------------------------------------------------------------------------- |
|       P0 | Protéger `/admin` (role-based access via Firebase claims)                         |
|       P0 | Réactiver et sécuriser le flux FedaPay (webhook + signature, id transaction réel) |
|       P1 | Corriger/normaliser certains champs d’upload (noms de champs cohérents)           |
|       P1 | CORS : appliquer la whitelist réellement (utiliser `corsOptions`)                 |
|       P2 | Tests API (supertest) + validation de payloads (zod/joi)                          |
