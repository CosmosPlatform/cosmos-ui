"use client";

import * as React from "react";
import { Home, Network, Server, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { PageHeader } from "@/components/sidebar/page-header";
import { getOwnUser, User } from "@/lib/api/users/users";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Server,
  },
  {
    title: "Graphs",
    url: "#",
    icon: Network,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const defaultUser = {
    username: "Unknown User",
    email: "",
    role: "user",
  };
  const [user, setUser] = React.useState<User>(defaultUser);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      const userData = await getOwnUser();
      if (userData.error) {
        console.error("Failed to fetch user:", userData.error);
        setLoading(false);
        return;
      }
      setUser(userData.data.user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <PageHeader pageName="Cosmos" />
        </SidebarHeader>
        <SidebarContent>
          <div>Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <PageHeader pageName="Cosmos" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <Shield />
                      <span>Administration</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
