import type { GenerateTask, TaskStatus } from "@/types";

const tasks = new Map<string, GenerateTask>();

export function createTask(task: GenerateTask) {
  tasks.set(task.taskId, task);
}

export function getTask(taskId: string): GenerateTask | undefined {
  return tasks.get(taskId);
}

export function updateTask(taskId: string, update: Partial<GenerateTask>) {
  const task = tasks.get(taskId);
  if (task) {
    Object.assign(task, update);
    tasks.set(taskId, task);
  }
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
