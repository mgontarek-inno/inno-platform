import clientPromise from "@/lib/mongodb";
import { getDbName, isAdminEmail } from "@/lib/env";

const USERS_COLLECTION = "users";

export type UserStatus = "pending" | "approved";
export type UserRole = "user" | "admin";

export interface UserDoc {
  _id?: unknown;
  email: string;
  name: string;
  image: string;
  googleId: string;
  surveyCompleted: boolean;
  status?: UserStatus;
  role?: UserRole;
  emailVisible?: boolean;
  profileVisible?: boolean;
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
  const db = client.db(getDbName());
  const now = new Date();
  const admin = isAdminEmail(profile.email);

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
        status: admin ? "approved" : "pending",
        role: admin ? "admin" : "user",
        emailVisible: true,
        profileVisible: true,
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
  const db = client.db(getDbName());
  const doc = await db.collection<UserDoc>(USERS_COLLECTION).findOne({ email });
  return doc;
}

export async function markSurveyCompleted(email: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  await db.collection(USERS_COLLECTION).updateOne(
    { email },
    { $set: { surveyCompleted: true, updatedAt: new Date() } }
  );
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  await db.collection(USERS_COLLECTION).deleteOne({ email });
}

export interface UserSummary {
  email: string;
  name: string;
  status: UserStatus;
  role: UserRole;
  surveyCompleted: boolean;
  createdAt: Date;
}

export async function listAllUsers(): Promise<UserSummary[]> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  const docs = await db
    .collection<UserDoc>(USERS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    email: doc.email,
    name: doc.name,
    status: doc.status ?? "pending",
    role: doc.role ?? "user",
    surveyCompleted: Boolean(doc.surveyCompleted),
    createdAt: doc.createdAt,
  }));
}

export async function setUserStatus(
  email: string,
  status: UserStatus
): Promise<void> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  await db.collection(USERS_COLLECTION).updateOne(
    { email },
    { $set: { status, updatedAt: new Date() } }
  );
}

export async function setEmailVisible(
  email: string,
  visible: boolean
): Promise<void> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  await db.collection(USERS_COLLECTION).updateOne(
    { email },
    { $set: { emailVisible: visible, updatedAt: new Date() } }
  );
}

export async function setProfileVisible(
  email: string,
  visible: boolean
): Promise<void> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  await db.collection(USERS_COLLECTION).updateOne(
    { email },
    { $set: { profileVisible: visible, updatedAt: new Date() } }
  );
}
