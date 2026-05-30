const crypto = require('crypto');

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 2;

function getTokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET || (process.env.NODE_ENV === 'test' ? 'test-auth-token-secret' : '');

  if (!secret) {
    throw new Error('AUTH_TOKEN_SECRET is not configured');
  }

  return secret;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signPayload(encodedPayload) {
  return crypto
    .createHmac('sha256', getTokenSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createAdminToken(user) {
  const ttlSeconds = Number(process.env.AUTH_TOKEN_TTL_SECONDS || DEFAULT_TOKEN_TTL_SECONDS);
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + ttlSeconds;
  const payload = {
    sub: 'teacher-admin',
    role: 'administrator',
    iat: issuedAt,
    exp: expiresAt,
    user
  };
  const encodedPayload = base64UrlJson(payload);
  const signature = signPayload(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.role !== 'administrator' || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  createAdminToken,
  verifyAdminToken
};
