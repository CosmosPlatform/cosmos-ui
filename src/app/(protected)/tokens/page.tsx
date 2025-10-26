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
import {
  Key,
  AlertCircle,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
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
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
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

  const toggleTokenVisibility = (tokenName: string) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenName)) {
      newVisible.delete(tokenName);
    } else {
      newVisible.add(tokenName);
    }
    setVisibleTokens(newVisible);
  };

  const copyTokenName = async (tokenName: string) => {
    try {
      await navigator.clipboard.writeText(tokenName);
      toast.success("Token name copied to clipboard");
    } catch {
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
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
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
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tokens found</h3>
              <p className="mb-4">
                Your team doesn't have any tokens yet. Create your first token
                to get started.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Token
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tokens.map((token) => (
            <Card
              key={token.Name}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{token.Name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {token.Team}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Token value:</span>
                      {visibleTokens.has(token.Name) ? (
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {token.Name}_secret_value_placeholder
                        </code>
                      ) : (
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          ••••••••••••••••
                        </code>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleTokenVisibility(token.Name)}
                      title={
                        visibleTokens.has(token.Name)
                          ? "Hide token"
                          : "Show token"
                      }
                    >
                      {visibleTokens.has(token.Name) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyTokenName(token.Name)}
                      title="Copy token name"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Information</CardTitle>
          <CardDescription>
            Tokens are used to authenticate API requests for your team's
            applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Each token is associated with your team:{" "}
            <strong>{user.team.name}</strong>
          </p>
          <p>• Keep your tokens secure and don't share them publicly</p>
          <p>• You can create multiple tokens for different purposes</p>
          <p>• Contact your administrator if you need help managing tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}
