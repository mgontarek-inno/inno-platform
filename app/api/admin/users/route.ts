import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { listAllUsers, setUserStatus, type UserStatus } from "@/lib/users";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listAllUsers();
  return NextResponse.json({ users });
}

interface AdminUsersPatchPayload {
  email?: string;
  status?: UserStatus;
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AdminUsersPatchPayload;
  if (
    !body.email ||
    typeof body.email !== "string" ||
    (body.status !== "pending" && body.status !== "approved")
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await setUserStatus(body.email, body.status);
  return NextResponse.json({ ok: true });
}
