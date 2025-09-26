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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Network, RefreshCw, Loader2, Filter, ChevronDown } from "lucide-react";
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
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>([]); // Temporary selection for dropdown
  const [includeNeighbors, setIncludeNeighbors] = useState(false);
  const [interactions, setInteractions] =
    useState<GetApplicationsInteractionsResponse | null>(null);

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

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
        // Start with no teams selected (which shows all applications)
        setSelectedTeams([]);
        setTempSelectedTeams([]);
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
  }, [selectedTeams, includeNeighbors, loadingTeams]);

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
    if (checked) {
      setTempSelectedTeams((prev) => [...prev, teamName]);
    } else {
      setTempSelectedTeams((prev) => prev.filter((name) => name !== teamName));
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      // When opening, sync temp state with current state
      setTempSelectedTeams(selectedTeams);
    } else {
      // When closing, apply temp state to actual state
      setSelectedTeams(tempSelectedTeams);
    }
  };

  const getSelectedTeamsDisplay = () => {
    if (selectedTeams.length === 0) return "All teams";
    if (selectedTeams.length === 1) return selectedTeams[0];
    return `${selectedTeams.length} teams selected`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Application Interactions Graph</h1>
        <p className="text-muted-foreground mt-2">
          Visualize interactions between applications across teams
        </p>
      </div>

      <div className="grid gap-6">
        {/* Compact Filters Bar */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="font-medium">Filters:</Label>
          </div>
          {/* Teams Dropdown */}
          <DropdownMenu onOpenChange={handleDropdownOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-48 justify-between">
                {getSelectedTeamsDisplay()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
              <DropdownMenuLabel>Select Teams</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {loadingTeams ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading teams...</span>
                </div>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <div
                    key={team.name}
                    className="flex items-start space-x-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() =>
                      handleTeamToggle(
                        team.name,
                        !tempSelectedTeams.includes(team.name),
                      )
                    }
                  >
                    <Checkbox
                      id={`team-${team.name}`}
                      checked={tempSelectedTeams.includes(team.name)}
                      onCheckedChange={(checked) =>
                        handleTeamToggle(team.name, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()} // Prevent double toggle
                    />
                    <div className="flex flex-col items-start flex-1">
                      <Label
                        htmlFor={`team-${team.name}`}
                        className="font-medium cursor-pointer"
                      >
                        {team.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {team.description}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No teams available
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>{" "}
          {/* Include Neighbors Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="include-neighbors"
              checked={includeNeighbors}
              onCheckedChange={setIncludeNeighbors}
            />
            <Label htmlFor="include-neighbors" className="text-sm">
              Include Neighbors
            </Label>
          </div>
          {/* Refresh Button */}
          <Button
            onClick={loadInteractions}
            disabled={loadingInteractions}
            variant="outline"
            size="sm"
          >
            {loadingInteractions ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Graph Card */}
        <Card className="h-full w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Interactions Graph</CardTitle>
            </div>
            <CardDescription>
              {selectedTeams.length === 0 ? (
                <>
                  Showing interactions for all teams
                  {includeNeighbors && " (including neighbors)"}
                </>
              ) : (
                <>
                  Showing interactions for {selectedTeams.length} team(s):{" "}
                  {selectedTeams.join(", ")}
                  {includeNeighbors && " (including neighbors)"}
                </>
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
                  <ApplicationGraph applicationData={interactions} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No interactions found
                    </h3>
                    <p>
                      No application interactions were found for the selected
                      {selectedTeams.length === 0 ? " configuration" : " teams"}
                      .
                    </p>
                    <p className="text-sm mt-2">
                      Try{" "}
                      {selectedTeams.length === 0
                        ? "selecting specific teams"
                        : "selecting different teams"}{" "}
                      or toggling "Include Neighbors".
                    </p>
                  </div>
                )}
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
