# Mon Blog (Netlify)

Blog **Node.js / Express / EJS** déployé en **serverless sur Netlify**, avec les données stockées dans
**Netlify Database** (Postgres entièrement géré par Netlify).

L'application Express est exposée par une **Netlify Function au format moderne** (web `Request` → `Response`),
définie dans `netlify/functions/api.mjs`. Chaque requête est rejouée sur l'application Express via
[`light-my-request`](https://github.com/fastify/light-my-request), sans serveur Node permanent.

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (mots de passe hachés avec bcrypt)
- **CRUD articles** : créer, lire, modifier, supprimer
- **Image à la une** encodée en base64 (compatible serverless, aucun stockage disque)
- **Validation** côté serveur (titre et contenu obligatoires)
- **Vues EJS** avec layouts (header / navbar / footer)

## Base de données

La base est fournie par **Netlify Database** : aucune chaîne de connexion ni service externe à configurer.
Le code l'obtient via le paquet `@netlify/database` (`getDatabase()`), disponible automatiquement dans les
fonctions Netlify.

Le schéma est décrit par les migrations SQL de `netlify/database/migrations/`, **appliquées automatiquement
par Netlify** avant chaque mise en production (et à chaque deploy preview). La première migration crée les
tables `users`, `blog_posts` et `sessions`, et insère des données de démonstration.

> Pour faire évoluer le schéma, ajoutez un **nouveau** fichier de migration nommé
> `<nombre>_<slug>.sql` (ne modifiez jamais une migration déjà appliquée).

| Point | Solution serverless |
|---|---|
| Sessions | stockées dans la table `sessions` (`express-session` + store maison) |
| Upload d'image | data URI base64 stockée en base |
| Entrée HTTP | `netlify/functions/api.mjs` (format moderne Request → Response) |
| Routage | `config.path = "/*"` avec priorité aux fichiers statiques |
| Vues | dossier `views/` embarqué dans la fonction (`included_files`) |
| Bundler | **zisi** (défaut) et **non** esbuild : esbuild convertirait les dépendances CJS en ESM et casserait leurs `require()` dynamiques |

## Prérequis

- [Node.js](https://nodejs.org/) 22 (voir `.nvmrc`)
- Le CLI Netlify : `npm install -g netlify-cli`
- Un projet Netlify avec **Netlify Database activée** (offre credit-based)

## Installation

```bash
npm install
cp .env.example .env
```

## Lancer en local

```bash
netlify link       # (une fois) relie le dossier au projet Netlify et à sa base
netlify dev        # http://localhost:8888  ← recommandé
```

`netlify dev` reproduit l'environnement Netlify (fonctions, redirections, accès à la base de données).
Il faut donc l'utiliser plutôt que `npm start`.

> `npm start` (serveur Express classique sur le port 3000) ne sert qu'aux pages **sans accès à la base**
> (À propos, Contact, Connexion). Sans environnement Netlify, toute requête SQL échoue avec
> `MissingDatabaseConnectionError`.

## Déploiement sur Netlify

1. **Activer Netlify Database** sur le projet (Cloud compute → Database). C'est prérequis au fonctionnement.
2. Pousser le code sur la branche de production : Netlify installe les dépendances, applique les migrations,
   puis publie le site.
3. **Variables d'environnement** recommandées (Project configuration → Environment variables) :

   | Clé | Valeur |
   |---|---|
   | `SESSION_SECRET` | une chaîne secrète et aléatoire |
   | `NODE_ENV` | `production` |

   La connexion à la base (`NETLIFY_DB_URL`) est injectée automatiquement par Netlify : rien à définir.

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
├── netlify.toml                     # Config Netlify (build, functions, included_files)
├── netlify/
│   ├── functions/api.mjs            # Fonction serverless (format moderne)
│   └── database/migrations/         # Migrations SQL appliquées au déploiement
├── app.js                           # Configuration Express et routes
├── bin/www                          # Serveur Express local (non utilisé en prod)
├── db/                              # Connexion Netlify Database + store de sessions
│   ├── index.js
│   └── sessionStore.js
├── lib/parseImage.js                # Validation de l'image (data URI)
├── controllers/                     # Logique des routes
├── middleware/                      # Auth, validation, redirection
├── models/                          # Accès aux données (User, BlogPost)
├── views/                           # Templates EJS + layouts
└── public/                          # Fichiers statiques servis par le CDN
```

## Notes techniques

- **Connexion à la base** : mise en cache dans `db/index.js` pour être réutilisée entre les invocations.
- **Sessions** : persistées dans la table `sessions` (la mémoire d'une fonction serverless n'est pas conservée).
- **Images** : converties en data URI côté client (`FileReader`) puis stockées en base (limite 2 Mo).
- **Cookies** : `secure: "auto"` (activé dès que la requête arrive en HTTPS) et `trust proxy` activé pour le proxy Netlify.
- **Payload** : Netlify Functions accepte ~6 Mo par requête (≈ 4,5 Mo après encodage base64) ; l'image est plafonnée à 2 Mo.

## Licence

Projet personnel à but pédagogique.
