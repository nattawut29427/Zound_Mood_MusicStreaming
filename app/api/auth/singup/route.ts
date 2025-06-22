import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    const hashedPassword = bcrypt.hashSync(password, 10);

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name, // ตรงนี้ใช้ name เป็น username ได้เลย
      },
    });

    return new Response(JSON.stringify({ message: "User created", user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
