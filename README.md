# Mon Blog (Netlify)

Blog **Node.js / Express / EJS / MongoDB** adapté pour un déploiement **serverless sur Netlify**.

L'application Express est emballée dans une **Netlify Function** via [`serverless-http`](https://github.com/dougmoscrop/serverless-http).
Aucune réécriture des vues ou des routes n'a été nécessaire : seule l'infrastructure (sessions, upload d'images, connexion à la base) a été adaptée au modèle serverless.

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (mots de passe hachés avec bcrypt)
- **CRUD articles** : créer, lire, modifier, supprimer
- **Image à la une** encodée en base64 (compatible serverless, aucun stockage disque)
- **Validation** côté serveur (titre et contenu obligatoires)
- **Vues EJS** avec layouts (header / navbar / footer)
- **Script de seed** pour peupler la base

## Différences avec la version "serveur classique"

| Point | Version classique | Version Netlify |
|---|---|---|
| Exécution | serveur Node permanent | fonction serverless (à la demande) |
| Sessions | `MemoryStore` | **`connect-mongo`** (stockées dans MongoDB) |
| Connexion Mongo | à chaque démarrage | **mise en cache** entre invocations (`global.__mongoose`) |
| Upload d'image | écriture dans `public/images/` | **data URI base64** stockée en base |
| Entrée HTTP | `bin/www` (`http.createServer`) | `netlify/functions/api.js` (`serverless-http`) |
| Routage | Express seul | Express + redirection Netlify `/*` → fonction |

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus récent
- Une base **MongoDB Atlas** (obligatoire en production)
- Le CLI Netlify (`npm i -g netlify-cli`) pour tester localement

## Installation

```bash
git clone https://github.com/Eaumelette/monblo_netlify.git
cd monblo_netlify
npm install
cp .env.example .env
```

Renseignez `.env` :

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/newBlog?retryWrites=true&w=majority
SESSION_SECRET=une-chaine-longue-et-aleatoire
NODE_ENV=development
```

## Lancer en local

Deux options :

```bash
# 1. Serveur Node classique (http://localhost:3000)
npm run seed      # une fois, pour les données de démo
npm start

# 2. Environnement Netlify complet, fonctions incluses (http://localhost:8888)
netlify dev
```

## Déploiement sur Netlify

1. **Créer la base** sur [MongoDB Atlas](https://www.mongodb.com/atlas) (cluster gratuit M0).
   Dans *Network Access*, autorisez `0.0.0.0/0` (ou les IP Netlify), et créez un utilisateur de base de données.
2. **Pousser le code** sur GitHub / GitLab.
3. Sur [Netlify](https://app.netlify.com) : **Add new site → Import an existing project** et sélectionnez le dépôt.
   Netlify détecte le `netlify.toml` (publish `public`, functions `netlify/functions`).
4. **Variables d'environnement** (Site settings → Environment variables) :

   | Clé | Valeur |
   |---|---|
   | `MONGO_URI` | votre URI Atlas |
   | `SESSION_SECRET` | une chaîne secrète aléatoire |
   | `NODE_ENV` | `production` |

5. **Deploy**.
6. **Peupler la base** (une fois) depuis votre machine, avec l'URI Atlas dans `.env` :

   ```bash
   npm run seed
   ```

### Compte de démonstration

- **Utilisateur** : `valentin`
- **Mot de passe** : `MotDePasse123`

## Routes principales

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/` | Liste des articles |
| `GET` | `/post/:id` | Détail d'un article |
| `GET` | `/posts/new` | Formulaire de création (auth) |
| `POST` | `/posts/store` | Enregistrer un article (auth) |
| `GET` | `/posts/:id/edit` | Formulaire d'édition (auth) |
| `POST` | `/posts/:id/edit` | Mettre à jour un article (auth) |
| `POST` | `/posts/:id/delete` | Supprimer un article (auth) |
| `GET` | `/auth/register` · `/auth/login` · `/auth/logout` | Authentification |
| `GET` | `/about` · `/contact` | Pages statiques |

## Structure du projet

```
monblo_netlify/
├── netlify.toml              # Config Netlify (build, functions, redirects)
├── netlify/
│   └── functions/api.js       # Fonction serverless (wrapper Express)
├── bin/www                    # Serveur local (npm start)
├── app.js                     # Configuration Express et routes
├── seed.js                    # Peuplement de la base
├── controllers/               # Logique des routes
├── middleware/                # Auth, validation, redirection
├── models/                    # Schémas Mongoose (User, BlogPost)
├── views/                     # Templates EJS + layouts
└── public/                    # Fichiers statiques servis par le CDN
```

## Notes techniques

- **Connexion MongoDB** : mise en cache dans `global.__mongoose` pour éviter d'épuiser le pool de connexions entre invocations.
- **Sessions** : stockées dans MongoDB (`connect-mongo`), car la mémoire de la fonction n'est pas persistante.
- **Images** : converties en data URI côté client (FileReader) puis stockées dans le document Mongo (limite 2 Mo). Évite toute écriture disque, impossible en serverless.
- **Cookies** : `secure` activé automatiquement quand `NODE_ENV=production` (Netlify sert en HTTPS), `trust proxy` activé pour le proxy Netlify.
- **Limite de payload** : Netlify Functions accepte ~6 Mo par requête ; l'image est plafonnée à 2 Mo.

## Licence

Projet personnel à but pédagogique.
