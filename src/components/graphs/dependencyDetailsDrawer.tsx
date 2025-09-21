import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Globe, Zap } from "lucide-react";
import {
  ApplicationDependency,
  ApplicationInformation,
} from "@/lib/api/monitoring/monitoring";

interface DependencyDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dependency: ApplicationDependency | null;
  applications: Record<string, ApplicationInformation>;
}

export default function DependencyDetailsDrawer({
  isOpen,
  onClose,
  dependency,
  applications,
}: DependencyDetailsDrawerProps) {
  if (!dependency) {
    return null;
  }

  const consumerApp = applications[dependency.consumer];
  const providerApp = applications[dependency.provider];

  const endpointEntries = Object.entries(dependency.endpoints || {});
  const totalEndpoints = endpointEntries.reduce(
    (acc, [, methods]) => acc + Object.keys(methods).length,
    0,
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Dependency Details
          </SheetTitle>
          <SheetDescription>
            Information about the dependency relationship between applications
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 px-2">
          {/* Dependency Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Dependency Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="font-semibold text-sm">
                    {dependency.consumer}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Team: {consumerApp?.team || "Unknown"}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    Consumer
                  </Badge>
                </div>

                <ArrowRight className="h-6 w-6 text-muted-foreground mx-4" />

                <div className="text-center">
                  <div className="font-semibold text-sm">
                    {dependency.provider}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Team: {providerApp?.team || "Unknown"}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    Provider
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Reasons */}
          {dependency.reasons && dependency.reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dependency Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dependency.reasons.map((reason, index) => (
                    <div
                      key={index}
                      className="p-2 bg-muted rounded-md text-sm"
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Endpoints ({totalEndpoints})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {endpointEntries.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No endpoint details available
                </div>
              ) : (
                <div className="space-y-4">
                  {endpointEntries.map(([endpoint, methods], endpointIndex) => (
                    <div key={endpointIndex} className="space-y-2">
                      <div className="font-medium text-sm">{endpoint}</div>
                      <div className="ml-4 space-y-3">
                        {Object.entries(methods).map(
                          ([method, details], methodIndex) => (
                            <div key={methodIndex} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {method.toUpperCase()}
                                </Badge>
                              </div>
                              {details.reasons &&
                                details.reasons.length > 0 && (
                                  <div className="ml-2 space-y-1">
                                    {details.reasons.map(
                                      (reason, reasonIndex) => (
                                        <div
                                          key={reasonIndex}
                                          className="text-xs text-muted-foreground p-1 bg-muted rounded"
                                        >
                                          {reason}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>
                          ),
                        )}
                      </div>
                      {endpointIndex < endpointEntries.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
