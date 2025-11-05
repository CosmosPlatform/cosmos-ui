"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Server,
  ChevronRight,
  Users,
  GitBranch,
  Monitor,
  BookOpen,
  Network,
} from "lucide-react";
import { toast } from "sonner";
import { getGroup, type Group } from "@/lib/api/groups/groups";
import {
  GetGroupApplicationsInteractions,
  type GetApplicationsInteractionsResponse,
} from "@/lib/api/monitoring/monitoring";
import { Badge } from "@/components/ui/badge";
import ApplicationGraph from "@/components/graphs/applicationGraph";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupName = params.name as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [interactions, setInteractions] =
    useState<GetApplicationsInteractionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!groupName) {
        return;
      }

      setLoading(true);

      // Load group details
      const groupResult = await getGroup(decodeURIComponent(groupName));
      if (groupResult.error) {
        toast.error("Failed to load group: " + groupResult.error.error);
        router.push("/groups");
        return;
      }

      setGroup(groupResult.data?.group || null);

      // Load interactions
      await loadInteractions();

      setLoading(false);
    };

    loadData();
  }, [groupName, router]);

  const loadInteractions = async () => {
    if (!groupName) {
      return;
    }

    setLoadingInteractions(true);

    const result = await GetGroupApplicationsInteractions(
      decodeURIComponent(groupName),
    );
    if (result.error) {
      toast.error("Failed to load interactions: " + result.error.error);
      setInteractions(null);
    } else {
      setInteractions(result.data || null);
    }

    setLoadingInteractions(false);
  };

  const handleApplicationClick = (applicationName: string) => {
    router.push(`/applications/${encodeURIComponent(applicationName)}`);
  };

  const handleBackClick = () => {
    router.push("/groups");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Group not found</h3>
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist.
          </p>
          <Button onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground mt-1">{group.description}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Interactions Graph */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                <CardTitle>Group Interactions</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadInteractions}
                disabled={loadingInteractions}
              >
                {loadingInteractions ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
            <CardDescription>
              Visualize interactions between applications in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInteractions ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : interactions &&
              interactions.dependencies &&
              interactions.dependencies.length > 0 ? (
              <ApplicationGraph applicationData={interactions} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interactions found for this group</p>
                <p className="text-sm mt-2">
                  Applications in this group may not have monitoring enabled or
                  have no dependencies yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <CardTitle>Applications</CardTitle>
            </div>
            <CardDescription>
              {group.members.length} application(s) in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!group.members || group.members.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications in this group</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.members.map((application) => (
                  <Card
                    key={application.name}
                    className="group relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    onClick={() => handleApplicationClick(application.name)}
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardHeader className="relative space-y-4">
                      <CardTitle className="flex items-start justify-between gap-3 text-lg font-semibold tracking-tight text-foreground">
                        <span className="transition-colors duration-300 group-hover:text-primary">
                          {application.name}
                        </span>
                        {application.gitInformation && (
                          <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm text-muted-foreground/90">
                        {application.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-2">
                        {application.team && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {application.team.name}
                          </Badge>
                        )}
                        {application.monitoringInformation?.hasOpenAPI && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Monitor className="h-3 w-3" />
                            OpenAPI
                          </Badge>
                        )}
                        {application.monitoringInformation?.hasOpenClient && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <BookOpen className="h-3 w-3" />
                            OpenClient
                          </Badge>
                        )}
                      </div>

                      {application.gitInformation && (
                        <div className="rounded-md border border-dashed border-border/60 bg-muted/40 p-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {application.gitInformation.repositoryOwner}/
                              {application.gitInformation.repositoryName}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {application.gitInformation.repositoryBranch}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="relative flex items-center justify-between border-t border-border/60 px-6 py-3 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                      <span>Click to view details</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
