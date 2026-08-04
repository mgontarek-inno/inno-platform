import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, upsertUserFromGoogle } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await upsertUserFromGoogle({
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
          googleId: user.id,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.email) {
        return session;
      }

      session.user.email = token.email as string;
      session.user.name = (token.name as string) ?? session.user.name;
      session.user.image = (token.picture as string) ?? session.user.image;

      try {
        const dbUser = await getUserByEmail(token.email as string);

        if (!dbUser) {
          // Konto zostało usunięte (lub nigdy nie istniało) — token jest jeszcze ważny,
          // ale odcinamy dostęp natychmiast zamiast czekać na jego wygaśnięcie.
          session.user.email = undefined;
          session.user.name = undefined;
          session.user.image = undefined;
          return session;
        }

        session.user.status = dbUser.status ?? "pending";
        session.user.role = dbUser.role ?? "user";
        session.user.emailVisible = dbUser.emailVisible ?? true;
        session.user.googleId = dbUser.googleId;
        session.user.surveyCompleted = Boolean(dbUser.surveyCompleted);
      } catch (error) {
        // Awaria bazy nie może wywalać całego /api/auth/session — traktujemy
        // brak możliwości potwierdzenia statusu jako "pending" (fail-closed).
        console.error("Session enrichment failed:", error);
        session.user.status = "pending";
        session.user.role = "user";
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
