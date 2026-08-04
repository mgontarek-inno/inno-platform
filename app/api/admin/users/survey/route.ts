import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { FormValues } from "@/lib/survey-data";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";

interface ProfileDoc {
  email?: string;
  values?: FormValues;
  createdAt?: Date;
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const profile = await db
    .collection<ProfileDoc>(COLLECTION_NAME)
    .findOne({ email }, { sort: { createdAt: -1 } });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    values: profile.values ?? {},
    createdAt: profile.createdAt ?? null,
  });
}
