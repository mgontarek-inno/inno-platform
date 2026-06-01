import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { FormValues } from "@/lib/survey-data";
import { getUserByEmail, markSurveyCompleted } from "@/lib/users";

const DB_NAME = process.env.MONGODB_DB ?? "startup-survey";
const COLLECTION_NAME = "profiles";

interface SurveyPayload {
  values?: FormValues;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const existingUser = await getUserByEmail(email);

    if (existingUser?.surveyCompleted) {
      return NextResponse.json(
        { error: "Survey already submitted" },
        { status: 409 }
      );
    }

    const body = (await request.json()) as SurveyPayload;

    if (!body.values || typeof body.values !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION_NAME).insertOne({
      userId: existingUser?.googleId ?? email,
      email,
      name: session.user.name ?? "",
      image: session.user.image ?? "",
      values: body.values,
      createdAt: new Date(),
    });

    await markSurveyCompleted(email);

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Survey save failed:", error);
    return NextResponse.json({ error: "Failed to save survey" }, { status: 500 });
  }
}
