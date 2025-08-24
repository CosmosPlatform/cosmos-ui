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
import { Plus, Loader2 } from "lucide-react";
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
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team: "",
  });

  // Load applications and teams on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load applications (empty filter returns all)
      const appsResult = await getApplicationsWithFilter("");
      if (appsResult.error) {
        toast.error("Failed to load applications: " + appsResult.error.error);
        setApplications([]); // Ensure it's always an array
      } else {
        setApplications(appsResult.data?.applications || []); // Safe access with fallback
      }

      // Load teams for the form
      const teamsResult = await getTeams();
      if (teamsResult.error) {
        toast.error("Failed to load teams: " + teamsResult.error.error);
        setTeams([]); // Ensure it's always an array
      } else {
        setTeams(teamsResult.data?.teams || []); // Safe access with fallback
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleApplicationClick = (applicationName: string) => {
    router.push(`/applications/${encodeURIComponent(applicationName)}`);
  };

  const handleCreateApplication = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.team
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);

    const result = await createApplication({
      name: formData.name.trim(),
      description: formData.description.trim(),
      team: formData.team,
    });

    if (result.error) {
      toast.error("Failed to create application: " + result.error.error);
    } else {
      toast.success("Application created successfully!");

      // Add the new application to the list
      if (result.data?.application) {
        setApplications((prev) => [...prev, result.data.application]);
      }

      // Reset form and close dialog
      setFormData({ name: "", description: "", team: "" });
      setIsDialogOpen(false);
    }

    setIsCreating(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
              <DialogDescription>
                Add a new application to your workspace. Fill in all the
                required information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter application name"
                />
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Team</Label>
                <Select
                  value={formData.team}
                  onValueChange={(value) => handleInputChange("team", value)}
                >
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
