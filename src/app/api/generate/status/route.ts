import { fail, ok } from "@/lib/response";
import { getTask } from "@/lib/store/task-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");

  if (!taskId) {
    return fail("invalid_params", "缺少 taskId", 400);
  }

  const task = getTask(taskId);
  if (!task) {
    return fail("not_found", "任务不存在或已过期", 404);
  }

  return ok({
    taskId: task.taskId,
    status: task.status,
    progress: task.progress,
    images: task.status === "completed" ? task.images : undefined,
    error: task.status === "failed" ? task.error : undefined,
  });
}