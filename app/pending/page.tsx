import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import styles from "@/app/profiles/profiles.module.css";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.status === "approved") {
    redirect("/survey");
  }

  return (
    <>
      <AppHeader
        email={session.user.email}
        name={session.user.name}
        image={session.user.image}
        hideEditProfile
      />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Konto oczekuje na potwierdzenie</h1>
          <p className={styles.empty}>
            Twoje konto zostało utworzone, ale musi zostać potwierdzone przez
            administratora programu, zanim uzyskasz dostęp do ankiety i profili
            uczestników. Otrzymasz dostęp automatycznie po zatwierdzeniu — spróbuj
            zalogować się ponownie za jakiś czas.
          </p>
        </div>
      </main>
    </>
  );
}
