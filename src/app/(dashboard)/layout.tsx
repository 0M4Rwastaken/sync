import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PodLayout } from "@/components/pod/pod-layout";
import { syncUser } from "@/lib/sync-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  if (clerkUser) await syncUser(clerkUser);

  return <PodLayout>{children}</PodLayout>;
}
