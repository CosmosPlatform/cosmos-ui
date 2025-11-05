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
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Server, Network } from "lucide-react";
import { toast } from "sonner";
import { getGroup, type Group } from "@/lib/api/groups/groups";
import {
  GetGroupApplicationsInteractions,
  type GetApplicationsInteractionsResponse,
} from "@/lib/api/monitoring/monitoring";
import ApplicationGraph from "@/components/graphs/applicationGraph";
import { AppCard } from "@/components/cards/appCard";

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
                  <AppCard
                    key={application.name}
                    application={application}
                    onClick={handleApplicationClick}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
