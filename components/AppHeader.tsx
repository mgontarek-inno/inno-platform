"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import styles from "./AppHeader.module.css";

interface Props {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export default function AppHeader({ email, name, image }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span className={styles.logoText}>Founders Program</span>
      </div>
      <div className={styles.user}>
        {image ? (
          <Image
            src={image}
            alt=""
            width={36}
            height={36}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <span className={styles.avatarPlaceholder} aria-hidden>
            {(name?.[0] ?? email?.[0] ?? "?").toUpperCase()}
          </span>
        )}
        <div className={styles.userMeta}>
          {name && <span className={styles.userName}>{name}</span>}
          {email && <span className={styles.userEmail}>{email}</span>}
        </div>
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
