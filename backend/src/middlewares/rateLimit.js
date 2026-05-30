function getClientKey(req) {
  const forwardedFor = req.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || req.ip || req.socket?.remoteAddress || 'unknown';
}

function createRateLimiter({ windowMs, max, lockoutMs, message }) {
  const buckets = new Map();

  return (req, res, next) => {
    const key = getClientKey(req);
    const now = Date.now();
    const bucket = buckets.get(key) || {
      count: 0,
      windowStart: now,
      lockedUntil: 0
    };

    if (bucket.lockedUntil > now) {
      const retryAfter = Math.ceil((bucket.lockedUntil - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message
      });
    }

    if (now - bucket.windowStart > windowMs) {
      bucket.count = 0;
      bucket.windowStart = now;
      bucket.lockedUntil = 0;
    }

    bucket.count += 1;

    if (bucket.count > max) {
      bucket.lockedUntil = now + lockoutMs;
      buckets.set(key, bucket);
      res.setHeader('Retry-After', String(Math.ceil(lockoutMs / 1000)));
      return res.status(429).json({
        success: false,
        message
      });
    }

    buckets.set(key, bucket);
    return next();
  };
}

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  lockoutMs: 10 * 60 * 1000,
  message: 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่'
});

module.exports = {
  createRateLimiter,
  loginRateLimiter
};
