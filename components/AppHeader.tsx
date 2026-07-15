"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import styles from "./AppHeader.module.css";

interface Props {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  hideEditProfile?: boolean;
}

export default function AppHeader({ email, name, image, hideEditProfile }: Props) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/dark_logo.png"
          alt="Innovations Hub Foundation"
          width={440}
          height={83}
          className={styles.logoImage}
          priority
        />
      </Link>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!hideEditProfile && (
          <Link href="/profile/edit" className={styles.editProfile}>
            Edytuj profil
          </Link>
        )}
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
