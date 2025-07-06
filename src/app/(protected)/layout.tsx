import RootLayout from "@/app/layout";
import RegularAuthGuard from "@/components/auth/authGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout>
      <RegularAuthGuard>{children}</RegularAuthGuard>
    </RootLayout>
  );
}
