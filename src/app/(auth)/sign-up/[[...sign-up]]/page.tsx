import { SignUp } from "@clerk/nextjs";

import { authClerkAppearance } from "@/lib/clerk-auth-appearance";

export default function SignUpPage() {
  return <SignUp appearance={authClerkAppearance} />;
}
