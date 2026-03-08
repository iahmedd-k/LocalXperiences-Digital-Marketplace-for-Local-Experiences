const { Redis } = require('@upstash/redis');

let redis;

const connectRedis = async () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set; Redis cache disabled.');
    return;
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    await redis.ping();
    console.log('✅ Redis connected');
  } catch (error) {
    console.warn('⚠️  Redis connection failed:', error.message);
    redis = null;
  }
};

const getCache = async (key) => {
  if (!redis) return null;

  let value;
  try {
    value = await redis.get(key);
  } catch (err) {
    console.warn('⚠️  Redis get failed for key', key, '-', err.message);
    return null;
  }

  if (value == null) return null;

  // Upstash can return non-string values; only JSON.parse strings we know we stringified
  if (typeof value !== 'string') return value;

  // Sometimes a plain "[object Object]" string can leak into the cache; treat as miss
  if (value === '[object Object]') {
    console.warn('⚠️  Redis cache contained "[object Object]" for key', key, '- ignoring.');
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('⚠️  Redis cache parse failed for key', key, '-', err.message);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
};

const deleteCacheByPattern = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (!keys || keys.length === 0) return;
    await Promise.all(keys.map((k) => redis.del(k)));
  } catch (err) {
    console.warn('⚠️  Redis delete by pattern failed:', err.message);
  }
};

module.exports = { connectRedis, getCache, setCache, deleteCacheByPattern };
