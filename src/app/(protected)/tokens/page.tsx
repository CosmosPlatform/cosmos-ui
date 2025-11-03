"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Key,
  AlertCircle,
  Plus,
  Copy,
  Loader2,
  Shield,
  Trash2,
  Edit,
} from "lucide-react";
import { getOwnUser } from "@/lib/api/users/users";
import {
  getTokens,
  getAllTokens,
  createToken,
  deleteToken,
  updateToken,
  type Token,
  type CreateTokenRequest,
  type UpdateTokenRequest,
} from "@/lib/api/token/token";
import { getTeams } from "@/lib/api/teams/teams";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserData = {
  username: string;
  email: string;
  role: string;
  team?: {
    name: string;
    description: string;
  };
};

export default function TokensPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<
    Array<{ name: string; description: string }>
  >([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createTokenError, setCreateTokenError] = useState<string>("");
  const [deletingTokens, setDeletingTokens] = useState<Set<string>>(new Set());

  // Edit token state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [updateTokenError, setUpdateTokenError] = useState<string>("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    team: "", // For admin use
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    value: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the user to get their team
        const userResult = await getOwnUser();
        if (userResult.error) {
          setError("Failed to fetch user information");
          setLoading(false);
          return;
        }

        setUser(userResult.data.user);
        const userIsAdmin = userResult.data.user.role === "admin";
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          // Admin: fetch all tokens and all teams
          const [tokensResult, teamsResult] = await Promise.all([
            getAllTokens(),
            getTeams(),
          ]);

          if (tokensResult.error) {
            setError("Failed to fetch tokens");
          } else {
            console.log("Loaded all tokens:", tokensResult.data.tokens);
            setTokens(tokensResult.data.tokens || []);
          }

          if (teamsResult.error) {
            setError("Failed to fetch teams");
          } else {
            setAvailableTeams(teamsResult.data.teams || []);
          }
        } else {
          // Regular user: fetch tokens for their team
          if (userResult.data.user.team) {
            const tokensResult = await getTokens(
              userResult.data.user.team.name,
            );
            if (tokensResult.error) {
              setError("Failed to fetch tokens");
            } else {
              console.log("Loaded tokens:", tokensResult.data.tokens);
              setTokens(tokensResult.data.tokens || []);
            }
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("TokensPage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshTokens = async () => {
    if (isAdmin) {
      const tokensResult = await getAllTokens();
      if (!tokensResult.error) {
        setTokens(tokensResult.data.tokens || []);
      }
    } else if (user?.team) {
      const tokensResult = await getTokens(user.team.name);
      if (!tokensResult.error) {
        setTokens(tokensResult.data.tokens || []);
      }
    }
  };

  const copyTokenName = async (tokenName: string) => {
    try {
      if (!tokenName) {
        toast.error("Token name is empty");
        return;
      }
      await navigator.clipboard.writeText(tokenName);
      toast.success(`Token name "${tokenName}" copied to clipboard`);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy token name");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Token name is required";
    }
    if (!formData.value.trim()) {
      newErrors.value = "Token value is required";
    }
    // For admin, team selection is required
    if (isAdmin && !formData.team.trim()) {
      newErrors.team = "Team selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateToken = async () => {
    setCreateTokenError("");

    if (!validateForm()) {
      return;
    }

    // For admin, use selected team; for regular user, use their team
    const targetTeam = isAdmin ? formData.team : user?.team?.name;

    if (!targetTeam) {
      setCreateTokenError("No team available for token creation");
      return;
    }

    setIsCreating(true);

    const requestData: CreateTokenRequest = {
      name: formData.name.trim(),
      value: formData.value.trim(),
    };

    const result = await createToken(targetTeam, requestData);

    if (result.error) {
      setCreateTokenError(result.error.error || "Failed to create token");
    } else {
      toast.success("Token created successfully!");

      // Refresh the tokens list to get the latest data
      await refreshTokens();

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    }

    setIsCreating(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      team: "",
    });
    setErrors({});
    setCreateTokenError("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleDeleteToken = async (tokenName: string) => {
    // Find the team for this token
    let teamName: string | undefined;

    if (isAdmin) {
      // For admin, find the token's team from the tokens list
      const token = tokens.find((t) => t.name === tokenName);
      teamName = token?.team;
    } else {
      // For regular user, use their team
      teamName = user?.team?.name;
    }

    if (!teamName) return;

    setDeletingTokens((prev) => new Set([...prev, tokenName]));

    try {
      const result = await deleteToken(teamName, tokenName);

      if (result.error) {
        toast.error(`Failed to delete token: ${result.error.error}`);
      } else {
        toast.success(`Token "${tokenName}" deleted successfully`);
        // Refresh the tokens list
        await refreshTokens();
      }
    } catch (error) {
      console.error("Delete token error:", error);
      toast.error("An unexpected error occurred while deleting the token");
    } finally {
      setDeletingTokens((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tokenName);
        return newSet;
      });
    }
  };

  const handleEditToken = (tokenName: string) => {
    setEditingToken(tokenName);
    setEditFormData({
      name: tokenName,
      value: "",
    });
    setIsEditDialogOpen(true);
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    // At least one field should be provided for update
    if (!editFormData.name.trim() && !editFormData.value.trim()) {
      newErrors.general = "At least one field (name or value) must be provided";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateToken = async () => {
    setUpdateTokenError("");

    if (!validateEditForm() || !user?.team || !editingToken) {
      return;
    }

    setIsUpdating(true);

    // Only include non-empty fields in the request
    const requestData: UpdateTokenRequest = {};
    if (editFormData.name.trim()) {
      requestData.name = editFormData.name.trim();
    }
    if (editFormData.value.trim()) {
      requestData.value = editFormData.value.trim();
    }

    const result = await updateToken(user.team.name, editingToken, requestData);

    if (result.error) {
      setUpdateTokenError(result.error.error || "Failed to update token");
    } else {
      toast.success("Token updated successfully!");

      // Refresh the tokens list to get the latest data
      await refreshTokens();

      // Reset form and close dialog
      resetEditForm();
      setIsEditDialogOpen(false);
    }

    setIsUpdating(false);
  };

  const handleEditInputChange = (
    field: keyof typeof editFormData,
    value: string,
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general error when user makes changes
    if (updateTokenError) {
      setUpdateTokenError("");
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      name: "",
      value: "",
    });
    setEditErrors({});
    setUpdateTokenError("");
    setEditingToken(null);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      resetEditForm();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-8 w-40" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
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

  if (!user?.team && !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be assigned to a team to view tokens
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Group tokens by team for admin view
  const tokensByTeam = isAdmin
    ? tokens.reduce(
        (acc, token) => {
          if (!acc[token.team]) {
            acc[token.team] = [];
          }
          acc[token.team].push(token);
          return acc;
        },
        {} as Record<string, Token[]>,
      )
    : {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Tokens</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage tokens for all teams"
                : `Manage tokens for team "${user?.team?.name}"`}
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Token</DialogTitle>
              <DialogDescription>
                {isAdmin
                  ? "Create a new token for a team. Select a team and provide a name and value for the token."
                  : "Create a new token for your team. Provide a name and value for the token."}
              </DialogDescription>
            </DialogHeader>

            {createTokenError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createTokenError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              {isAdmin && (
                <div className="grid gap-2">
                  <Label htmlFor="team">Team</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value) => handleInputChange("team", value)}
                  >
                    <SelectTrigger
                      className={
                        errors.team ? "border-red-500 focus:border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.name} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.team && (
                    <p className="text-sm text-red-500">{errors.team}</p>
                  )}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter token name"
                  className={
                    errors.name ? "border-red-500 focus:border-red-500" : ""
                  }
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Token Value</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  placeholder="Enter token value"
                  rows={3}
                  className={
                    errors.value ? "border-red-500 focus:border-red-500" : ""
                  }
                />
                {errors.value && (
                  <p className="text-sm text-red-500">{errors.value}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateToken}
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Token Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Token</DialogTitle>
            <DialogDescription>
              Edit the token details. Only add a new value if you want to update
              it. You can overwrite the name if needed. Only non-empty fields
              will be updated.
            </DialogDescription>
          </DialogHeader>

          {updateTokenError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateTokenError}</AlertDescription>
            </Alert>
          )}

          {editErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{editErrors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Token Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => handleEditInputChange("name", e.target.value)}
                placeholder="Enter token name"
                className={
                  editErrors.name ? "border-red-500 focus:border-red-500" : ""
                }
              />
              {editErrors.name && (
                <p className="text-sm text-red-500">{editErrors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Token Value (Optional)</Label>
              <Textarea
                id="edit-value"
                value={editFormData.value}
                onChange={(e) => handleEditInputChange("value", e.target.value)}
                placeholder="Enter new token value (leave empty to keep current value)"
                rows={3}
                className={
                  editErrors.value ? "border-red-500 focus:border-red-500" : ""
                }
              />
              {editErrors.value && (
                <p className="text-sm text-red-500">{editErrors.value}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Only provide a value if you want to update it. Leave empty to
                keep the current value.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleEditDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateToken}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tokens.length === 0 ? (
        <Card>
          <CardContent className="p-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No tokens found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {isAdmin
                  ? "No tokens have been created yet. Create your first token to enable access to private repositories."
                  : "Your team doesn't have any repository tokens yet. Create your first token to enable access to private repositories."}
              </p>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Token
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : isAdmin ? (
        // Admin view: Group tokens by team
        <div className="space-y-8">
          {Object.entries(tokensByTeam).map(([teamName, teamTokens]) => (
            <div key={teamName} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{teamName}</h2>
                <Badge variant="outline">
                  {teamTokens.length} token{teamTokens.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamTokens.map((token) => {
                  const tokenName = token.name;
                  const tokenTeam = token.team;

                  return (
                    <Card
                      key={`${teamName}-${tokenName}`}
                      className="hover:shadow-md transition-shadow group"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-2xl font-semibold truncate group-hover:text-primary transition-colors">
                                  {tokenName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tokenTeam}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Repository token
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                copyTokenName(tokenName);
                              }}
                              title="Copy token name"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                handleEditToken(tokenName);
                              }}
                              title="Edit token"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete token"
                                  disabled={deletingTokens.has(tokenName)}
                                >
                                  {deletingTokens.has(tokenName) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Token
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the token "
                                    {tokenName}"? This action cannot be undone
                                    and may affect applications that use this
                                    token.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteToken(tokenName)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete Token
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Regular user view: Show tokens in grid
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => {
            const tokenName = token.name;
            const tokenTeam = token.team;

            return (
              <Card
                key={tokenName}
                className="hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-2xl font-semibold truncate group-hover:text-primary transition-colors">
                            {tokenName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {tokenTeam}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Repository token
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          copyTokenName(tokenName);
                        }}
                        title="Copy token name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          handleEditToken(tokenName);
                        }}
                        title="Edit token"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete token"
                            disabled={deletingTokens.has(tokenName)}
                          >
                            {deletingTokens.has(tokenName) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Token</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the token "
                              {tokenName}"? This action cannot be undone and may
                              affect applications that use this token.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteToken(tokenName)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete Token
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Repository Tokens</CardTitle>
          <CardDescription>
            Tokens are used to access information from your team's application
            repositories when they are private.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="font-medium text-foreground mb-1">Requirements</p>
              <ul className="space-y-1">
                <li>
                  • Tokens should have <strong>read permissions</strong>
                </li>
                {!isAdmin && user?.team && (
                  <li>
                    • Each token belongs to team:{" "}
                    <strong>{user.team.name}</strong>
                  </li>
                )}
                {isAdmin && <li>• Tokens belong to their respective teams</li>}
                <li>• Used for accessing private repositories</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Best Practices</p>
              <ul className="space-y-1">
                <li>• Use descriptive names for easy identification</li>
                <li>• Keep tokens secure and don't share publicly</li>
                <li>• Create separate tokens for different purposes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
