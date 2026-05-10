export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-mesh-page relative isolate flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="auth-mesh-blur pointer-events-none" aria-hidden />
      <div className="relative z-10 w-full max-w-[440px]">{children}</div>
    </div>
  );
}
