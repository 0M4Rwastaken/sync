import { SignIn } from "@clerk/nextjs";

import { authClerkAppearance } from "@/lib/clerk-auth-appearance";

export default function SignInPage() {
  return <SignIn appearance={authClerkAppearance} />;
}
