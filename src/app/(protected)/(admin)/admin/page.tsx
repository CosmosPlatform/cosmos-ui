"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersManagement } from "@/components/backoffice/users-management";
import { TeamsManagement } from "@/components/backoffice/teams-management";
import { SentinelSettings } from "@/components/backoffice/sentinel-settings";
import { Users, Users2, Settings } from "lucide-react";

export default function BackofficePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Backoffice</h1>
        <p className="text-muted-foreground">Manage users and teams</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="sentinel" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sentinel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentinel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentinel Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <SentinelSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
