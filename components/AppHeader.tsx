"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./AppHeader.module.css";

interface Props {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export default function AppHeader({ email, name, image }: Props) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span className={styles.logoText}>Program dla Founderów</span>
      </Link>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link href="/profile/edit" className={styles.editProfile}>
          Edytuj profil
        </Link>
        <button
          type="button"
          className={styles.signOut}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Wyloguj
        </button>
      </div>
     
    </header>
  );
}
