import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import clientPromise from "@/lib/mongodb";
import { FormValues } from "@/lib/survey-data";
import AppHeader from "@/components/AppHeader";
import ProfilesClient, { ProfileItem } from "./ProfilesClient";
import styles from "./profiles.module.css";

const DB_NAME = process.env.MONGODB_DB ?? "startup-survey";
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

function toProfileItem(doc: ProfileDoc): ProfileItem {
  const created =
    doc.createdAt != null ? new Date(doc.createdAt) : null;
  return {
    id: doc._id.toString(),
    values: doc.values,
    email: doc.email ?? null,
    name: doc.name ?? null,
    image: doc.image ?? null,
    createdAt: created && !Number.isNaN(created.getTime())
      ? created.toISOString()
      : null,
  };
}

export default async function ProfilesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user?.surveyCompleted) {
    redirect("/survey");
  }

  const profiles = await getProfiles();
  const items = profiles.map(toProfileItem);

  return (
    <>
      <AppHeader
        email={session.user.email}
        name={session.user.name}
        image={session.user.image}
      />
      <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Profiles</h1>
        <p className={styles.sub}>Submitted applications: {items.length}</p>

        <ProfilesClient profiles={items} />
      </div>
      </main>
    </>
  );
}
