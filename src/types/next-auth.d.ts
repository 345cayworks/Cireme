import type { Role } from "@/lib/rbac";
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role;
    status?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      status: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    status?: string;
  }
}
