"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ArrowLeft,
  Trash2,
  Loader2,
  Edit,
  ChevronDown,
  ChevronRight,
  GitBranch,
  RefreshCw,
  Network,
} from "lucide-react";
import { toast } from "sonner";
import {
  getApplication,
  deleteApplication,
  updateApplication,
  type Application,
  type Team,
} from "@/lib/api/applications/applications";
import { getTeams } from "@/lib/api/teams/teams";
import {
  updateApplicationMonitoring,
  getApplicationInteractions,
  type GetApplicationInteractionsResponse,
} from "@/lib/api/monitoring/monitoring";
import ApplicationGraph from "@/components/graphs/applicationGraph";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationName = params.name as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGitSectionOpen, setIsGitSectionOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Monitoring state
  const [isUpdatingMonitoring, setIsUpdatingMonitoring] = useState(false);
  const [interactions, setInteractions] =
    useState<GetApplicationInteractionsResponse | null>(null);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    team: "",
    gitProvider: "",
    gitBranch: "",
    gitOwner: "",
    gitRepositoryName: "",
  });

  // Check if any git field has content
  const hasAnyGitField =
    editFormData.gitProvider ||
    editFormData.gitBranch ||
    editFormData.gitOwner ||
    editFormData.gitRepositoryName;

  // Check if all git fields are filled when any is filled
  const areAllGitFieldsFilled =
    editFormData.gitProvider &&
    editFormData.gitBranch &&
    editFormData.gitOwner &&
    editFormData.gitRepositoryName;

  useEffect(() => {
    const loadData = async () => {
      if (!applicationName) return;

      setLoading(true);

      // Load application
      const appResult = await getApplication(applicationName);
      if (appResult.error) {
        toast.error("Failed to load application: " + appResult.error.error);
        router.push("/applications");
        return;
      }

      const app = appResult.data?.application || null;
      setApplication(app);

      // Load teams
      const teamsResult = await getTeams();
      if (teamsResult.error) {
        toast.error("Failed to load teams: " + teamsResult.error.error);
        setTeams([]);
      } else {
        setTeams(teamsResult.data?.teams || []);
      }

      // Populate edit form with current application data
      if (app) {
        setEditFormData({
          name: app.name,
          description: app.description,
          team: app.team?.name || "",
          gitProvider: app.gitInformation?.provider || "",
          gitBranch: app.gitInformation?.repositoryBranch || "",
          gitOwner: app.gitInformation?.repositoryOwner || "",
          gitRepositoryName: app.gitInformation?.repositoryName || "",
        });

        // Open git section if git information exists
        if (app.gitInformation) {
          setIsGitSectionOpen(true);
        }
      }

      setLoading(false);
    };

    loadData();
    // Load interactions when component mounts
    loadInteractions();
  }, [applicationName, router]);

  const handleUpdateMonitoring = async () => {
    if (!applicationName) return;

    setIsUpdatingMonitoring(true);

    const result = await updateApplicationMonitoring(applicationName);
    if (result.error) {
      toast.error("Failed to update monitoring: " + result.error.error);
    } else {
      toast.success("Application monitoring updated successfully");
      // Automatically fetch interactions after successful monitoring update
      await loadInteractions();
    }

    setIsUpdatingMonitoring(false);
  };

  const loadInteractions = async () => {
    if (!applicationName) return;

    setLoadingInteractions(true);

    const result = await getApplicationInteractions(applicationName);
    if (result.error) {
      toast.error("Failed to load interactions: " + result.error.error);
      setInteractions(null);
    } else {
      setInteractions(result.data || null);
    }

    setLoadingInteractions(false);
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!editFormData.name.trim()) {
      newErrors.name = "Application name is required";
    }
    if (!editFormData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate git fields if any are filled
    if (hasAnyGitField) {
      if (!editFormData.gitProvider) {
        newErrors.gitProvider =
          "Git provider is required when git information is provided";
      }
      if (!editFormData.gitBranch.trim()) {
        newErrors.gitBranch =
          "Git branch is required when git information is provided";
      }
      if (!editFormData.gitOwner.trim()) {
        newErrors.gitOwner =
          "Repository owner is required when git information is provided";
      }
      if (!editFormData.gitRepositoryName.trim()) {
        newErrors.gitRepositoryName =
          "Repository name is required when git information is provided";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);

    const requestData: any = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      team: editFormData.team || "",
    };

    // Add git information if all fields are provided
    if (areAllGitFieldsFilled) {
      requestData.gitInformation = {
        provider: editFormData.gitProvider,
        repositoryOwner: editFormData.gitOwner,
        repositoryName: editFormData.gitRepositoryName,
        repositoryBranch: editFormData.gitBranch,
      };
    }

    const result = await updateApplication(applicationName, requestData);

    if (result.error) {
      toast.error("Failed to update application: " + result.error.error);
    } else {
      toast.success("Application updated successfully!");

      // Update the local application state
      if (result.data?.application) {
        setApplication(result.data.application);
      }

      setIsEditDialogOpen(false);
      setErrors({});
    }

    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!applicationName) return;

    setDeleting(true);

    const result = await deleteApplication(applicationName);
    if (result.error) {
      toast.error("Failed to delete application: " + result.error.error);
    } else {
      toast.success("Application deleted successfully");
      router.push("/applications");
    }

    setDeleting(false);
  };

  const handleEditInputChange = (
    field: keyof typeof editFormData,
    value: string,
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setErrors({});
      // Reset form to current application data
      if (application) {
        setEditFormData({
          name: application.name,
          description: application.description,
          team: application.team?.name || "",
          gitProvider: application.gitInformation?.provider || "",
          gitBranch: application.gitInformation?.repositoryBranch || "",
          gitOwner: application.gitInformation?.repositoryOwner || "",
          gitRepositoryName: application.gitInformation?.repositoryName || "",
        });
        setIsGitSectionOpen(!!application.gitInformation);
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

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Application not found</h3>
          <p className="text-muted-foreground mb-4">
            The requested application could not be found.
          </p>
          <Button onClick={() => router.push("/applications")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/applications")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl">{application.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                {application.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleUpdateMonitoring}
                disabled={isUpdatingMonitoring}
              >
                {isUpdatingMonitoring ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Update Monitoring</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="ml-2">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the application "
                      {application.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {application.team && (
                <div>
                  <h3 className="font-semibold mb-2">Team Information</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{application.team.name}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Description:</span>
                        <span className="flex-1">
                          {application.team.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!application.team && (
                <div>
                  <h3 className="font-semibold mb-2">Team Information</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <span className="text-muted-foreground">
                      No team assigned
                    </span>
                  </div>
                </div>
              )}

              {application.gitInformation && (
                <div>
                  <h3 className="font-semibold mb-2">Git Information</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Provider:</span>
                        <span className="ml-2 capitalize">
                          {application.gitInformation.provider}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Branch:</span>
                        <span className="ml-2">
                          {application.gitInformation.repositoryBranch}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <span className="ml-2">
                          {application.gitInformation.repositoryOwner}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Repository:</span>
                        <span className="ml-2">
                          {application.gitInformation.repositoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Interactions Card */}
        <Card className="h-full w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Application Interactions</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadInteractions}
              disabled={loadingInteractions}
            >
              {loadingInteractions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent className="h-full w-full">
            {loadingInteractions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading interactions...</span>
              </div>
            ) : interactions ? (
              <div className="space-y-6 h-full w-full">
                {/* Graph Visualization */}
                {interactions.dependencies.length > 0 && (
                  <div className="h-full w-full">
                    <h4 className="font-semibold mb-4">Interaction Graph</h4>
                    <ApplicationGraph applicationData={interactions} />
                  </div>
                )}

                <div>
                  {/* No interactions message */}
                  {interactions.dependencies.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No application interactions found.</p>
                      <p className="text-sm">
                        Try updating the monitoring to discover interactions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No interaction data available.</p>
                <p className="text-sm">
                  Click "Update Monitoring" to analyze application interactions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Update the application information. Fill in all the required
              fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => handleEditInputChange("name", e.target.value)}
                placeholder="Enter application name"
                className={
                  errors.name
                    ? "border-destructive focus:border-destructive"
                    : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
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
                placeholder="Enter application description"
                rows={3}
                className={
                  errors.description
                    ? "border-destructive focus:border-destructive"
                    : ""
                }
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team">Team</Label>
              <Select
                value={editFormData.team}
                onValueChange={(value) => handleEditInputChange("team", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team (optional)" />
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

            {/* Git Information Collapsible Section */}
            <Collapsible
              open={isGitSectionOpen}
              onOpenChange={setIsGitSectionOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <Label className="cursor-pointer">
                      Git Information (Optional)
                    </Label>
                  </div>
                  {isGitSectionOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-gitProvider">Git Provider</Label>
                  <Select
                    value={editFormData.gitProvider}
                    onValueChange={(value) =>
                      handleEditInputChange("gitProvider", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.gitProvider
                          ? "border-destructive focus:border-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select git provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gitProvider && (
                    <p className="text-sm text-destructive">
                      {errors.gitProvider}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gitOwner">Repository Owner</Label>
                  <Input
                    id="edit-gitOwner"
                    value={editFormData.gitOwner}
                    onChange={(e) =>
                      handleEditInputChange("gitOwner", e.target.value)
                    }
                    placeholder="e.g., RafaB15"
                    className={
                      errors.gitOwner
                        ? "border-destructive focus:border-destructive"
                        : ""
                    }
                  />
                  {errors.gitOwner && (
                    <p className="text-sm text-destructive">
                      {errors.gitOwner}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gitRepositoryName">
                    Repository Name
                  </Label>
                  <Input
                    id="edit-gitRepositoryName"
                    value={editFormData.gitRepositoryName}
                    onChange={(e) =>
                      handleEditInputChange("gitRepositoryName", e.target.value)
                    }
                    placeholder="e.g., Distribuidos-TP"
                    className={
                      errors.gitRepositoryName
                        ? "border-destructive focus:border-destructive"
                        : ""
                    }
                  />
                  {errors.gitRepositoryName && (
                    <p className="text-sm text-destructive">
                      {errors.gitRepositoryName}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gitBranch">Git Branch</Label>
                  <Input
                    id="edit-gitBranch"
                    value={editFormData.gitBranch}
                    onChange={(e) =>
                      handleEditInputChange("gitBranch", e.target.value)
                    }
                    placeholder="e.g., main, develop"
                    className={
                      errors.gitBranch
                        ? "border-destructive focus:border-destructive"
                        : ""
                    }
                  />
                  {errors.gitBranch && (
                    <p className="text-sm text-destructive">
                      {errors.gitBranch}
                    </p>
                  )}
                </div>

                {hasAnyGitField && !areAllGitFieldsFilled && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                    <strong>Note:</strong> All git fields must be filled if you
                    provide any git information.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleEditDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
