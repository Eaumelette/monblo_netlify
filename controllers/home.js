const BlogPost = require('../models/BlogPost');

module.exports = async (req, res, next) => {
  try {
    // On exclut l'image (base64) de la liste pour alléger la réponse
    const blogposts = await BlogPost.find({})
      .select('-image')
      .sort({ datePosted: -1 })
      .populate('userid');

    res.render('index', { title: 'Accueil', blogposts });
  } catch (error) {
    next(error);
  }
};
