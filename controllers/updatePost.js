const BlogPost = require('../models/BlogPost');
const parseImage = require('../lib/parseImage');

module.exports = async (req, res, next) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    // Seul l'auteur peut modifier son article
    if (!BlogPost.isOwner(blogpost, req.session.userId)) {
      return res.redirect('/');
    }

    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();

    if (!title || !body) {
      return res.redirect('/posts/' + blogpost._id + '/edit');
    }

    // Remplacement de l'image uniquement si une nouvelle image est envoyée
    await BlogPost.update(blogpost._id, { title, body, image: parseImage(req.body.image) });
    res.redirect('/post/' + blogpost._id);
  } catch (error) {
    next(error);
  }
};
