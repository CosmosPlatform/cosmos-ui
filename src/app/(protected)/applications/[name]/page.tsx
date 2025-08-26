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
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getApplication,
  deleteApplication,
  type Application,
} from "@/lib/api/applications/applications";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationName = params.name as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      if (!applicationName) return;

      setLoading(true);

      const result = await getApplication(applicationName);
      if (result.error) {
        toast.error("Failed to load application: " + result.error.error);
        router.push("/applications");
      } else {
        console.log(result);
        setApplication(result.data?.application || null);
      }

      setLoading(false);
    };

    loadApplication();
  }, [applicationName, router]);

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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
