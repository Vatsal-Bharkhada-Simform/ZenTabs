export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Auth pages manage their own full-viewport layout via AuthShell.
  // Root layout provides <html> / <body> / fonts — nothing else needed here.
  return <>{children}</>;
}
