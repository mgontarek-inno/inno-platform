import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SurveyForm from "./SurveyForm";

export default async function SurveyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.status !== "approved") {
    redirect("/pending");
  }

  if (session.user.surveyCompleted) {
    redirect("/profiles");
  }

  return (
    <SurveyForm
      email={session.user.email}
      name={session.user.name}
      image={session.user.image}
    />
  );
}
