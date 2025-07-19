"use client";

import * as React from "react";
import { Home, Network, Server } from "lucide-react";

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
import { GetUser } from "@/lib/context";

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Services",
    url: "#",
    icon: Server,
  },
  {
    title: "Graphs",
    url: "#",
    icon: Network,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  let user = GetUser();
  if (!user) {
    user = {
      username: "Unknown User",
      email: "",
      role: "user",
    };
  }

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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
