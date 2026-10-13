const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

// Store Netlify Blobs où sont rangées les images des articles.
const STORE_NAME = 'blog-images';

// Une clé valide : <uuid>.<extension>, ex. "3f1c...-...-....png"
const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/;

let store;

function images() {
  if (!store) {
    store = getStore(STORE_NAME);
  }
  return store;
}

// Enregistre le buffer d'une image et renvoie la clé générée.
async function putImage({ buffer, contentType, extension }) {
  const key = `${crypto.randomUUID()}.${extension}`;
  const blob = new Blob([buffer], { type: contentType });
  await images().set(key, blob, { metadata: { contentType } });
  return key;
}

// Renvoie { data: Buffer, contentType } ou null si l'image est absente.
async function getImage(key) {
  if (!KEY_PATTERN.test(key)) {
    return null;
  }
  const entry = await images().getWithMetadata(key, { type: 'arrayBuffer' });
  if (!entry) {
    return null;
  }
  const contentType =
    (entry.metadata && entry.metadata.contentType) || 'application/octet-stream';
  return { data: Buffer.from(entry.data), contentType };
}

// Supprime une image (silencieux si la clé est invalide).
async function deleteImage(key) {
  if (!KEY_PATTERN.test(key)) {
    return;
  }
  await images().delete(key);
}

// "/images/<key>" -> "<key>", ou null si le chemin n'est pas une image.
function keyFromPath(imagePath) {
  if (typeof imagePath !== 'string') {
    return null;
  }
  const match = /^\/images\/(.+)$/.exec(imagePath);
  return match ? match[1] : null;
}

module.exports = { putImage, getImage, deleteImage, keyFromPath };
