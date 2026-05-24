import { z } from "zod";
import bcrypt from "bcryptjs";
import supabaseDb from "@/lib/supabase-db";
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
    if (!parsed.success) {
      console.error("[login] validation failed:", parsed.error.issues);
      return fail("VALIDATION", "邮箱/密码格式不正确");
    }

    const { email, password } = parsed.data;
    console.log("[login] attempt:", email);

    const { data: user, error: dbError } = await supabaseDb
      .from("users")
      .select("id, email, name, password")
      .eq("email", email)
      .maybeSingle();

    if (dbError) {
      console.error("[login] supabase error:", dbError);
      return fail("INTERNAL", `数据库错误: ${dbError.message}`, 500);
    }
    if (!user) {
      console.log("[login] user not found:", email);
      return fail("NOT_FOUND", "邮箱或密码错误", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("[login] invalid password for:", email);
      return fail("NOT_FOUND", "邮箱或密码错误", 401);
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[login] error:", msg, e instanceof Error ? e.stack : "");
    return fail("INTERNAL", `服务器错误: ${msg}`, 500);
  }
}
