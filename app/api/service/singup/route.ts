import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import validator from "validator";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!validator.isEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email already in use" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "Password must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    



    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // ลบ password ออกจาก response
    const { password: _, ...safeUser } = user;

    return new Response(
      JSON.stringify({ message: "User created", user: safeUser }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
