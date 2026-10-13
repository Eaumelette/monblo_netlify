const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Veuillez saisir un nom d\'utilisateur.'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Veuillez saisir un mot de passe.']
  }
});

// Hachage du mot de passe avant l'enregistrement en base
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);
