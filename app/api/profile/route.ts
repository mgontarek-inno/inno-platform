import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { sanitizeSurveyValues } from "@/lib/survey-validation";
import { FormValues } from "@/lib/survey-data";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";
const MAX_BODY_LENGTH = 200_000;

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

    if (session.user.status !== "approved") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = JSON.parse(rawBody) as UpdateProfilePayload;
    if (!body.profileId || !ObjectId.isValid(body.profileId)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const values = sanitizeSurveyValues(body.values);
    if (Object.keys(values).length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // allow updating when the current session email matches the profile email
    // or when the current user's googleId matches profile.userId
    const ownerMatch = {
      $or: [
        { email: session.user.email },
        ...(session.user.googleId ? [{ userId: session.user.googleId }] : []),
      ],
    };

    const result = await db.collection(COLLECTION_NAME).updateOne(
      {
        _id: new ObjectId(body.profileId),
        ...ownerMatch,
      },
      {
        $set: {
          values,
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