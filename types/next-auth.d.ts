import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      status?: "pending" | "approved";
      role?: "user" | "admin";
      emailVisible?: boolean;
      profileVisible?: boolean;
      googleId?: string;
      surveyCompleted?: boolean;
    };
  }
}
