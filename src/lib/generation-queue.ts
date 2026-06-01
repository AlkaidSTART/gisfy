import { redis, isRedisEnabled } from "@/lib/redis";

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

type WorkerState = {
  started: boolean;
  timer: ReturnType<typeof setInterval> | null;
  activeWorkers: number;
};

const globalForWorker = globalThis as unknown as {
  __gisfyWorker: WorkerState | undefined;
};

const state: WorkerState =
  globalForWorker.__gisfyWorker ??
  (globalForWorker.__gisfyWorker = {
    started: false,
    timer: null,
    activeWorkers: 0,
  });

export async function enqueueGenerationTask(payload: QueueTaskPayload) {
  if (!isRedisEnabled()) {
    // Fallback path: run inline so the API stays usable without Redis. The
    // queue's only job in single-process dev is dispatch — losing it should
    // not break image generation.
    await runInline(payload);
    return;
  }
  try {
    await redis.rpush(QUEUE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn(
      "[queue] rpush failed, falling back to inline run:",
      error instanceof Error ? error.message : error,
    );
    await runInline(payload);
  }
}

async function runInline(payload: QueueTaskPayload) {
  queueMicrotask(async () => {
    try {
      const mod = await import("@/lib/generation");
      await mod.runGenerationTask(payload.taskId, payload.body, payload.userId);
    } catch (error) {
      console.error("[queue] inline worker error:", error);
      try {
        const mod = await import("@/lib/store/task-store");
        await mod.updateTask(payload.taskId, {
          status: "failed",
          progress: 0,
          error: error instanceof Error ? error.message : "worker_error",
        });
      } catch {
        // ignore
      }
    }
  });
}

async function withTaskLock(taskId: string, fn: () => Promise<void>) {
  const lockKey = `${LOCK_PREFIX}${taskId}`;
  let lock: string | null = null;
  try {
    lock = await redis.set(lockKey, "1", "PX", LOCK_TTL_MS, "NX");
  } catch (error) {
    console.warn(
      "[queue] lock acquire failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
  if (lock !== "OK") return false;
  try {
    await fn();
    return true;
  } finally {
    try {
      await redis.del(lockKey);
    } catch {
      // best-effort; TTL will release it
    }
  }
}

async function pullOneTask(): Promise<QueueTaskPayload | null> {
  try {
    const raw = await redis.lpop(QUEUE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QueueTaskPayload;
  } catch (error) {
    console.warn(
      "[queue] lpop failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loopOnce() {
  while (state.activeWorkers < WORKER_CONCURRENCY) {
    const task = await pullOneTask();
    if (!task) return;

    state.activeWorkers += 1;
    queueMicrotask(async () => {
      try {
        const mod = await import("@/lib/generation");
        const acquired = await withTaskLock(task.taskId, async () => {
          await mod.runGenerationTask(task.taskId, task.body, task.userId);
        });
        if (!acquired) {
          try {
            await redis.rpush(QUEUE_KEY, JSON.stringify(task));
          } catch {
            // queue temporarily unreachable — drop, status will time out client-side
          }
        }
      } catch (error) {
        console.error("[queue] worker error:", error);
        try {
          const mod = await import("@/lib/store/task-store");
          await mod.updateTask(task.taskId, {
            status: "failed",
            progress: 0,
            error: error instanceof Error ? error.message : "worker_error",
          });
        } catch {
          // ignore
        }
      } finally {
        state.activeWorkers = Math.max(0, state.activeWorkers - 1);
        void loopOnce();
      }
    });
  }
}

export function ensureGenerationWorker() {
  if (!isRedisEnabled() || state.started) return;
  state.started = true;
  void loopOnce();
  state.timer = setInterval(() => {
    void loopOnce();
  }, QUEUE_POLL_MS);
  state.timer.unref?.();
}

export function stopGenerationWorkerForTests() {
  if (!state.timer) return;
  clearInterval(state.timer);
  state.timer = null;
  state.started = false;
}
