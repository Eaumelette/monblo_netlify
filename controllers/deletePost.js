const BlogPost = require('../models/BlogPost');

module.exports = async (req, res, next) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    // Seul l'auteur peut supprimer son article
    if (!BlogPost.isOwner(blogpost, req.session.userId)) {
      return res.redirect('/');
    }

    await BlogPost.remove(blogpost._id);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
