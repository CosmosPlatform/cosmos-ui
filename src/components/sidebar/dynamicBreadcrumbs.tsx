"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeNameMap: Record<string, string> = {
  "": "Home",
  services: "Services",
  graphs: "Service Graph",
  settings: "Settings",
  profile: "Profile",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const displayName =
      routeNameMap[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      href,
      name: displayName,
      isLast,
    };
  });

  const items = [
    { href: "/", name: "Home", isLast: breadcrumbItems.length === 0 },
    ...breadcrumbItems,
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, _) => (
          <div key={item.href} className="flex items-center">
            <BreadcrumbItem className="hidden md:block">
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
