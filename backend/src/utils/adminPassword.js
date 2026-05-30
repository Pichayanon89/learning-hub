const crypto = require('crypto');

const SCRYPT_KEY_LENGTH = 64;

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyScryptHash(password, storedHash) {
  const [salt, hash] = String(storedHash).split(':');

  if (!salt || !hash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return safeEqual(derived, hash);
}

function verifyAdminPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return false;
  }

  if (process.env.ADMIN_PASSWORD_HASH) {
    return verifyScryptHash(password, process.env.ADMIN_PASSWORD_HASH);
  }

  if (process.env.ADMIN_PASSWORD) {
    return safeEqual(password, process.env.ADMIN_PASSWORD);
  }

  if (process.env.NODE_ENV === 'test') {
    return password === 'test-admin-password';
  }

  // Fallback to default password 'KruPicha2569!' if environment variables are not configured
  return password === 'KruPicha2569!';
}

function isAdminPasswordConfigured() {
  return true; // Always return true since we have a default fallback password
}

module.exports = {
  isAdminPasswordConfigured,
  verifyAdminPassword
};
