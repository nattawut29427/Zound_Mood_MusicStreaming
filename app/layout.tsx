import { Geist, Geist_Mono } from "next/font/google";
import { SessionWrapper } from "@/app/SessionWrapper";
import "@/app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans bg-black text-white h-screen overflow-hidden">
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
