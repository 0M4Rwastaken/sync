import { headers } from "next/headers"
import { Webhook } from "svix"
import { db } from "@/lib/db"

export const runtime = "nodejs"

type EmailAddress = { email_address: string }

type ClerkUserPayload = {
  id: string
  email_addresses: EmailAddress[]
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

type WebhookEvent =
  | { type: "user.created"; data: ClerkUserPayload }
  | { type: "user.updated"; data: ClerkUserPayload }
  | { type: "user.deleted"; data: { id: string } }

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return new Response("Missing webhook secret", { status: 500 })
  }

  const headerStore = await headers()
  const svixId = headerStore.get("svix-id")
  const svixTimestamp = headerStore.get("svix-timestamp")
  const svixSignature = headerStore.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await request.text()

  let event: WebhookEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data
    const email = email_addresses[0]?.email_address
    if (!email) return new Response("No email on user", { status: 400 })

    const name = [first_name, last_name].filter(Boolean).join(" ") || null

    await db.user.upsert({
      where: { clerkId: id },
      update: { email, name, imageUrl: image_url },
      create: { clerkId: id, email, name, imageUrl: image_url },
    })
  }

  if (event.type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: event.data.id } })
  }

  return new Response(null, { status: 200 })
}
