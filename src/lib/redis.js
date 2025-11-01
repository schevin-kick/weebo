/**
 * Redis Client
 * Reusable Redis instance for caching and rate limiting
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (only if env vars are set)
let redis = null;
let redisEnabled = false;

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  redisEnabled = true;
  const source = process.env.KV_REST_API_URL ? 'Vercel KV' : 'Upstash Redis';
  console.log(`[Redis] Redis client initialized with ${source}`);
} else {
  console.warn('[Redis] Redis disabled - env vars not set');
}

export { redis, redisEnabled };
export default redis;
