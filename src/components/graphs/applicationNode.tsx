import { memo, useContext } from "react";

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/flow/base-node";
import { Users } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { ApplicationGraphHoverContext } from "./applicationGraphHoverContext";

interface ApplicationNodeData {
  applicationName: string;
  applicationTeam?: string;
  standOut?: boolean;
}

interface ApplicationNodeProps {
  data: ApplicationNodeData;
}

const ApplicationNode = memo(({ data }: ApplicationNodeProps) => {
  const { hoveredNodeId, isNodeActive } = useContext(
    ApplicationGraphHoverContext,
  );
  const { applicationName, applicationTeam, standOut } = data;
  const isDimmed = hoveredNodeId !== null && !isNodeActive(applicationName);

  if (!applicationTeam) {
    return (
      <BaseNode
        className={`min-w-32 max-w-64 w-fit transition-opacity duration-200 ${standOut ? "ring-2 ring-primary" : ""} ${isDimmed ? "opacity-40" : ""}`}
      >
        <BaseNodeContent>
          <h3 className="text-sm font-bold text-center whitespace-nowrap px-2">
            {applicationName}
          </h3>
        </BaseNodeContent>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </BaseNode>
    );
  }

  return (
    <BaseNode
      className={`min-w-32 max-w-64 w-fit transition-opacity duration-200 ${standOut ? "ring-2 ring-primary" : ""} ${isDimmed ? "opacity-40" : ""}`}
    >
      <BaseNodeHeader className="border-b flex items-center justify-center space-x-1">
        <Users className="size-4" />
        <BaseNodeHeaderTitle className="text-xs flex-none">
          {applicationTeam}
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <h3 className="text-sm font-bold text-center whitespace-nowrap px-2">
          {applicationName}
        </h3>
      </BaseNodeContent>
      <Handle type="target" position={Position.Left} className="invisible" />
      <Handle type="source" position={Position.Right} className="invisible" />
    </BaseNode>
  );
});

ApplicationNode.displayName = "ApplicationNode";

export default ApplicationNode;
