require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const BlogPost = require('./models/BlogPost');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/newBlog';

const DEMO_USER = 'valentin';
const DEMO_PASSWORD = 'MotDePasse123';

const DEMO_POSTS = [
  {
    title: 'Bienvenue sur mon blog',
    body: '<p>Ceci est le <strong>premier article</strong> de mon blog réalisé avec Node.js, Express, EJS et MongoDB.</p>'
  },
  {
    title: 'Pourquoi EJS ?',
    body: '<p>EJS permet de générer du HTML dynamique en intégrant du JavaScript directement dans les vues.</p>'
  },
  {
    title: 'MongoDB et Mongoose',
    body: '<p>Mongoose simplifie l\'accès à MongoDB en définissant des <em>schémas</em> et des modèles.</p>'
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connecté à', mongoose.connection.name);

  // Crée les index (dont l'unicité du nom d'utilisateur)
  await User.init();
  await BlogPost.init();

  // Utilisateur de démonstration
  let user = await User.findOne({ username: DEMO_USER });
  if (!user) {
    user = await User.create({ username: DEMO_USER, password: DEMO_PASSWORD });
    console.log('Utilisateur créé :', DEMO_USER);
  } else {
    console.log('Utilisateur déjà présent :', DEMO_USER);
  }

  // Articles de démonstration
  const existingPosts = await BlogPost.countDocuments();
  if (existingPosts === 0) {
    await BlogPost.create(
      DEMO_POSTS.map((post) => ({ ...post, image: '', userid: user._id }))
    );
    console.log(DEMO_POSTS.length + ' articles créés');
  } else {
    console.log(existingPosts + ' article(s) déjà présent(s)');
  }

  const counts = {
    users: await User.countDocuments(),
    blogposts: await BlogPost.countDocuments()
  };
  console.log('Collections :', counts);

  await mongoose.disconnect();
  console.log('Base de données prête.');
}

seed().catch((error) => {
  console.error('Erreur lors du seed :', error.message);
  process.exit(1);
});
