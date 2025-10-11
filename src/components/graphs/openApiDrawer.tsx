"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { getApplicationOpenAPISpecification } from "@/lib/api/monitoring/monitoring";
import { Loader2, FileCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OpenApiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationName: string | null;
}

export default function OpenApiDrawer({
  isOpen,
  onClose,
  applicationName,
}: OpenApiDrawerProps) {
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationName) {
      fetchOpenApiSpec();
    } else {
      // Reset state when drawer closes
      setOpenApiSpec(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicationName]);

  const fetchOpenApiSpec = async () => {
    if (!applicationName) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApplicationOpenAPISpecification(applicationName);

      if (result.data) {
        // Parse the OpenAPI spec JSON string
        const spec = JSON.parse(result.data.openAPISpec);
        setOpenApiSpec(spec);
      } else if (result.error) {
        setError(result.error.error || "Failed to load OpenAPI specification");
      }
    } catch (err) {
      console.error("Error fetching OpenAPI spec:", err);
      setError("An error occurred while fetching the OpenAPI specification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[600px] sm:w-[800px] sm:max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            OpenAPI Specification
          </SheetTitle>
          <SheetDescription>
            {applicationName
              ? `API documentation for ${applicationName}`
              : "API documentation"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading OpenAPI specification...</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && openApiSpec && (
            <div className="swagger-ui-wrapper">
              <SwaggerUI spec={openApiSpec} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
