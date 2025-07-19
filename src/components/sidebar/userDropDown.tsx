"use client";

import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserDropdown() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          Username
          <ChevronUp className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        className="w-[--radix-popper-anchor-width]"
      >
        <DropdownMenuItem>
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
