import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();


    //  ขอ reset link

    if (body.email) {
      const { email } = body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "No user found with this email" }, { status: 404 });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 นาที

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expires },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/signin?token=${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Zound Mood" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
       <h2>Password Reset Request</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
      });

      return NextResponse.json({ message: "Reset email sent successfully!" });
    }


    //  Reset password

    if (body.token && body.newPassword) {
      const { token, newPassword } = body;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
      }

      if (resetToken.expires < new Date()) {
        return NextResponse.json({ message: "Token has expired" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({ where: { token } });

      return NextResponse.json({ message: "Password has been reset successfully!" });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
