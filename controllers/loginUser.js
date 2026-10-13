const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
