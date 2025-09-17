import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const diaries = await prisma.diary.findMany({
      where: {
        user_id: session.user.id, // ต้องตรงกับ schema
      },
      include: {
        user: true,
        song: true,
        diary_like: true,
        stat: true,
      },
      orderBy: { created_at: "desc" },
    });

    return new Response(JSON.stringify({ diaries }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch diaries" }), { status: 500 });
  }
}
