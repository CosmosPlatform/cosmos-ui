"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Rocket, AlertCircle } from "lucide-react";
import { getOwnUser } from "@/lib/api/users/users";
import { getApplicationsByTeam } from "@/lib/api/applications/applications";

type UserData = {
  username: string;
  email: string;
  role: string;
  team?: {
    name: string;
    description: string;
  };
};

type Application = {
  name: string;
  description: string;
  team?: {
    name: string;
    description: string;
  };
};

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userResult = await getOwnUser();
        if (userResult.error) {
          setError("Failed to fetch user information");
          setLoading(false);
          return;
        }

        setUser(userResult.data.user);

        if (userResult.data.user.team) {
          const appsResult = await getApplicationsByTeam(
            userResult.data.user.team.name,
          );
          if (!appsResult.error) {
            setApplications(appsResult.data.applications);
          } else {
            setError("Failed to fetch applications");
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("HomePage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No user data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Your Team</CardTitle>
              <CardDescription>Team information and details</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {user.team ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{user.team.name}</h3>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.team.description}
                </p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>You're not assigned to any team yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Rocket className="h-5 w-5" />
            <div>
              <CardTitle>Team Applications</CardTitle>
              <CardDescription>
                {(applications ?? []).length} application
                {(applications ?? []).length !== 1 ? "s" : ""} in your team
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {applications.map((app) => (
                  <Link
                    key={app.name}
                    href={`/applications/${app.name}`}
                    className="block border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{app.name}</h4>
                      {app.team && (
                        <Badge variant="outline" className="text-xs">
                          {app.team.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Rocket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No applications found</p>
                {user.team ? (
                  <p className="text-xs mt-1">
                    Your team hasn't created any applications yet
                  </p>
                ) : (
                  <p className="text-xs mt-1">
                    Join a team to see applications
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Info Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
