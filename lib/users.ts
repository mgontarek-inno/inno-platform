import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.MONGODB_DB ?? "startup-survey";
const USERS_COLLECTION = "users";

export interface UserDoc {
  _id?: unknown;
  email: string;
  name: string;
  image: string;
  googleId: string;
  surveyCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertUserFromGoogle(profile: {
  email: string;
  name: string;
  image: string;
  googleId: string;
}): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const now = new Date();

  await db.collection(USERS_COLLECTION).updateOne(
    { email: profile.email },
    {
      $set: {
        email: profile.email,
        name: profile.name,
        image: profile.image,
        googleId: profile.googleId,
        updatedAt: now,
      },
      $setOnInsert: {
        surveyCompleted: false,
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export async function getUserByEmail(
  email: string
): Promise<UserDoc | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const doc = await db.collection<UserDoc>(USERS_COLLECTION).findOne({ email });
  return doc;
}

export async function markSurveyCompleted(email: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection(USERS_COLLECTION).updateOne(
    { email },
    { $set: { surveyCompleted: true, updatedAt: new Date() } }
  );
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection(USERS_COLLECTION).deleteOne({ email });
}
