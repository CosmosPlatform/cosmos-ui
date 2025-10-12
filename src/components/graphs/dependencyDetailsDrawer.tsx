import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Endpoints ({totalEndpoints})
            </div>
            {endpointEntries.length === 0 ? (
              <Card>
                <CardContent className="text-sm text-muted-foreground text-center py-4">
                  No endpoint details available
                </CardContent>
              </Card>
            ) : (
              endpointEntries.flatMap(([endpoint, methods]) =>
                Object.entries(methods).map(([method, details]) => (
                  <Card key={`${endpoint}-${method}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {method.toUpperCase()}
                        </Badge>
                        <CardTitle className="text-sm font-mono">
                          {endpoint}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    {details.reasons && details.reasons.length > 0 && (
                      <CardContent>
                        <div className="space-y-1">
                          {details.reasons.map((reason, reasonIndex) => (
                            <div
                              key={reasonIndex}
                              className="text-xs text-muted-foreground p-2 bg-muted rounded"
                            >
                              {reason}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )),
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
