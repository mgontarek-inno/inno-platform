import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { getUserByEmail } from "@/lib/users";
import { FormValues } from "@/lib/survey-data";

const DB_NAME = process.env.MONGODB_DB ?? "startup-survey";
const COLLECTION_NAME = "profiles";

interface UpdateProfilePayload {
  profileId?: string;
  values?: FormValues;
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfilePayload;
    if (!body.profileId || !body.values || typeof body.values !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // allow updating when the current session email matches the profile email
    // or when the current user's googleId matches profile.userId
    const currentUser = await getUserByEmail(session.user.email);
    const ownerMatch = {
      $or: [
        { email: session.user.email },
        { userId: currentUser?.googleId ?? session.user.email },
      ],
    };

    const result = await db.collection(COLLECTION_NAME).updateOne(
      {
        _id: new ObjectId(body.profileId),
        ...ownerMatch,
      },
      {
        $set: {
          values: body.values,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}