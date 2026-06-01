import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const user = await getUserByEmail(session.user.email);
    redirect(user?.surveyCompleted ? "/profiles" : "/survey");
  }

  return <LoginForm />;
}
