# Mon Blog (Netlify)

Blog **Node.js / Express / EJS** déployé en **serverless sur Netlify**, avec les données stockées dans **Netlify Database** (Postgres géré par Netlify).

L'application Express est emballée dans une **Netlify Function** au format moderne (Request → Response).

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (mots de passe hachés avec bcrypt)
- **CRUD articles** : créer, lire, modifier, supprimer
- **Image à la une** encodée en base64 (compatible serverless, aucun stockage disque)
- **Validation** côté serveur (titre et contenu obligatoires)
- **Vues EJS** avec layouts (header / navbar / footer)

## Base de données

La base est fournie par **Netlify Database** : aucune chaîne de connexion ni service externe à configurer.
Le schéma est défini par les migrations SQL de `netlify/database/migrations/`, appliquées automatiquement
par Netlify à chaque déploiement. La première migration crée les tables `users`, `blog_posts` et `sessions`
et insère des données de démonstration.

Pour modifier le schéma, ajoutez un **nouveau** fichier de migration (ne modifiez jamais une migration déjà appliquée).

| Point | Solution serverless |
|---|---|
| Sessions | stockées dans la table `sessions` (la mémoire d'une fonction n'est pas persistante) |
| Upload d'image | data URI base64 stockée en base |
| Entrée HTTP | `netlify/functions/api.mjs` (format moderne) |
| Routage | `config.path = "/*"` avec priorité aux fichiers statiques |
| Vues | dossier `views/` embarqué dans la fonction (`included_files`) |

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus récent
- Le CLI Netlify (`npm i -g netlify-cli`), lié au site (`netlify link`)

## Lancer en local

```bash
npm install
cp .env.example .env
netlify dev        # http://localhost:8888
```

`netlify dev` fournit automatiquement l'accès à la base de données.

## Déploiement sur Netlify

1. Pousser le code sur la branche `master` : Netlify construit le site, applique les migrations puis publie.
2. **Variables d'environnement** recommandées (Site settings → Environment variables) :

   | Clé | Valeur |
   |---|---|
   | `SESSION_SECRET` | une chaîne secrète aléatoire |

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
├── netlify/database/migrations/ # Migrations SQL (appliquées au déploiement)
├── app.js                     # Configuration Express et routes
├── db/                        # Connexion Netlify Database + store de sessions
├── controllers/               # Logique des routes
├── middleware/                # Auth, validation, redirection
├── models/                    # Accès aux données (User, BlogPost)
├── views/                     # Templates EJS + layouts
└── public/                    # Fichiers statiques servis par le CDN
```

## Notes techniques

- **Images** : converties en data URI côté client (FileReader) puis stockées en base (limite 2 Mo).
- **Cookies** : `secure` activé automatiquement quand la requête arrive en HTTPS, `trust proxy` activé pour le proxy Netlify.
- **Limite de payload** : Netlify Functions accepte ~6 Mo par requête ; l'image est plafonnée à 2 Mo.

## Licence

Projet personnel à but pédagogique.
