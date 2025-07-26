import { AdminAuthGuard } from "@/components/auth/authGuard";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminAuthGuard>{children}</AdminAuthGuard>
      <Toaster />
    </>
  );
}
