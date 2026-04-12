const rateLimit = new Map();

export function checkRateLimit(ip, limit = 30, windowMs = 60000) {
  const now = Date.now();
  const key = ip;
  const record = rateLimit.get(key);

  if (!record || now - record.start > windowMs) {
    rateLimit.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count++;
  if (record.count > limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.start + windowMs - now) / 1000) };
  }

  return { allowed: true, remaining: limit - record.count };
}
