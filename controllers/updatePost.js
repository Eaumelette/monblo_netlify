const BlogPost = require('../models/BlogPost');

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
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    // Seul l'auteur peut modifier son article
    if (blogpost.userid.toString() !== String(req.session.userId)) {
      return res.redirect('/');
    }

    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();

    if (!title || !body) {
      return res.redirect('/posts/' + blogpost._id + '/edit');
    }

    blogpost.title = title;
    blogpost.body = body;

    // Remplacement de l'image uniquement si une nouvelle image est envoyée
    const image = parseImage(req.body.image);
    if (image) {
      blogpost.image = image;
    }

    await blogpost.save();
    res.redirect('/post/' + blogpost._id);
  } catch (error) {
    next(error);
  }
};
