import RegularAuthGuard from "@/components/auth/authGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RegularAuthGuard>{children}</RegularAuthGuard>;
}
