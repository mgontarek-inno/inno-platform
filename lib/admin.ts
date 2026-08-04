import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== "admin") {
    return null;
  }
  return session;
}
