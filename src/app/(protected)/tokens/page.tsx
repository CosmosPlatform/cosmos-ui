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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Key, AlertCircle, Plus, Copy, Loader2, Shield } from "lucide-react";
import { getOwnUser } from "@/lib/api/users/users";
import {
  getTokens,
  createToken,
  type Token,
  type CreateTokenRequest,
} from "@/lib/api/token/token";
import { toast } from "sonner";

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createTokenError, setCreateTokenError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
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

        // If user has a team, fetch tokens for that team
        if (userResult.data.user.team) {
          const tokensResult = await getTokens(userResult.data.user.team.name);
          if (tokensResult.error) {
            setError("Failed to fetch tokens");
          } else {
            console.log("Loaded tokens:", tokensResult.data.tokens);
            setTokens(tokensResult.data.tokens || []);
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
    if (user?.team) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateToken = async () => {
    setCreateTokenError("");

    if (!validateForm() || !user?.team) {
      return;
    }

    setIsCreating(true);

    const requestData: CreateTokenRequest = {
      name: formData.name.trim(),
      value: formData.value.trim(),
    };

    const result = await createToken(user.team.name, requestData);

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

  if (!user?.team) {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Tokens</h1>
            <p className="text-muted-foreground">
              Manage tokens for team "{user.team.name}"
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
                Create a new token for your team. Provide a name and value for
                the token.
              </DialogDescription>
            </DialogHeader>

            {createTokenError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createTokenError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
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

      {tokens.length === 0 ? (
        <Card>
          <CardContent className="p-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No tokens found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your team doesn't have any repository tokens yet. Create your
                first token to enable access to private repositories.
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
      ) : (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        copyTokenName(tokenName);
                      }}
                      title="Copy token name"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
                <li>
                  • Each token belongs to team:{" "}
                  <strong>{user.team.name}</strong>
                </li>
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
