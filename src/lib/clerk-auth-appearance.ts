import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

type ClerkAppearance = NonNullable<ComponentProps<typeof SignIn>["appearance"]>;

/** Clerk prebuilt components styled to match the auth marketing UI (light card on mesh). */
export const authClerkAppearance: ClerkAppearance = {
  elements: {
    rootBox: "w-full flex justify-center",
    card: [
      "w-full rounded-[1.25rem] border border-auth-card-border bg-auth-card",
      "px-6 py-10 shadow-[var(--auth-card-shadow)] sm:px-10 sm:py-12",
    ].join(" "),
    headerTitle:
      "text-center text-xl font-bold tracking-tight text-auth-heading",
    headerSubtitle: "text-center text-sm text-auth-muted",
    socialButtonsBlockButton: [
      "justify-start rounded-md border border-auth-social-border",
      "bg-auth-social-bg text-auth-heading shadow-none",
      "hover:bg-auth-social-hover",
    ].join(" "),
    socialButtonsBlockButtonText: "font-medium text-auth-heading",
    dividerLine: "bg-auth-card-border",
    dividerText:
      "text-xs font-medium uppercase tracking-wider text-auth-muted",
    formFieldLabel: "text-sm font-semibold text-auth-heading",
    formFieldInput: [
      "rounded-md border border-auth-input-border bg-auth-input-bg",
      "text-auth-heading shadow-none placeholder:text-auth-muted",
    ].join(" "),
    formButtonPrimary: [
      "rounded-md bg-auth-cta font-semibold text-auth-cta-text shadow-none",
      "hover:bg-auth-cta-hover",
    ].join(" "),
    footerActionLink:
      "font-medium text-auth-link underline hover:text-auth-link-hover",
    footerActionText: "text-xs leading-relaxed text-auth-muted",
    identityPreviewText: "text-auth-heading",
    identityPreviewEditButton: "text-auth-link",
    formFieldHintText: "text-xs text-auth-muted",
    formResendCodeLink: "text-auth-link underline",
    otpCodeFieldInput:
      "border-auth-input-border bg-auth-input-bg text-auth-heading",
  },
};
