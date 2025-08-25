"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getOwnUser } from "@/lib/api/users/users";

type Props = {
  children: React.ReactNode;
};

export default function RegularAuthGuard({ children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

export function AdminAuthGuard({ children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const result = await getOwnUser();
      if (result.error) {
        console.error("Failed to fetch user:", result.error);
        router.replace("/login");
        return;
      }

      if (result.data.user.role !== "admin") {
        router.replace("/");
        return;
      }

      setChecked(true);
    };

    checkUserRole();
  }, [router]);

  if (!checked) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
