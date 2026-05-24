import supabaseDb from "@/lib/supabase-db";
import { ok, fail } from "@/lib/response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await params;
    if (!userid?.trim()) return fail("invalid_params", "缺少 userid", 400);

    let { data: user } = await supabaseDb
      .from("users")
      .select("id, email, name")
      .eq("id", userid)
      .maybeSingle();

    if (!user) {
      // Auto-create user for hackathon demo
      const { data: created } = await supabaseDb
        .from("users")
        .insert({
          id: userid,
          email: `${userid}@gisfy.local`,
          name: userid,
          password: "",
        })
        .select("id, email, name")
        .single();
      user = created ?? null;
    }

    if (!user) return fail("INTERNAL", "创建用户失败", 500);

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
