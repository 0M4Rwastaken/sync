import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sync",
  description: "Sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        variables: {
          fontFamily:
            '"Google Sans Variable", ui-sans-serif, system-ui, sans-serif',
        },
      }}
    >
      <html lang="en" className="h-full antialiased" suppressHydrationWarning>
        <body className="flex min-h-full flex-col font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
