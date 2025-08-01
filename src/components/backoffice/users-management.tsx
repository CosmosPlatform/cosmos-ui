"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash2, Users, UserMinus } from "lucide-react";
import {
  registerUser,
  getUsers,
  deleteUser,
  type RegisterUserRequest,
} from "@/lib/api/users/users";
import {
  getTeams,
  addTeamMember,
  removeTeamMember,
} from "@/lib/api/teams/teams";
import { toast } from "sonner";
import { GetUser } from "@/lib/context";
import { useRouter } from "next/navigation";

type UserWithTeam = {
  username: string;
  email: string;
  role: string;
  team?: Team;
};

type Team = {
  name: string;
  description: string;
};

export function UsersManagement() {
  const [users, setUsers] = useState<UserWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [managingTeamUser, setManagingTeamUser] = useState<UserWithTeam | null>(
    null,
  );
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isManagingTeam, setIsManagingTeam] = useState(false);
  const router = useRouter();

  const [newUser, setNewUser] = useState<RegisterUserRequest>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.error) {
      toast.error("Failed to fetch users");
    } else {
      setUsers(result.data.users);
    }
    setIsLoading(false);
  };

  const fetchTeams = async () => {
    const result = await getTeams();
    if (result.error) {
      console.error("Failed to fetch teams:", result.error);
    } else {
      setTeams(result.data.teams);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreating(true);
    const result = await registerUser(newUser);
    if (result.error) {
      console.error("Error creating user:", result.error);
      toast.error("Failed to create user");
    } else {
      toast.success("User created successfully");
      setNewUser({ username: "", email: "", password: "", role: "user" });
      setIsDialogOpen(false);
      fetchUsers();
    }
    setIsCreating(false);
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setDeletingEmail(email);

    const myUser = GetUser();
    if (myUser?.email === email) {
      if (!confirm("You are about to delete your own account. Are you sure?")) {
        setDeletingEmail(null);
        return;
      }
    }

    const result = await deleteUser(email);
    if (result.error) {
      console.error("Error deleting user:", result.error);
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted successfully");
      fetchUsers();
      if (myUser?.email === email) {
        toast.info("You have been logged out due to account deletion.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
    }
    setDeletingEmail(null);
  };

  const handleManageTeam = (user: UserWithTeam) => {
    setManagingTeamUser(user);
    setSelectedTeam(user.team?.name || "");
    setIsTeamDialogOpen(true);
  };

  const handleAssignToTeam = async () => {
    if (!managingTeamUser || !selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    setIsManagingTeam(true);

    // If the user already has a team, we remove them first
    if (managingTeamUser.team) {
      const removeResult = await removeTeamMember(
        managingTeamUser.team.name,
        managingTeamUser.email,
      );
      if (removeResult.error) {
        console.error("Error removing from team:", removeResult.error);
        toast.error("Failed to remove user from current team");
        setIsManagingTeam(false);
        return;
      }
    }

    const addResult = await addTeamMember(selectedTeam, {
      email: managingTeamUser.email,
    });

    if (addResult.error) {
      console.error("Error adding to team:", addResult.error);
      toast.error("Failed to assign user to team");
    } else {
      toast.success("User assigned to team successfully");
      setIsTeamDialogOpen(false);
      setManagingTeamUser(null);
      setSelectedTeam("");
      fetchUsers();
    }

    setIsManagingTeam(false);
  };

  const handleRemoveFromTeam = async () => {
    if (!managingTeamUser || !managingTeamUser.team) {
      toast.error("User is not in any team");
      return;
    }

    setIsManagingTeam(true);

    const result = await removeTeamMember(
      managingTeamUser.team.name,
      managingTeamUser.email,
    );

    if (result.error) {
      console.error("Error removing from team:", result.error);
      toast.error("Failed to remove user from team");
    } else {
      toast.success("User removed from team successfully");
      setIsTeamDialogOpen(false);
      setManagingTeamUser(null);
      setSelectedTeam("");
      fetchUsers();
    }

    setIsManagingTeam(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "user":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Users ({users.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manage Team for {managingTeamUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Team</Label>
              <p className="text-sm text-muted-foreground">
                {managingTeamUser?.team
                  ? managingTeamUser.team.name
                  : "No team assigned"}
              </p>
            </div>
            <div>
              <Label htmlFor="teamSelect">Assign to Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAssignToTeam}
                disabled={isManagingTeam || !selectedTeam}
                className="flex-1"
              >
                {isManagingTeam && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Assign to Team
              </Button>
              {managingTeamUser?.team && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveFromTeam}
                  disabled={isManagingTeam}
                  className="flex-1"
                >
                  {isManagingTeam && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Remove from Team
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.team ? (
                    <Badge variant="outline">{user.team.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No team
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageTeam(user)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={deletingEmail === user.email}
                    >
                      {deletingEmail === user.email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
