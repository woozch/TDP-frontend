import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/chat" as Parameters<typeof redirect>[0]);
  }
  redirect("/signin" as Parameters<typeof redirect>[0]);
}
