import AuthGate from "./auth-gate";

/** All routes inside this group require a signed-in user. */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
