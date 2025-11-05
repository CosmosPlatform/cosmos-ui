"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus, Loader2, AlertCircle, Server } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getGroups,
  createGroup,
  type GroupReduced,
  type CreateGroupRequest,
} from "@/lib/api/groups/groups";
import {
  getApplicationsWithFilter,
  type Application,
} from "@/lib/api/applications/applications";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const [groups, setGroups] = useState<Array<GroupReduced>>([]);
  const [applications, setApplications] = useState<Array<Application>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createGroupError, setCreateGroupError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedApplications: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load groups
      const groupsResult = await getGroups();
      if (groupsResult.error) {
        toast.error("Failed to load groups: " + groupsResult.error.error);
        setGroups([]);
      } else {
        setGroups(groupsResult.data?.groups || []);
      }

      // Load applications
      const appsResult = await getApplicationsWithFilter("");
      if (appsResult.error) {
        toast.error("Failed to load applications: " + appsResult.error.error);
        setApplications([]);
      } else {
        setApplications(appsResult.data?.applications || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.selectedApplications.length === 0) {
      newErrors.applications = "At least one application must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    setCreateGroupError("");

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    const requestData: CreateGroupRequest = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      members: formData.selectedApplications,
    };

    const result = await createGroup(requestData);

    if (result.error) {
      setCreateGroupError(result.error.error || "Failed to create group");
    } else {
      toast.success("Group created successfully!");

      // Add the new group to the list
      setGroups((prev) => [
        ...prev,
        {
          name: requestData.name,
          description: requestData.description,
        },
      ]);

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    }

    setIsCreating(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleApplicationSelection = (applicationName: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedApplications.includes(applicationName);
      const newSelected = isSelected
        ? prev.selectedApplications.filter((name) => name !== applicationName)
        : [...prev.selectedApplications, applicationName];

      return {
        ...prev,
        selectedApplications: newSelected,
      };
    });

    // Clear error when user selects an application
    if (errors.applications) {
      setErrors((prev) => ({ ...prev, applications: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      selectedApplications: [],
    });
    setErrors({});
    setCreateGroupError("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage your application groups and create new ones
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Add a new group to organize your applications. Fill in all the
                required information.
              </DialogDescription>
            </DialogHeader>

            {createGroupError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createGroupError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter group name"
                  className={
                    errors.name ? "border-red-500 focus:border-red-500" : ""
                  }
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter group description"
                  rows={3}
                  className={
                    errors.description
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Applications</Label>
                <div
                  className={`border rounded-md ${
                    errors.applications ? "border-red-500" : ""
                  }`}
                >
                  <ScrollArea className="h-[300px] p-4">
                    {applications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No applications available
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {applications.map((app) => (
                          <div
                            key={app.name}
                            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleApplicationSelection(app.name)}
                          >
                            <Checkbox
                              id={`app-${app.name}`}
                              checked={formData.selectedApplications.includes(
                                app.name,
                              )}
                              onCheckedChange={() =>
                                toggleApplicationSelection(app.name)
                              }
                              className="mt-1 pointer-events-none"
                            />
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor={`app-${app.name}`}
                                className="font-medium cursor-pointer pointer-events-none"
                              >
                                {app.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {app.description || "No description provided"}
                              </p>
                              {app.team && (
                                <Badge variant="outline" className="text-xs">
                                  {app.team.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
                {errors.applications && (
                  <p className="text-sm text-red-500">{errors.applications}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.selectedApplications.length} application(s) selected
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleDialogOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateGroup}
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!groups || groups.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first group
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group.name}
              className="group relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative space-y-4">
                <CardTitle className="flex items-start justify-between gap-3 text-xl font-semibold tracking-tight text-foreground">
                  <span className="transition-colors duration-300 group-hover:text-primary">
                    {group.name}
                  </span>
                  <Server className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm text-muted-foreground/90">
                  {group.description || "No description provided"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
