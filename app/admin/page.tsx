import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listAllUsers } from "@/lib/users";
import AppHeader from "@/components/AppHeader";
import AdminClient from "./AdminClient";
import styles from "@/app/profiles/profiles.module.css";
import adminStyles from "./admin.module.css";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const users = await listAllUsers();

  return (
    <>
      <AppHeader
        email={session.user.email}
        name={session.user.name}
        image={session.user.image}
        isAdmin
      />
      <main className={styles.main}>
        <div className={`${styles.container} ${adminStyles.container}`}>
          <h1 className={styles.title}>Panel administratora</h1>
          <p className={styles.sub}>
            Zatwierdzaj nowych uczestników programu, żeby mogli wypełnić ankietę i
            zobaczyć profile innych osób.
          </p>
          <AdminClient users={users} currentEmail={session.user.email} />
        </div>
      </main>
    </>
  );
}
