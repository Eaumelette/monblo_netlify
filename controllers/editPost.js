const BlogPost = require('../models/BlogPost');

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

    res.render('edit', { title: 'Modifier l\'article', blogpost, createPost: true });
  } catch (error) {
    next(error);
  }
};
