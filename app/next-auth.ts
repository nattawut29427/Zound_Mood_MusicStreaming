
import { DefaultUser } from "next-auth"; 

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      username?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string;
    image?: string;
  }


  // interface DefaultUser {
  //   role: string;
  // }
}