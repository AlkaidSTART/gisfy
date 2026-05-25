import { redis } from "@/lib/redis";

type QueueTaskPayload = {
  taskId: string;
  userId: string;
  body: {
    prompt: string;
    style: "pixel" | "flat" | "anime";
    type: "character" | "monster" | "scene" | "tile" | "item" | "ui" | "effect";
    size: 512 | 1024 | 2048;
    count: 1 | 4 | 9;
    transparent?: boolean;
    seed?: number;
    negativePrompt?: string;
    promptMode?: "template" | "raw";
  };
};

const QUEUE_KEY = "gisfy:queue:generate";
const LOCK_PREFIX = "gisfy:queue:lock:";
const LOCK_TTL_MS = 5 * 60 * 1000;
const WORKER_CONCURRENCY = Math.max(
  1,
  Number(process.env.GENERATE_WORKER_CONCURRENCY ?? 3),
);
const QUEUE_POLL_MS = Math.max(100, Number(process.env.GENERATE_QUEUE_POLL_MS ?? 500));
const ENABLED = Boolean(process.env.REDIS_URL);

let workerStarted = false;
let timer: ReturnType<typeof setInterval> | null = null;
let activeWorkers = 0;

export async function enqueueGenerationTask(payload: QueueTaskPayload) {
  if (!ENABLED) {
    throw new Error("REDIS_URL is missing, queue mode requires redis");
  }
  await redis.rpush(QUEUE_KEY, JSON.stringify(payload));
}

async function withTaskLock(taskId: string, fn: () => Promise<void>) {
  const lockKey = `${LOCK_PREFIX}${taskId}`;
  const lock = await redis.set(lockKey, "1", "PX", LOCK_TTL_MS, "NX");
  if (lock !== "OK") return false;
  try {
    await fn();
    return true;
  } finally {
    await redis.del(lockKey);
  }
}

async function pullOneTask(): Promise<QueueTaskPayload | null> {
  const raw = await redis.lpop(QUEUE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QueueTaskPayload;
  } catch {
    return null;
  }
}

async function loopOnce() {
  while (activeWorkers < WORKER_CONCURRENCY) {
    const task = await pullOneTask();
    if (!task) return;

    activeWorkers += 1;
    queueMicrotask(async () => {
      try {
        const mod = await import("@/lib/generation");
        await withTaskLock(task.taskId, async () => {
          await mod.runGenerationTask(task.taskId, task.body, task.userId);
        });
      } finally {
        activeWorkers = Math.max(0, activeWorkers - 1);
        void loopOnce();
      }
    });
  }
}

export function ensureGenerationWorker() {
  if (!ENABLED || workerStarted) return;
  workerStarted = true;
  void loopOnce();
  timer = setInterval(() => {
    void loopOnce();
  }, QUEUE_POLL_MS);
}

export function stopGenerationWorkerForTests() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  workerStarted = false;
}
