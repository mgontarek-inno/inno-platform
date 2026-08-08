import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { getUserByEmail, deleteUserByEmail, setEmailVisible, setProfileVisible } from "@/lib/users";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";

interface AccountPatchPayload {
  emailVisible?: boolean;
  profileVisible?: boolean;
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as AccountPatchPayload;
    const hasEmailVisibility = typeof body.emailVisible === "boolean";
    const hasProfileVisibility = typeof body.profileVisible === "boolean";

    if (!hasEmailVisibility && !hasProfileVisibility) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (hasEmailVisibility) {
      await setEmailVisible(session.user.email, body.emailVisible!);
    }

    if (hasProfileVisibility) {
      await setProfileVisible(session.user.email, body.profileVisible!);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Account update failed:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const currentUser = await getUserByEmail(email);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION_NAME).deleteMany({
      $or: [{ email }, { userId: currentUser?.googleId ?? email }],
    });

    await deleteUserByEmail(email);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
