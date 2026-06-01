import { redis, isRedisEnabled } from "@/lib/redis";
import type { GenerateTask } from "@/types";

const tasks = new Map<string, GenerateTask>();
const TASK_TTL_SECONDS = 60 * 60;

const STATUS_RANK: Record<GenerateTask["status"], number> = {
  queued: 0,
  processing: 1,
  uploading: 2,
  completed: 3,
  failed: 3,
};

function taskKey(taskId: string) {
  return `gisfy:task:${taskId}`;
}

function isFresher(candidate: GenerateTask, current: GenerateTask) {
  // Prefer the entry that has progressed further. Without this, a slow/stale
  // Redis read can roll a locally-completed task back to "uploading 70%".
  const a = STATUS_RANK[candidate.status] ?? 0;
  const b = STATUS_RANK[current.status] ?? 0;
  if (a !== b) return a > b;
  return (candidate.progress ?? 0) >= (current.progress ?? 0);
}

async function persistTask(task: GenerateTask) {
  if (!isRedisEnabled()) return;
  try {
    await redis.set(
      taskKey(task.taskId),
      JSON.stringify(task),
      "EX",
      TASK_TTL_SECONDS,
    );
  } catch (error) {
    console.warn(
      "[task-store] persist redis failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

async function readTaskFromRedis(taskId: string): Promise<GenerateTask | undefined> {
  if (!isRedisEnabled()) return undefined;
  try {
    const raw = await redis.get(taskKey(taskId));
    if (!raw) return undefined;
    return JSON.parse(raw) as GenerateTask;
  } catch (error) {
    console.warn(
      "[task-store] read redis failed:",
      error instanceof Error ? error.message : error,
    );
    return undefined;
  }
}

export async function createTask(task: GenerateTask) {
  tasks.set(task.taskId, task);
  await persistTask(task);
}

export async function upsertTask(task: GenerateTask) {
  tasks.set(task.taskId, task);
  await persistTask(task);
}

export async function getTask(taskId: string): Promise<GenerateTask | undefined> {
  const local = tasks.get(taskId);
  const remote = await readTaskFromRedis(taskId);
  if (!remote) return local;
  if (!local) {
    tasks.set(taskId, remote);
    return remote;
  }
  // Pick whichever side has progressed further; if local is ahead, push it
  // back to Redis so other workers see the up-to-date state.
  if (isFresher(local, remote)) {
    void persistTask(local);
    return local;
  }
  tasks.set(taskId, remote);
  return remote;
}

export async function updateTask(
  taskId: string,
  update: Partial<GenerateTask>,
): Promise<boolean> {
  const local = tasks.get(taskId);
  const remote = await readTaskFromRedis(taskId);
  const base =
    local && remote ? (isFresher(local, remote) ? local : remote) : (local ?? remote);
  if (!base) return false;

  const merged = { ...base, ...update };
  tasks.set(taskId, merged);
  await persistTask(merged);
  return true;
}

export async function touchTask(taskId: string): Promise<boolean> {
  const task = await getTask(taskId);
  if (!task) return false;
  await persistTask(task);
  return true;
}

setInterval(
  () => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [id, task] of tasks) {
      if (new Date(task.createdAt).getTime() < cutoff) {
        tasks.delete(id);
      }
    }
  },
  5 * 60 * 1000,
).unref?.();
