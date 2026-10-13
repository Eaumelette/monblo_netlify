CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_posted TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX blog_posts_date_posted_idx ON blog_posts (date_posted DESC);

-- Sessions Express (la mémoire d'une fonction serverless n'est pas persistante)
CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_expire_idx ON sessions (expire);

-- Données de démonstration (utilisateur : valentin / MotDePasse123)
INSERT INTO users (username, password) VALUES ('valentin', '$2a$10$BngF4CDqWEEhoPcXfke3JeU.SbWkxVH2hzheW4FyDm7jy28r7BbHO');

INSERT INTO blog_posts (title, body, user_id)
SELECT v.title, v.body, u.id FROM users u, (VALUES
  ('Bienvenue sur mon blog', '<p>Ceci est le <strong>premier article</strong> de mon blog réalisé avec Node.js, Express, EJS et Netlify Database.</p>'),
  ('Pourquoi EJS ?', '<p>EJS permet de générer du HTML dynamique en intégrant du JavaScript directement dans les vues.</p>'),
  ('Netlify Database', '<p>Netlify Database fournit une base <em>Postgres</em> entièrement gérée, sans configuration.</p>')
) AS v(title, body) WHERE u.username = 'valentin';
