const BlogPost = require('../models/BlogPost');
const parseImage = require('../lib/parseImage');

module.exports = async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();
    const image = parseImage(req.body.image);

    await BlogPost.create({
      title,
      body,
      image,
      userId: req.session.userId
    });

    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
