// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@doe.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("จำเป็นต้องกรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          throw new Error("ไม่พบผู้ใช้ในระบบ");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          username: user.name,
          email: user.email,
          role: "user",
        };
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      if (user) {
        token.id = user.id.toString();
      }

      //  ดึงรูปจาก Google profile และเก็บใน token.picture
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as any;
        token.picture = googleProfile.picture;
        token.username = googleProfile.name;
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;

        // โหลด user จาก database เพื่อดึงรูปล่าสุด
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          session.user.image = dbUser.image || session.user.image;
          session.user.username = dbUser.name || session.user.username;
        }
      }
      return session;
    }
  },
};
