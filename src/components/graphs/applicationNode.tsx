import { memo } from "react";

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/flow/base-node";
import { Rocket } from "lucide-react";
import { Handle, Position } from "@xyflow/react";

interface ApplicationNodeData {
  applicationName: string;
  applicationTeam?: string;
  standOut?: boolean;
}

interface ApplicationNodeProps {
  data: ApplicationNodeData;
}

const ApplicationNode = memo(({ data }: ApplicationNodeProps) => {
  const { applicationName, applicationTeam, standOut } = data;

  if (!applicationTeam) {
    return (
      <BaseNode
        className={`min-w-32 max-w-64 w-fit ${standOut ? "ring-2 ring-primary" : ""}`}
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
      className={`min-w-32 max-w-64 w-fit ${standOut ? "ring-2 ring-primary" : ""}`}
    >
      <BaseNodeHeader className="border-b">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle className="text-xs">
          Team: {applicationTeam}
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <h3 className="text-sm font-bold text-center whitespace-nowrap px-2">
          {applicationName}
        </h3>
      </BaseNodeContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
});

ApplicationNode.displayName = "ApplicationNode";

export default ApplicationNode;
