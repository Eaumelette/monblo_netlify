const serverless = require('serverless-http');
const app = require('../../app');

// Point d'entrée de la fonction Netlify : l'application Express est emballée
// dans un handler serverless.
module.exports.handler = serverless(app);
