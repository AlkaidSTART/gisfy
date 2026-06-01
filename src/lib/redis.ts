import Redis, { type RedisOptions } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisDisabled: boolean | undefined;
};

const COMMAND_TIMEOUT_MS = Math.max(
  500,
  Number(process.env.REDIS_COMMAND_TIMEOUT_MS ?? 4000),
);
const CONNECT_TIMEOUT_MS = Math.max(
  500,
  Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 8000),
);

function baseOptions(): RedisOptions {
  return {
    connectTimeout: CONNECT_TIMEOUT_MS,
    commandTimeout: COMMAND_TIMEOUT_MS,
    maxRetriesPerRequest: 2,
    // Allow short queueing while the TLS handshake completes on cold start;
    // commandTimeout still bounds how long any single command can hang.
    enableOfflineQueue: true,
    enableReadyCheck: true,
    keepAlive: 30_000,
    retryStrategy(times) {
      // Cap exponential backoff at 5s. Returning null would disconnect; we want
      // ioredis to keep trying so transient Upstash idle-disconnects auto-heal.
      return Math.min(times * 200, 5000);
    },
    reconnectOnError(err) {
      const msg = err?.message ?? "";
      if (msg.includes("READONLY") || msg.includes("ETIMEDOUT")) return 2;
      return false;
    },
  };
}

function createRealRedis(url: string) {
  const client = new Redis(url, baseOptions());
  client.on("error", (err) => {
    // ioredis emits these on transient disconnects (e.g. Upstash closing idle
    // TLS sockets). Without a listener Node treats them as unhandled.
    console.warn("[redis] connection error:", err.message);
  });
  return client;
}

function createDisabledRedis() {
  globalForRedis.redisDisabled = true;
  // lazyConnect + no autoResubscribe keeps this from dialing localhost:6379.
  // Any command will reject fast via commandTimeout, and callers already
  // gate Redis usage behind `process.env.REDIS_URL`.
  const client = new Redis({
    lazyConnect: true,
    autoResubscribe: false,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    commandTimeout: 500,
    retryStrategy: () => null,
  });
  client.on("error", () => {});
  return client;
}

export const redis: Redis =
  globalForRedis.redis ??
  (process.env.REDIS_URL
    ? createRealRedis(process.env.REDIS_URL)
    : createDisabledRedis());

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
}

export const isRedisEnabled = () => Boolean(process.env.REDIS_URL);
