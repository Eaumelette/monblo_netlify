require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const homeController = require('./controllers/home');
const newPostController = require('./controllers/newPost');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const editPostController = require('./controllers/editPost');
const updatePostController = require('./controllers/updatePost');
const deletePostController = require('./controllers/deletePost');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

const validationMiddleware = require('./middleware/validationMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

const app = express();

// Derrière le proxy Netlify : nécessaire pour les cookies / sessions
app.set('trust proxy', 1);

// Moteur de vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// URI MongoDB (local en dev, MongoDB Atlas en production)
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/newBlog';

// En environnement serverless (Netlify Functions), on met en cache la connexion
// pour éviter d'ouvrir une nouvelle connexion à chaque invocation.
let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

function connectDB() {
  if (cached.conn) {
    return Promise.resolve(cached.conn);
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log('Connecté à MongoDB');
        return m;
      });
  }
  cached.conn = cached.promise;
  return cached.conn;
}

// Middlewares généraux
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
// Limite élevée : les images sont envoyées encodées en base64 dans le formulaire
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions stockées dans MongoDB (indispensable en serverless)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nodejs est top',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);
app.use(flash());

// S'assure que la base est connectée avant de traiter une requête
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Rend l'état de connexion accessible dans toutes les vues (navbar)
app.use((req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.userId);
  res.locals.currentUser = req.session.userId || null;
  next();
});

// Routes d'authentification
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController);
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
app.get('/auth/logout', logoutController);

// Routes du blog
app.get('/', homeController);
app.get('/posts/new', authMiddleware, newPostController);
app.post('/posts/store', authMiddleware, validationMiddleware, storePostController);
app.get('/posts/:id/edit', authMiddleware, editPostController);
app.post('/posts/:id/edit', authMiddleware, updatePostController);
app.post('/posts/:id/delete', authMiddleware, deletePostController);
app.get('/post/:id', getPostController);

// Pages statiques
app.get('/about', (req, res) => res.render('about', { title: 'À propos' }));
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }));

// Page 404 pour les routes inconnues
app.use((req, res) => {
  res.status(404).render('notfound', { title: 'Page introuvable' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { title: 'Erreur' });
});

module.exports = app;
