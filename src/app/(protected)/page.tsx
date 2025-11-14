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
import {
  Users,
  Box,
  Boxes,
  AlertCircle,
  Mail,
  Shield,
  ArrowRight,
} from "lucide-react";
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Welcome back, {user.username}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your applications today
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Boxes className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{user.role}</p>
                <p className="text-sm text-muted-foreground">Role</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Information Card */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Your Team</CardTitle>
            </div>
            <CardDescription>Team information and details</CardDescription>
          </CardHeader>
          <CardContent>
            {user.team ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{user.team.name}</h3>
                    <Badge variant="secondary" className="font-semibold">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {user.team.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Users className="h-10 w-10 opacity-50" />
                </div>
                <p className="font-medium mb-1">No team assigned</p>
                <p className="text-sm">
                  Contact your administrator to join a team
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications Card */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Boxes className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Team Applications</CardTitle>
                  <CardDescription>
                    {applications.length} application
                    {applications.length !== 1 ? "s" : ""} in your team
                  </CardDescription>
                </div>
              </div>
              {applications.length > 0 && (
                <Badge variant="outline" className="font-semibold">
                  {applications.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 max-h-[400px] overflow-y-auto pr-2">
                {applications.map((app) => (
                  <Link
                    key={app.name}
                    href={`/applications/${app.name}`}
                    className="group relative border rounded-xl p-4 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Box className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {app.name}
                        </h4>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {app.description}
                    </p>

                    {app.team && (
                      <Badge variant="outline" className="text-xs">
                        {app.team.name}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                  <Boxes className="h-16 w-16 opacity-50" />
                </div>
                <p className="font-semibold text-lg mb-2">
                  No applications yet
                </p>
                {user.team ? (
                  <p className="text-sm">
                    Your team hasn't created any applications yet
                  </p>
                ) : (
                  <p className="text-sm">
                    Join a team to see and create applications
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Details Card */}
      <Card className="hover:shadow-lg transition-shadow border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Account Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Username
              </p>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </p>
              <div className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Account Role
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-base px-4 py-2 font-semibold capitalize"
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
