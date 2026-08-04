import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
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

  redirect("/profiles");
}
