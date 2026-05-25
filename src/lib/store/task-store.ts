import { redis } from "@/lib/redis";
import type { GenerateTask } from "@/types";

const tasks = new Map<string, GenerateTask>();
const TASK_TTL_SECONDS = 60 * 60;
const hasRedis = Boolean(process.env.REDIS_URL);

function taskKey(taskId: string) {
  return `gisfy:task:${taskId}`;
}

async function persistTask(task: GenerateTask) {
  if (!hasRedis) return;
  try {
    await redis.set(
      taskKey(task.taskId),
      JSON.stringify(task),
      "EX",
      TASK_TTL_SECONDS,
    );
  } catch (error) {
    console.warn("[task-store] persist redis failed:", error);
  }
}

async function readTaskFromRedis(taskId: string): Promise<GenerateTask | undefined> {
  if (!hasRedis) return undefined;
  try {
    const raw = await redis.get(taskKey(taskId));
    if (!raw) return undefined;
    return JSON.parse(raw) as GenerateTask;
  } catch (error) {
    console.warn("[task-store] read redis failed:", error);
    return undefined;
  }
}

export function createTask(task: GenerateTask) {
  tasks.set(task.taskId, task);
  void persistTask(task);
}

export function upsertTask(task: GenerateTask) {
  tasks.set(task.taskId, task);
  void persistTask(task);
}

export async function getTask(taskId: string): Promise<GenerateTask | undefined> {
  const local = tasks.get(taskId);
  if (local) return local;
  const parsed = await readTaskFromRedis(taskId);
  if (!parsed) return undefined;
  tasks.set(taskId, parsed);
  return parsed;
}

export async function updateTask(
  taskId: string,
  update: Partial<GenerateTask>,
): Promise<boolean> {
  const local = tasks.get(taskId);
  const base = local ?? (await readTaskFromRedis(taskId));
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

// Cleanup tasks older than 1 hour
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
);
