import { getSession, destroySession, clearSessionCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/response";

export async function POST() {
  try {
    const session = await getSession();
    if (session) {
      await destroySession(session.sessionId);
    }
    await clearSessionCookie();
    return ok(null);
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
