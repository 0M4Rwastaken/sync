The pooled connection string is used for queries at
runtime. The direct connection string is used for
migrations. Both are available in the Neon dashboard
under Connection Details.

If DIRECT_URL is not set migrations will fail. Stop
and notify the user to add both values before proceeding.

---

## Step 3 — Generate the Prisma client

Run this command to generate the typed Prisma client
from the schema:

```bash
npx prisma generate
```

Confirm it completes without errors before proceeding.

---

## Step 4 — Run the first migration

Run the initial migration to create all tables in the
Neon database:

```bash
npx prisma migrate dev --name init
```

This command will:
- Connect to the Neon database using DIRECT_URL
- Create all five tables defined in the schema
- Generate a migration file in prisma/migrations/
- Regenerate the Prisma client

If this command fails check that both DATABASE_URL and
DIRECT_URL are set correctly in .env and that the Neon
database is active and accepting connections.

---

## Step 5 — Verify the database

Run Prisma Studio to confirm all tables were created
correctly:

```bash
npx prisma studio
```

Prisma Studio opens in the browser at localhost:5555.
Confirm these five tables are visible and empty:

- User
- Workspace
- WorkspaceMember
- Channel
- Message

Close Prisma Studio after confirming. It does not need
to stay running.

---

## Step 6 — Update src/lib/db.ts

Confirm src/lib/db.ts uses the singleton pattern. If
it does not match this exactly rewrite it:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

---

## Step 7 — Update src/lib/env.ts

Confirm src/lib/env.ts validates DATABASE_URL and
DIRECT_URL. If env.ts does not exist create it. The
file must include at minimum:

```ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:                      z.string().min(1),
  DIRECT_URL:                        z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY:                  z.string().min(1),
  ANTHROPIC_API_KEY:                 z.string().min(1),
  RESEND_API_KEY:                    z.string().min(1),
  UPSTASH_REDIS_REST_URL:            z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN:          z.string().min(1),
  TRIGGER_API_KEY:                   z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

---

## Definition of done

- prisma/schema.prisma contains all five models exactly
  as defined in this spec
- npx prisma generate completes without errors
- npx prisma migrate dev --name init completes without
  errors and creates a migrations folder
- Prisma Studio shows all five tables created and empty
- src/lib/db.ts uses the singleton pattern
- src/lib/env.ts validates all required environment
  variables
- npm run dev starts without errors after the migration
- No TypeScript errors in any file

---

## Update progress tracker

Open context/progress-tracker.md and add:

### 05 — Database schema
Status: Complete
- Defined five core Prisma models — User, Workspace,
  WorkspaceMember, Channel, Message
- Added MemberRole and ChannelType enums
- Configured dual connection strings for Neon —
  DATABASE_URL for runtime, DIRECT_URL for migrations
- Ran first migration — init
- Confirmed all five tables visible in Prisma Studio
- Updated src/lib/db.ts with singleton pattern
- Created src/lib/env.ts with full environment
  variable validation

## In progress

### 06 — User sync
Status: Not started