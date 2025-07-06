import ProtectedLayout from "@/app/(protected)/layout";
import { AdminAuthGuard } from "@/components/auth/authGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </ProtectedLayout>
  );
}
