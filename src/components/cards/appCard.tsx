import { Application } from "@/lib/api/applications/applications";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  GitBranch,
  Users,
  BookOpen,
  Monitor,
} from "lucide-react";

interface AppCardProps {
  application: Application;
  onClick: (applicationName: string) => void;
}

export function AppCard({ application, onClick }: AppCardProps) {
  return (
    <Card
      className="group relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={() => onClick(application.name)}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="relative space-y-4">
        <CardTitle className="flex items-start justify-between gap-3 text-xl font-semibold tracking-tight text-foreground">
          <span className="transition-colors duration-300 group-hover:text-primary">
            {application.name}
          </span>
          {application.gitInformation && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-full border-primary/30 bg-primary/10 text-primary"
            >
              <GitBranch className="h-3 w-3" />
              {application.gitInformation.provider}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm text-muted-foreground/90">
          {application.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          {application.team && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 rounded-full px-3 py-1"
            >
              <Users className="h-3 w-3" />
              {application.team.name}
            </Badge>
          )}
          {application.monitoringInformation?.hasOpenAPI && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-full px-3 py-1"
            >
              <BookOpen className="h-3 w-3" />
              OpenAPI
            </Badge>
          )}
          {application.monitoringInformation?.hasOpenClient && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-full px-3 py-1"
            >
              <Monitor className="h-3 w-3" />
              Open Client
            </Badge>
          )}
        </div>

        {application.gitInformation && (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
              <GitBranch className="h-3 w-3" />
              Repository
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {application.gitInformation.repositoryOwner}/
              {application.gitInformation.repositoryName}
            </p>
            <p className="text-xs text-muted-foreground">
              Branch: {application.gitInformation.repositoryBranch}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="relative flex items-center justify-between border-t border-border/60 px-6 py-4 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
        <span>Click to view details</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </CardFooter>
    </Card>
  );
}
