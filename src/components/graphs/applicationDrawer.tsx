"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import Swagger from "@/components/swagger/swagger";
import ApplicationConsumers from "@/components/graphs/applicationConsumers";
import {
  getCompleteApplicationMonitoring,
  GetCompleteApplicationMonitoringResponse,
} from "@/lib/api/monitoring/monitoring";
import { Loader2, FileCode, Users, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationName: string | null;
}

export default function ApplicationDrawer({
  isOpen,
  onClose,
  applicationName,
}: ApplicationDrawerProps) {
  const [monitoringData, setMonitoringData] =
    useState<GetCompleteApplicationMonitoringResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationName) {
      fetchApplicationMonitoring();
    } else {
      // Reset state when drawer closes
      setMonitoringData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicationName]);

  const fetchApplicationMonitoring = async () => {
    if (!applicationName) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getCompleteApplicationMonitoring(applicationName);

      if (result.data) {
        setMonitoringData(result.data);
      } else if (result.error) {
        setError(
          result.error.error || "Failed to load application monitoring data",
        );
      }
    } catch (err) {
      console.error("Error fetching application monitoring:", err);
      setError("An error occurred while fetching the application data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[600px] sm:w-[800px] sm:max-w-[90vw] overflow-y-auto px-8">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            {monitoringData?.application.name ||
              applicationName ||
              "Application"}
          </SheetTitle>
          <SheetDescription>
            {monitoringData?.application.description ||
              "Application monitoring and documentation"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading application information...</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && monitoringData && (
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
                {monitoringData.openAPISpec ? (
                  <Swagger spec={JSON.parse(monitoringData.openAPISpec)} />
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
                  consumedEndpoints={monitoringData.consumedEndpoints}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
