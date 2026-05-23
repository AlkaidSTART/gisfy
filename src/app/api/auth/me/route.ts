import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("UNAUTHORIZED", "未登录", 401);

    return ok({
      id: session.userId,
      email: session.email,
      name: session.name,
    });
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
