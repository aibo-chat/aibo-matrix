const crypto = require('crypto');

function hash(inputString) {
  const hash = crypto.createHash('sha256');
  hash.update(inputString);
  return hash.digest('hex');
}

module.exports = {hash}
