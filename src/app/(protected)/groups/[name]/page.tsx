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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Server,
  Network,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  getGroup,
  deleteGroup,
  updateGroup,
  type Group,
} from "@/lib/api/groups/groups";
import {
  GetGroupApplicationsInteractions,
  type GetApplicationsInteractionsResponse,
} from "@/lib/api/monitoring/monitoring";
import {
  getApplicationsWithFilter,
  type Application,
} from "@/lib/api/applications/applications";
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
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [applications, setApplications] = useState<Array<Application>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateGroupError, setUpdateGroupError] = useState<string>("");

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    selectedApplications: [] as string[],
  });

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

      const groupData = groupResult.data?.group || null;
      setGroup(groupData);

      // Populate edit form with current group data
      if (groupData) {
        setEditFormData({
          name: groupData.name,
          description: groupData.description,
          selectedApplications: groupData.members.map((app) => app.name),
        });
      }

      // Load all applications for the edit dialog
      const appsResult = await getApplicationsWithFilter("");
      if (appsResult.error) {
        toast.error("Failed to load applications: " + appsResult.error.error);
        setApplications([]);
      } else {
        setApplications(appsResult.data?.applications || []);
      }

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

  const handleDelete = async () => {
    if (!groupName) return;

    setDeleting(true);

    const result = await deleteGroup(decodeURIComponent(groupName));
    if (result.error) {
      toast.error("Failed to delete group: " + result.error.error);
    } else {
      toast.success("Group deleted successfully");
      router.push("/groups");
    }

    setDeleting(false);
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.name.trim()) {
      newErrors.name = "Group name is required";
    }
    if (!editFormData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (editFormData.selectedApplications.length === 0) {
      newErrors.applications = "At least one application must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    setUpdateGroupError("");

    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);

    const requestData = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      members: editFormData.selectedApplications,
    };

    const result = await updateGroup(
      decodeURIComponent(groupName),
      requestData,
    );

    if (result.error) {
      setUpdateGroupError(result.error.error || "Failed to update group");
    } else {
      toast.success("Group updated successfully!");

      // Reload group data
      const groupResult = await getGroup(decodeURIComponent(groupName));
      if (!groupResult.error && groupResult.data?.group) {
        setGroup(groupResult.data.group);
      }

      setIsEditDialogOpen(false);
      setErrors({});
    }

    setIsUpdating(false);
  };

  const handleEditInputChange = (
    field: keyof typeof editFormData,
    value: any,
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (updateGroupError) {
      setUpdateGroupError("");
    }
  };

  const toggleApplicationSelection = (applicationName: string) => {
    setEditFormData((prev) => {
      const isSelected = prev.selectedApplications.includes(applicationName);
      const newSelected = isSelected
        ? prev.selectedApplications.filter((name) => name !== applicationName)
        : [...prev.selectedApplications, applicationName];

      return {
        ...prev,
        selectedApplications: newSelected,
      };
    });

    if (errors.applications) {
      setErrors((prev) => ({ ...prev, applications: "" }));
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setErrors({});
      setUpdateGroupError("");
      // Reset form to current group data
      if (group) {
        setEditFormData({
          name: group.name,
          description: group.description,
          selectedApplications: group.members.map((app) => app.name),
        });
      }
    }
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
        <div className="flex items-center gap-2">
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Group</DialogTitle>
                <DialogDescription>
                  Update the group information and manage its applications.
                </DialogDescription>
              </DialogHeader>

              {updateGroupError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{updateGroupError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      handleEditInputChange("name", e.target.value)
                    }
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
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) =>
                      handleEditInputChange("description", e.target.value)
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
                              onClick={() =>
                                toggleApplicationSelection(app.name)
                              }
                            >
                              <Checkbox
                                id={`edit-app-${app.name}`}
                                checked={editFormData.selectedApplications.includes(
                                  app.name,
                                )}
                                onCheckedChange={() =>
                                  toggleApplicationSelection(app.name)
                                }
                                className="mt-1 pointer-events-none"
                              />
                              <div className="flex-1 space-y-1">
                                <Label
                                  htmlFor={`edit-app-${app.name}`}
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
                    <p className="text-sm text-red-500">
                      {errors.applications}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {editFormData.selectedApplications.length} application(s)
                    selected
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
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  group "{group.name}" and remove it from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
