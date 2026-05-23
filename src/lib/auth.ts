import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gisfy-dev-secret-do-not-use-in-production",
);
const COOKIE_NAME = "gisfy_sid";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 天
const SESSION_PREFIX = "session:";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
}

/** 创建 JWT token */
async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/** 验证 JWT token */
async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session store (Redis) ──────────────────────────

/** 创建会话：Redis 存 session，返回 JWT */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await signToken(payload);
  await redis.setex(`${SESSION_PREFIX}${payload.userId}`, SESSION_TTL, token);
  return token;
}

/** 删除会话 */
export async function destroySession(userId: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${userId}`);
}

/** 验证当前请求的会话是否有效 */
export async function validateSession(
  token: string,
): Promise<SessionPayload | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;

  const stored = await redis.get(`${SESSION_PREFIX}${payload.userId}`);
  if (stored !== token) return null;

  return payload;
}

// ─── Cookie helpers ─────────────────────────────────

/** 设置 session cookie */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
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
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** 从请求 cookie 中获取当前会话 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return validateSession(token);
}
