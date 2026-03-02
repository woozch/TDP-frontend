import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChatPage } from "@/screens/chat";

export default async function ChatRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin" as Parameters<typeof redirect>[0]);
  }
  return <ChatPage />;
}
