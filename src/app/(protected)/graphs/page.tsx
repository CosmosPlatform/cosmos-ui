"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Network,
  RefreshCw,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getApplicationsInteractions,
  type GetApplicationsInteractionsResponse,
} from "@/lib/api/monitoring/monitoring";
import { getTeams } from "@/lib/api/teams/teams";
import ApplicationGraph from "@/components/graphs/applicationGraph";

type Team = {
  name: string;
  description: string;
};

export default function GraphsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [includeNeighbors, setIncludeNeighbors] = useState(false);
  const [interactions, setInteractions] =
    useState<GetApplicationsInteractionsResponse | null>(null);

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Load teams on component mount
  useEffect(() => {
    const loadTeams = async () => {
      setLoadingTeams(true);

      const result = await getTeams();
      if (result.error) {
        toast.error("Failed to load teams: " + result.error.error);
        setTeams([]);
      } else {
        const teamsData = result.data?.teams || [];
        setTeams(teamsData);
        // By default, select all teams
        setSelectedTeams(teamsData.map((team) => team.name));
      }

      setLoadingTeams(false);
    };

    loadTeams();
  }, []);

  // Load interactions when teams are loaded and filters change
  useEffect(() => {
    if (!loadingTeams) {
      loadInteractions();
    }
  }, [selectedTeams, includeNeighbors, loadingTeams, teams]);

  const loadInteractions = async () => {
    setLoadingInteractions(true);

    const request = {
      teams: selectedTeams.length > 0 ? selectedTeams : undefined,
      includeNeighbors,
    };

    const result = await getApplicationsInteractions(request);
    if (result.error) {
      toast.error("Failed to load interactions: " + result.error.error);
      setInteractions(null);
    } else {
      setInteractions(result.data || null);
    }

    setLoadingInteractions(false);
  };

  const handleTeamToggle = (teamName: string, checked: boolean) => {
    setSelectedTeams((prev) => {
      if (checked) {
        return [...prev, teamName];
      } else {
        return prev.filter((name) => name !== teamName);
      }
    });
  };

  const handleSelectAllTeams = () => {
    setSelectedTeams(teams.map((team) => team.name));
  };

  const handleDeselectAllTeams = () => {
    setSelectedTeams([]);
  };

  const allTeamsSelected = selectedTeams.length === teams.length;
  const noTeamsSelected = selectedTeams.length === 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Application Interactions Graph</h1>
        <p className="text-muted-foreground mt-2">
          Visualize interactions between applications across teams
        </p>
      </div>

      <div className="grid gap-6">
        {/* Filters Card */}
        <Card>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle>Filters</CardTitle>
                  </div>
                  {isFiltersOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <CardDescription>
                  Configure which teams and interactions to display
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Teams Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Teams</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllTeams}
                        disabled={allTeamsSelected || loadingTeams}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAllTeams}
                        disabled={noTeamsSelected || loadingTeams}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  {loadingTeams ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading teams...</span>
                    </div>
                  ) : teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {teams.map((team) => (
                        <div
                          key={team.name}
                          className="flex items-center space-x-2 p-3 rounded-lg border"
                        >
                          <Checkbox
                            id={`team-${team.name}`}
                            checked={selectedTeams.includes(team.name)}
                            onCheckedChange={(checked) =>
                              handleTeamToggle(team.name, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`team-${team.name}`}
                              className="font-medium cursor-pointer"
                            >
                              {team.name}
                            </Label>
                            <p className="text-xs text-muted-foreground truncate">
                              {team.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No teams available
                    </div>
                  )}
                </div>

                {/* Include Neighbors Switch */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label htmlFor="include-neighbors" className="font-medium">
                      Include Neighbors
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Include applications outside selected teams that interact
                      with them
                    </p>
                  </div>
                  <Switch
                    id="include-neighbors"
                    checked={includeNeighbors}
                    onCheckedChange={setIncludeNeighbors}
                  />
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={loadInteractions}
                    disabled={loadingInteractions}
                    className="min-w-32"
                  >
                    {loadingInteractions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {loadingInteractions ? "Loading..." : "Refresh"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Graph Card */}
        <Card className="h-full w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Interactions Graph</CardTitle>
            </div>
            <CardDescription>
              {selectedTeams.length > 0 ? (
                <>
                  Showing interactions for {selectedTeams.length} team(s):{" "}
                  {selectedTeams.join(", ")}
                  {includeNeighbors && " (including neighbors)"}
                </>
              ) : (
                "Select teams to view their application interactions"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full w-full">
            {loadingInteractions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span className="text-lg">Loading interactions graph...</span>
              </div>
            ) : interactions ? (
              <div className="h-full w-full">
                {interactions.dependencies.length > 0 ? (
                  <ApplicationGraph
                    applicationData={{
                      mainApplication: "",
                      applicationsInvolved: interactions.applicationsInvolved,
                      dependencies: interactions.dependencies,
                    }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No interactions found
                    </h3>
                    <p>
                      No application interactions were found for the selected
                      teams.
                    </p>
                    <p className="text-sm mt-2">
                      Try selecting different teams or enabling "Include
                      Neighbors".
                    </p>
                  </div>
                )}
              </div>
            ) : noTeamsSelected ? (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Select teams to view interactions
                </h3>
                <p>
                  Choose one or more teams from the filters above to display
                  their application interactions.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No data available
                </h3>
                <p>Unable to load interaction data. Please try refreshing.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
