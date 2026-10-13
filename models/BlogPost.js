const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Veuillez saisir un titre.']
  },
  body: {
    type: String,
    required: [true, 'Veuillez saisir une description.']
  },
  image: {
    type: String
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
