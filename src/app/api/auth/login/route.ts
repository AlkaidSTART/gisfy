import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/response";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return fail("VALIDATION", "邮箱/密码格式不正确");

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail("NOT_FOUND", "邮箱或密码错误", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail("NOT_FOUND", "邮箱或密码错误", 401);

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
