import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { FormValues } from "@/lib/survey-data";
import { sanitizeSurveyValues } from "@/lib/survey-validation";
import { getUserByEmail, markSurveyCompleted } from "@/lib/users";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";
const MAX_BODY_LENGTH = 200_000;

interface SurveyPayload {
  values?: FormValues;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.status !== "approved") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const email = session.user.email;
    const existingUser = await getUserByEmail(email);

    if (existingUser?.surveyCompleted) {
      return NextResponse.json(
        { error: "Survey already submitted" },
        { status: 409 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = JSON.parse(rawBody) as SurveyPayload;
    const values = sanitizeSurveyValues(body.values);

    if (Object.keys(values).length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION_NAME).insertOne({
      userId: existingUser?.googleId ?? email,
      email,
      name: session.user.name ?? "",
      image: session.user.image ?? "",
      values,
      createdAt: new Date(),
    });

    await markSurveyCompleted(email);

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Survey save failed:", error);
    return NextResponse.json({ error: "Failed to save survey" }, { status: 500 });
  }
}
