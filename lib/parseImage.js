// Les images sont envoyées sous forme de data URI (base64) depuis le formulaire.
// ~4 Mo de data URI équivalent à ~3 Mo de fichier.
const MAX_IMAGE_LENGTH = 4 * 1024 * 1024;

module.exports = function parseImage(value) {
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
};
