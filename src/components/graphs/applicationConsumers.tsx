import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsumedEndpoints } from "@/lib/api/monitoring/monitoring";

interface ApplicationConsumersProps {
  consumedEndpoints: ConsumedEndpoints;
}

export default function ApplicationConsumers({
  consumedEndpoints,
}: ApplicationConsumersProps) {
  if (Object.keys(consumedEndpoints).length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No endpoint consumers found for this application.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(consumedEndpoints).flatMap(([endpoint, methods]) =>
        Object.entries(methods).map(([method, details]) => (
          <Card key={`${endpoint}-${method}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {method.toUpperCase()}
                </Badge>
                <CardTitle className="text-base font-mono">
                  {endpoint}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Consumed by:</p>
              <div className="flex flex-wrap gap-2">
                {details.consumers.map((consumer) => (
                  <Badge
                    key={consumer}
                    variant="secondary"
                    className="font-normal"
                  >
                    {consumer}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )),
      )}
    </div>
  );
}
