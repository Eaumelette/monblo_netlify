const BlogPost = require('../models/BlogPost');

// Les images sont envoyées sous forme de data URI (base64) depuis le formulaire.
// ~4 Mo de data URI équivalent à ~3 Mo de fichier.
const MAX_IMAGE_LENGTH = 4 * 1024 * 1024;

function parseImage(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  if (!value.startsWith('data:image/')) {
    return '';
  }
  if (value.length > MAX_IMAGE_LENGTH) {
    return '';
  }
  return value;
}

module.exports = async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();
    const image = parseImage(req.body.image);

    await BlogPost.create({
      title,
      body,
      image,
      userid: req.session.userId
    });

    res.redirect('/');
  } catch (error) {
    if (error.name === 'ValidationError') {
      req.flash('postErrors', Object.keys(error.errors).map((key) => error.errors[key].message));
      req.flash('postData', req.body);
      return res.redirect('/posts/new');
    }
    next(error);
  }
};
