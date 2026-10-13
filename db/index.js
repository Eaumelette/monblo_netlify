const { getDatabase } = require('@netlify/database');

// Connexion à Netlify Database (Postgres géré), configurée automatiquement
// par Netlify. Elle est créée à la première utilisation puis réutilisée
// entre les invocations de la fonction.
let database;

function getDb() {
  if (!database) {
    database = getDatabase();
  }
  return database;
}

// Raccourci : requête SQL paramétrée via un template literal
function sql(strings, ...values) {
  return getDb().sql(strings, ...values);
}

module.exports = { getDb, sql };
