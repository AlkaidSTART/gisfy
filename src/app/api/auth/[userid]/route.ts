import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await params;
    if (!userid?.trim()) return fail("invalid_params", "缺少 userid", 400);

    let user = await prisma.user.findUnique({ where: { id: userid } });
    if (!user) {
      // Auto-create user for hackathon demo
      user = await prisma.user.create({
        data: {
          id: userid,
          email: `${userid}@gisfy.local`,
          name: userid,
          password: "",
        },
      });
    }

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch {
    return fail("INTERNAL", "服务器错误", 500);
  }
}
