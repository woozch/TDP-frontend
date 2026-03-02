import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInPage } from "@/screens/signin";

export default async function SignInRoute() {
  const session = await auth();
  if (session?.user) {
    redirect("/chat" as Parameters<typeof redirect>[0]);
  }
  return <SignInPage />;
}
