Read 'AGENTS.md' before starting.

## Context

Clerk is handling authentication and PostgreSQL via Prisma
is handling application data. Right now these two systems
are disconnected. A user can sign in via Clerk but no User
record exists in the database for them.

This spec wires them together using a Clerk webhook. Every
time a user signs up, updates their profile, or deletes
their account Clerk sends an event to our app and we
create, update, or delete the corresponding User record
in PostgreSQL automatically.

The User table is the foundation every other feature
depends on. A message needs a userId. A workspace member
needs a userId. Nothing works without a User row existing
first.

---

## Goal

Create a Clerk webhook endpoint that listens for user
events and keeps the PostgreSQL User table in sync with
Clerk automatically. After this spec every sign in will
have a corresponding User row in the database.

---

## Files to create

- src/app/api/webhooks/clerk/route.ts

---

## Packages to install

Run this before writing any code:

```bash
npm install svix
```

Svix is the webhook delivery service Clerk uses internally.
It is required to verify that incoming webhook requests
are genuinely from Clerk and not from a malicious source.

---

## Step 1 — Add webhook route to public routes

Open src/proxy.ts and add the webhook path to the
public routes matcher so Clerk can call it without
being blocked by auth:

```ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])
```

This is required because Clerk calls the webhook from
their own servers. There is no user session attached
to these requests so the route must be public.

---

## Step 2 — Create the webhook handler

Create src/app/api/webhooks/clerk/route.ts:

```ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name]
      .filter(Boolean)
      .join(' ') || email || 'Unknown'

    try {
      await db.user.create({
        data: {
          clerkId:  id,
          name,
          email:    email ?? '',
          imageUrl: image_url ?? null,
        },
      })
      console.log(`User created in database: ${id}`)
    } catch (err) {
      console.error(`Failed to create user ${id}:`, err)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.updated') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name]
      .filter(Boolean)
      .join(' ') || email || 'Unknown'

    try {
      await db.user.upsert({
        where: { clerkId: id },
        update: {
          name,
          email:    email ?? '',
          imageUrl: image_url ?? null,
        },
        create: {
          clerkId:  id,
          name,
          email:    email ?? '',
          imageUrl: image_url ?? null,
        },
      })
      console.log(`User updated in database: ${id}`)
    } catch (err) {
      console.error(`Failed to update user ${id}:`, err)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (id) {
      try {
        await db.user.delete({
          where: { clerkId: id },
        })
        console.log(`User deleted from database: ${id}`)
      } catch (err) {
        console.error(`Failed to delete user ${id}:`, err)
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json(
    { message: 'Webhook processed successfully' },
    { status: 200 }
  )
}
```

---

## Step 3 — Add environment variable

Open .env and add this line: CLERK_WEBHOOK_SECRET=""

Leave the value empty for now. The actual secret comes
from the Clerk dashboard in the manual setup step below.

Do not proceed past this step until the user confirms
the webhook secret has been added to .env.

---

## Step 4 — Update env.ts

Open src/lib/env.ts and add CLERK_WEBHOOK_SECRET to
the validation schema:

```ts
const envSchema = z.object({
  DATABASE_URL:                      z.string().min(1),
  DIRECT_URL:                        z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY:                  z.string().min(1),
  CLERK_WEBHOOK_SECRET:              z.string().min(1),
  ANTHROPIC_API_KEY:                 z.string().min(1),
  RESEND_API_KEY:                    z.string().min(1),
  UPSTASH_REDIS_REST_URL:            z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN:          z.string().min(1),
  TRIGGER_API_KEY:                   z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

---

## Step 5 — Manual setup required

The following steps must be completed manually by the
user before the webhook will work. The agent cannot
complete these steps.

### Install ngrok

ngrok creates a public tunnel to your local dev server
so Clerk can reach it. Open a new terminal and run:

```bash
npm install -g ngrok
ngrok http 3000
```

ngrok will give you a public URL that looks like:
https://abc123.ngrok.io

Keep this terminal running alongside your dev server.
The URL changes every time you restart ngrok.

### Register the webhook in Clerk

1. Go to clerk.com and open the Sync application
2. Click Webhooks in the left sidebar
3. Click Add Endpoint
4. Paste your ngrok URL as the endpoint:
   https://abc123.ngrok.io/api/webhooks/clerk
5. Under Subscribe to events select exactly these three:
   - user.created
   - user.updated
   - user.deleted
6. Click Create
7. On the next screen copy the Signing Secret
8. Paste it as the value for CLERK_WEBHOOK_SECRET
   in your .env file
9. Restart the dev server after saving .env

---

## Step 6 — Verify it is working

After completing the manual setup above test the
webhook by signing out and signing back in to Sync.

Then open Prisma Studio:

```bash
npx prisma studio
```

Navigate to the User table. You should see one row
with your real name, email, imageUrl, and clerkId.

If the row is there the webhook is working correctly
and user sync is complete.

### Debugging if the row does not appear

Check these in order:

1. Open the Clerk dashboard and go to
   Webhooks → your endpoint → Logs
   You should see a delivered event for user.created
   If it shows failed look at the error message

2. Confirm ngrok is still running and the URL in
   the Clerk dashboard matches your current ngrok URL

3. Confirm CLERK_WEBHOOK_SECRET in .env matches
   the Signing Secret shown in the Clerk dashboard
   exactly — no extra spaces or characters

4. Confirm the dev server is running on port 3000

5. Check the terminal running npm run dev for any
   error messages from the webhook handler

---

## Definition of done

- svix is installed in package.json
- src/app/api/webhooks/clerk/route.ts exists and
  handles user.created, user.updated, user.deleted
- The webhook route /api/webhooks/(.*) is listed
  as public in src/proxy.ts
- CLERK_WEBHOOK_SECRET is set in .env with a real
  value from the Clerk dashboard
- CLERK_WEBHOOK_SECRET is validated in env.ts
- Signing out and signing back in creates a real
  User row in the PostgreSQL User table
- The User row contains correct name, email,
  imageUrl, and clerkId
- Prisma Studio confirms the row exists
- npm run dev starts without errors
- No TypeScript errors in any file

---

## Update progress tracker

Open context/progress-tracker.md and update:

### 06 — User sync
Status: Complete
- Installed svix for Clerk webhook verification
- Created webhook handler at
  src/app/api/webhooks/clerk/route.ts
- Handles user.created, user.updated, user.deleted
- Added /api/webhooks/(.*) to public routes
  in proxy.ts
- Added and validated CLERK_WEBHOOK_SECRET in
  .env and env.ts
- Registered webhook endpoint in Clerk dashboard
  subscribed to user.created, user.updated,
  user.deleted events
- Confirmed User row created in PostgreSQL
  after sign in via Prisma Studio

## In progress

### 07 — Workspace creation and join flow
Status: Not started