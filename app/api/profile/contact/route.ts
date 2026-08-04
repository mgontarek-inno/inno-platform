import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { getUserByEmail } from "@/lib/users";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";

interface ProfileDoc {
  _id: ObjectId;
  email?: string;
  userId?: string;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.status !== "approved") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    if (!profileId || !ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: "Invalid profileId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const profile = await db
      .collection<ProfileDoc>(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(profileId) });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const isOwnProfile =
      profile.email === session.user.email ||
      (Boolean(profile.userId) && profile.userId === session.user.googleId);

    if (isOwnProfile) {
      return NextResponse.json({ email: profile.email ?? null, hidden: false });
    }

    if (!profile.email) {
      return NextResponse.json({ email: null, hidden: false });
    }

    const owner = await getUserByEmail(profile.email);
    const visible = owner?.emailVisible ?? true;

    if (!visible) {
      return NextResponse.json({ email: null, hidden: true });
    }

    return NextResponse.json({ email: profile.email, hidden: false });
  } catch (error) {
    console.error("Contact lookup failed:", error);
    return NextResponse.json({ error: "Failed to load contact" }, { status: 500 });
  }
}
