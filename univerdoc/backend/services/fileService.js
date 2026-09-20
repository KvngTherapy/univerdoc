const path = require('path');
const fs = require('fs');

function getFileUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `/uploads/${filename}`;
}

module.exports = {
  getFileUrl,
};