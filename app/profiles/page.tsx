import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDbName } from "@/lib/env";
import clientPromise from "@/lib/mongodb";
import { formatProfileDate } from "@/lib/format-date";
import { FormValues } from "@/lib/survey-data";
import AppHeader from "@/components/AppHeader";
import ProfilesClient, { ProfileItem } from "./ProfilesClient";
import styles from "./profiles.module.css";

const DB_NAME = getDbName();
const COLLECTION_NAME = "profiles";

interface ProfileDoc {
  _id: { toString(): string };
  values: FormValues;
  email?: string;
  name?: string;
  image?: string;
  createdAt?: Date | string;
}

async function getProfiles(): Promise<ProfileDoc[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db
    .collection<ProfileDoc>(COLLECTION_NAME)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

function toProfileItem(doc: ProfileDoc, viewerEmail: string): ProfileItem {
  const created =
    doc.createdAt != null ? new Date(doc.createdAt) : null;
  const isOwnProfile = doc.email === viewerEmail;
  return {
    id: doc._id.toString(),
    values: doc.values,
    email: isOwnProfile ? doc.email ?? null : null,
    hasEmail: Boolean(doc.email),
    userId: (doc as any).userId ?? null,
    name: doc.name ?? null,
    image: doc.image ?? null,
    createdAtLabel:
      created && !Number.isNaN(created.getTime())
        ? formatProfileDate(created)
        : null,
  };
}

export default async function ProfilesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.status !== "approved") {
    redirect("/pending");
  }

  if (!session.user.surveyCompleted) {
    redirect("/survey");
  }

  const profiles = await getProfiles();
  const items = profiles.map((doc) => toProfileItem(doc, session.user.email as string));

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

        <ProfilesClient
          profiles={items}
          currentEmail={session.user.email}
          currentUserId={session.user.googleId ?? null}
        />
      </div>
      </main>
    </>
  );
}
