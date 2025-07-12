"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    // Optionally show a loading spinner while checking
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

export function AdminAuthGuard({ children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "admin") {
      router.replace("/");
      return;
    }

    setChecked(true);
  }, []);

  if (!checked) {
    // Optionally show a loading spinner while checking
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
