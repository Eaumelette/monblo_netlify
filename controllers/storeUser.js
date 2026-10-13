const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    await User.create(req.body);
    res.redirect('/');
  } catch (error) {
    let validationErrors;

    if (error.code === 11000) {
      // Index unique MongoDB : le nom d'utilisateur est déjà utilisé
      validationErrors = ['Ce nom d\'utilisateur est déjà utilisé.'];
    } else if (error.errors) {
      validationErrors = Object.keys(error.errors).map((key) => error.errors[key].message);
    } else {
      validationErrors = ['Une erreur est survenue lors de l\'inscription.'];
    }

    req.flash('validationErrors', validationErrors);
    req.flash('data', req.body);
    res.redirect('/auth/register');
  }
};
