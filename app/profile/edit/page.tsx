import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import AppHeader from "@/components/AppHeader";
import EditProfileClient from "@/app/profile/EditProfileClient";
import { FormValues } from "@/lib/survey-data";
import { formatProfileDate } from "@/lib/format-date";
import styles from "@/app/profiles/profiles.module.css";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";

interface ProfileDoc {
  _id: { toString(): string };
  values: FormValues;
  email?: string;
  name?: string;
  image?: string;
  userId?: string;
  createdAt?: Date | string;
}

function toProfileItem(doc: ProfileDoc) {
  const created = doc.createdAt != null ? new Date(doc.createdAt) : null;
  return {
    id: doc._id.toString(),
    values: doc.values,
    email: doc.email ?? null,
    hasEmail: Boolean(doc.email),
    userId: doc.userId ?? null,
    name: doc.name ?? null,
    image: doc.image ?? null,
    createdAtLabel:
      created && !Number.isNaN(created.getTime())
        ? formatProfileDate(created)
        : null,
  };
}

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  if (session.user.status !== "approved") {
    redirect("/pending");
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const orConditions: Record<string, unknown>[] = [{ email: session.user.email }];
  if (session.user.googleId) {
    orConditions.push({ userId: session.user.googleId });
  }

  const doc = await db.collection<ProfileDoc>(COLLECTION_NAME).findOne({
    $or: orConditions,
  });

  if (!doc) {
    redirect("/survey");
  }

  const profile = toProfileItem(doc!);

  return (
    <>
      <AppHeader
        email={session.user.email}
        name={session.user.name}
        image={session.user.image}
        isAdmin={session.user.role === "admin"}
      />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Edytuj mój profil</h1>
          <EditProfileClient profile={profile} emailVisible={session.user.emailVisible ?? true} />
        </div>
      </main>
    </>
  );
}
