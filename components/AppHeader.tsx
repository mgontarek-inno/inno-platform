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
        <span className={styles.logoText}>Program dla założycieli</span>
      </div>
      <button
          type="button"
          className={styles.signOut}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Wyloguj
        </button>
     
    </header>
  );
}
