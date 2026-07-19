import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { getUserByEmail, deleteUserByEmail } from "@/lib/users";

const DB_NAME = process.env.MONGODB_DB ?? "startup-survey";
const COLLECTION_NAME = "profiles";

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
