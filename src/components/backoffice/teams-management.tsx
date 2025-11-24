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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, Trash2, AlertCircle, Pencil } from "lucide-react";
import {
  createTeam,
  getTeams,
  deleteTeam,
  updateTeam,
  type CreateTeamRequest,
  type UpdateTeamRequest,
} from "@/lib/api/teams/teams";
import { toast } from "sonner";

export function TeamsManagement() {
  const [teams, setTeams] = useState<
    Array<{
      name: string;
      description?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<string | null>(null);
  const [createTeamError, setCreateTeamError] = useState<string>("");

  const [newTeam, setNewTeam] = useState<CreateTeamRequest>({
    name: "",
    description: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<{
    originalName: string;
    name: string;
    description: string;
  } | null>(null);
  const [updateTeamError, setUpdateTeamError] = useState<string>("");

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
    setCreateTeamError("");

    if (!newTeam.name) {
      setCreateTeamError("Team name is required");
      return;
    }

    setIsCreating(true);

    const result = await createTeam(newTeam);
    if (result.error) {
      console.error("Error creating team:", result.error);
      setCreateTeamError(result.error.error || "Failed to create team");
    } else {
      toast.success("Team created successfully");
      setNewTeam({ name: "", description: "" });
      setCreateTeamError("");
      setIsDialogOpen(false);
      fetchTeams();
    }

    setIsCreating(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setCreateTeamError("");
      setNewTeam({ name: "", description: "" });
    }
    setIsDialogOpen(open);
  };

  const handleDeleteTeam = async (teamName: string) => {
    setDeletingTeam(teamName);
    const result = await deleteTeam(teamName);
    if (result.error) {
      console.error("Error deleting team:", result.error);
      toast.error("Failed to delete team");
    } else {
      toast.success("Team deleted successfully");
      fetchTeams();
    }
    setDeletingTeam(null);
  };

  const handleEditTeam = (team: { name: string; description?: string }) => {
    setEditingTeam({
      originalName: team.name,
      name: team.name,
      description: team.description || "",
    });
    setUpdateTeamError("");
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    setUpdateTeamError("");

    if (!editingTeam.name) {
      setUpdateTeamError("Team name is required");
      return;
    }

    setIsUpdating(true);

    const updateRequest: UpdateTeamRequest = {};
    if (editingTeam.name !== editingTeam.originalName) {
      updateRequest.name = editingTeam.name;
    }
    if (editingTeam.description) {
      updateRequest.description = editingTeam.description;
    }

    const result = await updateTeam(editingTeam.originalName, updateRequest);
    if (result.error) {
      console.error("Error updating team:", result.error);
      setUpdateTeamError(result.error.error || "Failed to update team");
    } else {
      toast.success("Team updated successfully");
      setEditingTeam(null);
      setUpdateTeamError("");
      setIsEditDialogOpen(false);
      fetchTeams();
    }

    setIsUpdating(false);
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setUpdateTeamError("");
      setEditingTeam(null);
    }
    setIsEditDialogOpen(open);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teams ({teams.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
            <div className="space-y-6">
              {createTeamError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{createTeamError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
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

              <div className="space-y-3">
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.name}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.description || "No description"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeam(team)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingTeam === team.name}
                        >
                          {deletingTeam === team.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the team "
                            {team.name}
                            "? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTeam(team.name)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Team
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {updateTeamError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{updateTeamError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="editTeamName">Team Name</Label>
              <Input
                id="editTeamName"
                value={editingTeam?.name || ""}
                onChange={(e) =>
                  setEditingTeam(
                    editingTeam
                      ? { ...editingTeam, name: e.target.value }
                      : null,
                  )
                }
                placeholder="Enter team name"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="editTeamDescription">
                Description (Optional)
              </Label>
              <Textarea
                id="editTeamDescription"
                value={editingTeam?.description || ""}
                onChange={(e) =>
                  setEditingTeam(
                    editingTeam
                      ? { ...editingTeam, description: e.target.value }
                      : null,
                  )
                }
                placeholder="Enter team description"
                rows={3}
              />
            </div>

            <Button
              onClick={handleUpdateTeam}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
