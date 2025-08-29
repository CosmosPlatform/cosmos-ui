"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/dist/client/components/navigation";
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
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import {
  getApplicationsWithFilter,
  createApplication,
  type Application,
  Team,
} from "@/lib/api/applications/applications";
import { getTeams } from "@/lib/api/teams/teams";

export default function Page() {
  const [applications, setApplications] = useState<Array<Application>>([]);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGitSectionOpen, setIsGitSectionOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
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
    formData.gitProvider ||
    formData.gitBranch ||
    formData.gitOwner ||
    formData.gitRepositoryName;

  // Check if all git fields are filled when any is filled
  const areAllGitFieldsFilled =
    formData.gitProvider &&
    formData.gitBranch &&
    formData.gitOwner &&
    formData.gitRepositoryName;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const appsResult = await getApplicationsWithFilter("");
      if (appsResult.error) {
        toast.error("Failed to load applications: " + appsResult.error.error);
        setApplications([]);
      } else {
        setApplications(appsResult.data?.applications || []);
      }

      const teamsResult = await getTeams();
      if (teamsResult.error) {
        toast.error("Failed to load teams: " + teamsResult.error.error);
        setTeams([]);
      } else {
        setTeams(teamsResult.data?.teams || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleApplicationClick = (applicationName: string) => {
    router.push(`/applications/${encodeURIComponent(applicationName)}`);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = "Application name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate git fields if any are filled
    if (hasAnyGitField) {
      if (!formData.gitProvider) {
        newErrors.gitProvider =
          "Git provider is required when git information is provided";
      }
      if (!formData.gitBranch.trim()) {
        newErrors.gitBranch =
          "Git branch is required when git information is provided";
      }
      if (!formData.gitOwner.trim()) {
        newErrors.gitOwner =
          "Repository owner is required when git information is provided";
      }
      if (!formData.gitRepositoryName.trim()) {
        newErrors.gitRepositoryName =
          "Repository name is required when git information is provided";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateApplication = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    const requestData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    // Add team if selected
    if (formData.team) {
      requestData.team = formData.team;
    }

    // Add git information if all fields are provided
    if (areAllGitFieldsFilled) {
      requestData.gitInformation = {
        provider: formData.gitProvider,
        repositoryOwner: formData.gitOwner,
        repositoryName: formData.gitRepositoryName,
        repositoryBranch: formData.gitBranch,
      };
    }

    const result = await createApplication(requestData);

    if (result.error) {
      toast.error("Failed to create application: " + result.error.error);
    } else {
      toast.success("Application created successfully!");

      if (result.data?.application) {
        setApplications((prev) => [...prev, result.data.application]);
      }

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
      description: "",
      team: "",
      gitProvider: "",
      gitBranch: "",
      gitOwner: "",
      gitRepositoryName: "",
    });
    setErrors({});
    setIsGitSectionOpen(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage your applications and create new ones
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
              <DialogDescription>
                Add a new application to your workspace. Fill in all the
                required information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter application name"
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
                  placeholder="Enter application description"
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
                    {teams.map((team) => (
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
                    <Label htmlFor="gitProvider">Git Provider</Label>
                    <Select
                      value={formData.gitProvider}
                      onValueChange={(value) =>
                        handleInputChange("gitProvider", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.gitProvider
                            ? "border-red-500 focus:border-red-500"
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
                      <p className="text-sm text-red-500">
                        {errors.gitProvider}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gitOwner">Repository Owner</Label>
                    <Input
                      id="gitOwner"
                      value={formData.gitOwner}
                      onChange={(e) =>
                        handleInputChange("gitOwner", e.target.value)
                      }
                      placeholder="e.g., RafaB15"
                      className={
                        errors.gitOwner
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.gitOwner && (
                      <p className="text-sm text-red-500">{errors.gitOwner}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gitRepositoryName">Repository Name</Label>
                    <Input
                      id="gitRepositoryName"
                      value={formData.gitRepositoryName}
                      onChange={(e) =>
                        handleInputChange("gitRepositoryName", e.target.value)
                      }
                      placeholder="e.g., Distribuidos-TP"
                      className={
                        errors.gitRepositoryName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.gitRepositoryName && (
                      <p className="text-sm text-red-500">
                        {errors.gitRepositoryName}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gitBranch">Git Branch</Label>
                    <Input
                      id="gitBranch"
                      value={formData.gitBranch}
                      onChange={(e) =>
                        handleInputChange("gitBranch", e.target.value)
                      }
                      placeholder="e.g., main, develop"
                      className={
                        errors.gitBranch
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.gitBranch && (
                      <p className="text-sm text-red-500">{errors.gitBranch}</p>
                    )}
                  </div>

                  {hasAnyGitField && !areAllGitFieldsFilled && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                      <strong>Note:</strong> All git fields must be filled if
                      you provide any git information.
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
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
                onClick={handleCreateApplication}
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No applications found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first application
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Application
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card
              key={application.name}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleApplicationClick(application.name)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {application.name}
                </CardTitle>
                <CardDescription>{application.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {application.team && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Team:</span>
                    <span>{application.team.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
