import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

const COOKIE_NAME = "gisfy_sid";
const SESSION_TTL = 60 * 60 * 24 * 3; // 3 天
const SESSION_PREFIX = "session:";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
}

export interface SessionRecord extends SessionPayload {
  sessionId: string;
}

function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

function parseSessionPayload(value: string | null): SessionPayload | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<SessionPayload>;
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : null,
    };
  } catch {
    return null;
  }
}

// ─── Session store (Redis) ──────────────────────────

/** 创建会话：Redis 存 session，返回 sessionId */
export async function createSession(payload: SessionPayload): Promise<string> {
  const sessionId = randomUUID();
  await redis.setex(sessionKey(sessionId), SESSION_TTL, JSON.stringify(payload));
  return sessionId;
}

/** 删除会话 */
export async function destroySession(sessionId: string): Promise<void> {
  await redis.del(sessionKey(sessionId));
}

/** 验证当前请求的会话是否有效 */
export async function validateSession(
  sessionId: string,
): Promise<SessionPayload | null> {
  return parseSessionPayload(await redis.get(sessionKey(sessionId)));
}

// ─── Cookie helpers ─────────────────────────────────

/** 设置 session cookie */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

/** 清除 session cookie */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** 从请求 cookie 中获取当前会话 */
export async function getSession(): Promise<SessionRecord | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await validateSession(sessionId);
  if (!session) return null;

  return { sessionId, ...session };
}
