import type { User } from "@clerk/nextjs/server"
import { db } from "./db"

export async function syncUser(clerkUser: User) {
  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null

  return db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email, name, imageUrl: clerkUser.imageUrl || null },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
      imageUrl: clerkUser.imageUrl || null,
    },
  })
}
