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
import { Checkbox } from "@/components/ui/checkbox";
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
  Monitor,
  FileCode,
  Users,
  Building2,
  Key,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getApplication,
  deleteApplication,
  updateApplication,
  type Application,
  type Team,
} from "@/lib/api/applications/applications";
import { getTokens, type Token } from "@/lib/api/token/token";
import { getTeams } from "@/lib/api/teams/teams";
import {
  updateApplicationMonitoring,
  getApplicationInteractions,
  type GetApplicationInteractionsResponse,
  getCompleteApplicationMonitoring,
  type GetCompleteApplicationMonitoringResponse,
} from "@/lib/api/monitoring/monitoring";
import ApplicationGraph from "@/components/graphs/applicationGraph";
import Swagger from "@/components/swagger/swagger";
import ApplicationConsumers from "@/components/graphs/applicationConsumers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Default paths for monitoring
const DEFAULT_OPENAPI_PATH = "docs/swagger.json";
const DEFAULT_OPEN_CLIENT_PATH = "docs/openclient.json";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationName = params.name as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGitSectionOpen, setIsGitSectionOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateApplicationError, setUpdateApplicationError] =
    useState<string>("");

  // Monitoring state
  const [isUpdatingMonitoring, setIsUpdatingMonitoring] = useState(false);
  const [interactions, setInteractions] =
    useState<GetApplicationInteractionsResponse | null>(null);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [completeMonitoring, setCompleteMonitoring] =
    useState<GetCompleteApplicationMonitoringResponse | null>(null);
  const [loadingCompleteMonitoring, setLoadingCompleteMonitoring] =
    useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    team: "",
    tokenName: "",
    gitProvider: "",
    gitBranch: "",
    gitOwner: "",
    gitRepositoryName: "",
    hasOpenAPI: false,
    openAPIPath: DEFAULT_OPENAPI_PATH,
    hasOpenClient: false,
    openClientPath: DEFAULT_OPEN_CLIENT_PATH,
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
        const formData = {
          name: app.name,
          description: app.description,
          team: app.team?.name || "",
          tokenName: app.token?.name || "",
          gitProvider: app.gitInformation?.provider || "",
          gitBranch: app.gitInformation?.repositoryBranch || "",
          gitOwner: app.gitInformation?.repositoryOwner || "",
          gitRepositoryName: app.gitInformation?.repositoryName || "",
          hasOpenAPI: app.monitoringInformation?.hasOpenAPI || false,
          openAPIPath:
            app.monitoringInformation?.openAPIPath || DEFAULT_OPENAPI_PATH,
          hasOpenClient: app.monitoringInformation?.hasOpenClient || false,
          openClientPath:
            app.monitoringInformation?.openClientPath ||
            DEFAULT_OPEN_CLIENT_PATH,
        };

        setEditFormData(formData);

        // Open git section if git or monitoring information exists
        if (
          app.gitInformation ||
          (app.monitoringInformation &&
            (app.monitoringInformation.hasOpenAPI ||
              app.monitoringInformation.hasOpenClient))
        ) {
          setIsGitSectionOpen(true);
        }

        // Load tokens for current team if available
        if (app.team?.name) {
          loadTokensForTeam(app.team.name);
        }
      }

      setLoading(false);
    };

    loadData();
    // Load interactions when component mounts
    loadInteractions();
    loadCompleteMonitoring();
  }, [applicationName, router]);

  const loadCompleteMonitoring = async () => {
    if (!applicationName) return;

    setLoadingCompleteMonitoring(true);

    const result = await getCompleteApplicationMonitoring(applicationName);
    if (result.error) {
      toast.error("Failed to load monitoring data: " + result.error.error);
      setCompleteMonitoring(null);
    } else {
      setCompleteMonitoring(result.data || null);
    }

    setLoadingCompleteMonitoring(false);
  };

  const handleUpdateMonitoring = async () => {
    if (!applicationName) return;

    setIsUpdatingMonitoring(true);

    const result = await updateApplicationMonitoring(applicationName);
    if (result.error) {
      toast.error("Failed to update monitoring: " + result.error.error);
    } else {
      toast.success("Application monitoring updated successfully");
      // Automatically fetch interactions and complete monitoring after successful update
      await loadInteractions();
      await loadCompleteMonitoring();
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

    // Validate monitoring fields
    if (editFormData.hasOpenAPI && !editFormData.openAPIPath.trim()) {
      newErrors.openAPIPath =
        "OpenAPI path is required when OpenAPI is enabled";
    }
    if (editFormData.hasOpenClient && !editFormData.openClientPath.trim()) {
      newErrors.openClientPath =
        "Open Client path is required when Open Client is enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    setUpdateApplicationError("");

    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);

    const requestData: any = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      team: editFormData.team || "",
      tokenName: editFormData.tokenName || "",
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

    // Always add monitoring information to allow disabling it
    requestData.monitoringInformation = {
      hasOpenAPI: editFormData.hasOpenAPI,
      openAPIPath: editFormData.hasOpenAPI
        ? editFormData.openAPIPath
        : undefined,
      hasOpenClient: editFormData.hasOpenClient,
      openClientPath: editFormData.hasOpenClient
        ? editFormData.openClientPath
        : undefined,
    };

    const result = await updateApplication(applicationName, requestData);

    if (result.error) {
      setUpdateApplicationError(
        result.error.error || "Failed to update application",
      );
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

  const loadTokensForTeam = async (teamName: string) => {
    try {
      const tokensResult = await getTokens(teamName);
      if (!tokensResult.error) {
        setTokens(tokensResult.data.tokens || []);
      } else {
        setTokens([]);
      }
    } catch (error) {
      console.error("Failed to load tokens:", error);
      setTokens([]);
    }
  };

  const handleEditInputChange = (
    field: keyof typeof editFormData,
    value: string | boolean,
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general update error when user makes changes
    if (updateApplicationError) {
      setUpdateApplicationError("");
    }

    // If team is changed, load tokens for that team
    if (field === "team" && typeof value === "string" && value) {
      loadTokensForTeam(value);
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setErrors({});
      setUpdateApplicationError("");
      // Reset form to current application data
      if (application) {
        setEditFormData({
          name: application.name,
          description: application.description,
          team: application.team?.name || "",
          tokenName: application.token?.name || "",
          gitProvider: application.gitInformation?.provider || "",
          gitBranch: application.gitInformation?.repositoryBranch || "",
          gitOwner: application.gitInformation?.repositoryOwner || "",
          gitRepositoryName: application.gitInformation?.repositoryName || "",
          hasOpenAPI: application.monitoringInformation?.hasOpenAPI || false,
          openAPIPath:
            application.monitoringInformation?.openAPIPath ||
            DEFAULT_OPENAPI_PATH,
          hasOpenClient:
            application.monitoringInformation?.hasOpenClient || false,
          openClientPath:
            application.monitoringInformation?.openClientPath ||
            DEFAULT_OPEN_CLIENT_PATH,
        });
        setIsGitSectionOpen(
          !!application.gitInformation ||
            !!(
              application.monitoringInformation &&
              (application.monitoringInformation.hasOpenAPI ||
                application.monitoringInformation.hasOpenClient)
            ),
        );
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
            <div className="flex flex-wrap gap-4 items-stretch">
              {/* Team Information Card */}
              <div className="flex-1 min-w-[300px] flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Team Information</h3>
                </div>
                <div className="bg-gradient-to-br from-muted/50 to-muted p-4 rounded-lg flex-1 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  {application.team ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Name:
                        </span>
                        <span className="font-semibold">
                          {application.team.name}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Description:
                        </span>
                        <span className="flex-1 text-sm">
                          {application.team.description}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground text-sm italic">
                        No team assigned
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Git Information Card */}
              {application.gitInformation && (
                <div className="flex-1 min-w-[300px] flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Git Information</h3>
                  </div>
                  <div className="bg-gradient-to-br from-muted/50 to-muted p-4 rounded-lg flex-1 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Provider:
                        </span>
                        <span className="font-semibold capitalize">
                          {application.gitInformation.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Owner:
                        </span>
                        <span className="font-semibold">
                          {application.gitInformation.repositoryOwner}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Repository:
                        </span>
                        <span className="font-semibold">
                          {application.gitInformation.repositoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Branch:
                        </span>
                        <span className="font-mono text-sm bg-background/50 px-2 py-0.5 rounded">
                          {application.gitInformation.repositoryBranch}
                        </span>
                      </div>
                      {application.token && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground text-sm">
                            Token:
                          </span>
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">
                              {application.token.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Information Card */}
              <div className="flex-1 min-w-[300px] flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Monitoring Information
                  </h3>
                </div>
                <div className="bg-gradient-to-br from-muted/50 to-muted p-4 rounded-lg flex-1 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-3">
                    {/* OpenAPI Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          OpenAPI:
                        </span>
                        {application.monitoringInformation?.hasOpenAPI ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold text-sm">
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full"></span>
                            Disabled
                          </span>
                        )}
                      </div>
                      {application.monitoringInformation?.hasOpenAPI &&
                        application.monitoringInformation.openAPIPath && (
                          <div className="text-xs text-muted-foreground ml-2 font-mono bg-background/50 px-2 py-1 rounded inline-block">
                            {application.monitoringInformation.openAPIPath}
                          </div>
                        )}
                    </div>

                    {/* Open Client Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Open Client:
                        </span>
                        {application.monitoringInformation?.hasOpenClient ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold text-sm">
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full"></span>
                            Disabled
                          </span>
                        )}
                      </div>
                      {application.monitoringInformation?.hasOpenClient &&
                        application.monitoringInformation.openClientPath && (
                          <div className="text-xs text-muted-foreground ml-2 font-mono bg-background/50 px-2 py-1 rounded inline-block">
                            {application.monitoringInformation.openClientPath}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
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
                    <ApplicationGraph
                      applicationData={interactions}
                      mainApplication={application.name}
                    />
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

        {/* API Documentation & Consumers Card */}
        <Card className="h-full w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <CardTitle>API Documentation & Consumers</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCompleteMonitoring}
              disabled={loadingCompleteMonitoring}
            >
              {loadingCompleteMonitoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent className="h-full w-full">
            {loadingCompleteMonitoring ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading monitoring data...</span>
              </div>
            ) : completeMonitoring ? (
              <Tabs defaultValue="api" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="api" className="flex-1">
                    <FileCode className="h-4 w-4" />
                    API Documentation
                  </TabsTrigger>
                  <TabsTrigger value="consumers" className="flex-1">
                    <Users className="h-4 w-4" />
                    Consumers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="mt-4">
                  {completeMonitoring.openAPISpec ? (
                    <Swagger
                      spec={JSON.parse(completeMonitoring.openAPISpec)}
                    />
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No OpenAPI specification available for this application.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="consumers" className="mt-4">
                  <ApplicationConsumers
                    consumedEndpoints={completeMonitoring.consumedEndpoints}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No monitoring data available.</p>
                <p className="text-sm">
                  Click "Update Monitoring" to analyze application API and
                  consumers.
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

          {updateApplicationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateApplicationError}</AlertDescription>
            </Alert>
          )}

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

            {/* Git & Monitoring Information Collapsible Section */}
            <Collapsible
              open={isGitSectionOpen}
              onOpenChange={setIsGitSectionOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto min-h-12"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <Label className="cursor-pointer">
                      Git & Monitoring Information (Optional)
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
                {/* Token Selection */}
                {editFormData.team && tokens.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tokenName">Token (Optional)</Label>
                    <Select
                      value={editFormData.tokenName}
                      onValueChange={(value) =>
                        handleEditInputChange(
                          "tokenName",
                          value === "none" ? "" : value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No token</SelectItem>
                        {tokens.map((token) => (
                          <SelectItem key={token.name} value={token.name}>
                            {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    placeholder="e.g., my-user"
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
                    placeholder="e.g., my-application"
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

                {/* Monitoring Information Section */}
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <Label className="text-sm font-medium">
                      Monitoring Information (Optional)
                    </Label>
                  </div>

                  <div className="space-y-4">
                    {/* OpenAPI Section */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-hasOpenAPI"
                          checked={editFormData.hasOpenAPI}
                          onCheckedChange={(checked) =>
                            handleEditInputChange("hasOpenAPI", !!checked)
                          }
                        />
                        <Label htmlFor="edit-hasOpenAPI" className="text-sm">
                          Has OpenAPI documentation
                        </Label>
                      </div>
                      {editFormData.hasOpenAPI && (
                        <div className="ml-6 grid gap-2">
                          <Label htmlFor="edit-openAPIPath">OpenAPI Path</Label>
                          <Input
                            id="edit-openAPIPath"
                            value={editFormData.openAPIPath}
                            onChange={(e) =>
                              handleEditInputChange(
                                "openAPIPath",
                                e.target.value,
                              )
                            }
                            placeholder={DEFAULT_OPENAPI_PATH}
                            className={
                              errors.openAPIPath
                                ? "border-destructive focus:border-destructive"
                                : ""
                            }
                          />
                          {errors.openAPIPath && (
                            <p className="text-sm text-destructive">
                              {errors.openAPIPath}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Open Client Section */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-hasOpenClient"
                          checked={editFormData.hasOpenClient}
                          onCheckedChange={(checked) =>
                            handleEditInputChange("hasOpenClient", !!checked)
                          }
                        />
                        <Label htmlFor="edit-hasOpenClient" className="text-sm">
                          Has Open Client documentation
                        </Label>
                      </div>
                      {editFormData.hasOpenClient && (
                        <div className="ml-6 grid gap-2">
                          <Label htmlFor="edit-openClientPath">
                            Open Client Path
                          </Label>
                          <Input
                            id="edit-openClientPath"
                            value={editFormData.openClientPath}
                            onChange={(e) =>
                              handleEditInputChange(
                                "openClientPath",
                                e.target.value,
                              )
                            }
                            placeholder={DEFAULT_OPEN_CLIENT_PATH}
                            className={
                              errors.openClientPath
                                ? "border-destructive focus:border-destructive"
                                : ""
                            }
                          />
                          {errors.openClientPath && (
                            <p className="text-sm text-destructive">
                              {errors.openClientPath}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
