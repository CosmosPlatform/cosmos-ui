"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Loader2, Users } from "lucide-react";
import {
  createTeam,
  getTeams,
  type CreateTeamRequest,
} from "@/lib/api/teams/teams";
import { toast } from "sonner";

export function TeamsManagement() {
  const [teams, setTeams] = useState<
    Array<{
      //id: string;
      name: string;
      description?: string;
      //createdAt: string;
      //memberCount?: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newTeam, setNewTeam] = useState<CreateTeamRequest>({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    const result = await getTeams();
    if (result.error) {
      toast.error("Failed to fetch teams");
    } else {
      setTeams(result.data.teams);
    }
    setIsLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      toast.error("Team name is required");
      return;
    }

    setIsCreating(true);

    const result = await createTeam(newTeam);
    if (result.error) {
      console.error("Error creating team:", result.error);
      toast.error("Failed to create team");
    } else {
      toast.success("Team created successfully");
      setNewTeam({ name: "", description: "" });
      setIsDialogOpen(false);
      fetchTeams();
    }

    setIsCreating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teams ({teams.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description (Optional)</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeam.description}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, description: e.target.value })
                  }
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreateTeam}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              {/* <TableHead>Members</TableHead> */}
              {/* <TableHead>Created</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.name}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.description || "No description"}</TableCell>
                {/* 
                <TableCell>
                    <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team.memberCount || 0}
                    </div>
                </TableCell>
                <TableCell>{formatDate(team.createdAt)}</TableCell>
                */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
