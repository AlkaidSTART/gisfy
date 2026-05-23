import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is missing");
  }
  return new Redis(process.env.REDIS_URL);
}

export const redis =
  globalForRedis.redis ??
  (process.env.REDIS_URL ? createRedis() : new Redis({ lazyConnect: true }));

if (process.env.NODE_ENV !== "production" && !globalForRedis.redis) {
  globalForRedis.redis = redis;
}
