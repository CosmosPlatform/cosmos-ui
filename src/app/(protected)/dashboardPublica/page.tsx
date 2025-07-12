import type { Metadata } from "next";
// import { checkAuth } from "@/app/admin/actions"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for your application",
};

export default async function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Total Users</h3>
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-muted-foreground text-xs">+12% from last month</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">
              Active Sessions
            </h3>
          </div>
          <div className="text-2xl font-bold">435</div>
          <p className="text-muted-foreground text-xs">+5% from last week</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">Revenue</h3>
          </div>
          <div className="text-2xl font-bold">$12,543</div>
          <p className="text-muted-foreground text-xs">+18% from last month</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">
              Pending Orders
            </h3>
          </div>
          <div className="text-2xl font-bold">23</div>
          <p className="text-muted-foreground text-xs">-2 from yesterday</p>
        </div>
      </div>
    </div>
  );
}
