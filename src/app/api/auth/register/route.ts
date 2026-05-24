import { z } from "zod";
import bcrypt from "bcryptjs";
import supabaseDb from "@/lib/supabase-db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/response";

const bodySchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success)
      return fail("VALIDATION", "邮箱/用户名/密码格式不正确");

    const { email, name, password } = parsed.data;

    const { data: exists } = await supabaseDb
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (exists) return fail("CONFLICT", "该邮箱已注册", 409);

    const hashed = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabaseDb
      .from("users")
      .insert({ email, name, password: hashed })
      .select("id, email, name")
      .single();
    if (error) {
      console.error("[register] supabase insert error:", error);
      return fail("INTERNAL", `注册失败: ${error.message}`, 500);
    }
    if (!user) {
      console.error("[register] insert returned no user");
      return fail("INTERNAL", "注册失败", 500);
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return ok({ id: user.id, email: user.email, name: user.name }, 201);
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
