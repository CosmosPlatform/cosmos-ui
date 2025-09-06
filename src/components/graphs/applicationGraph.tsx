import { GetApplicationInteractionsResponse } from "@/lib/api/monitoring/monitoring";
import { ReactFlow, Background, Controls, Edge, Node } from "@xyflow/react";
import { useMemo } from "react";
import "@xyflow/react/dist/style.css";
import ApplicationNode from "./applicationNode";

const nodeTypes = {
  applicationNode: ApplicationNode,
};

interface ApplicationGraphProps {
  applicationData: GetApplicationInteractionsResponse;
}

export default function ApplicationGraph({
  applicationData,
}: ApplicationGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edges: Edge[] = [];

    const getOrCreateNode = (appName: string, isMainApp = false): Node => {
      if (nodeMap.has(appName)) {
        return nodeMap.get(appName)!;
      }

      let team = "";
      if (isMainApp) {
        team = applicationData.mainApplication.team;
      } else {
        const foundApp =
          applicationData.applicationsToProvide.find(
            (app) => app.name === appName,
          ) ||
          applicationData.applicationsToConsume.find(
            (app) => app.name === appName,
          );
        team = foundApp?.team || "";
      }

      const node: Node = {
        id: appName,
        position: { x: 0, y: 0 },
        data: {
          applicationName: appName,
          applicationTeam: team,
          standOut: isMainApp,
        },
        type: "applicationNode",
      };

      nodeMap.set(appName, node);
      return node;
    };

    const mainAppNode = getOrCreateNode(
      applicationData.mainApplication.name,
      true,
    );

    applicationData.dependencies.forEach((dependency, index) => {
      const consumerNode = getOrCreateNode(dependency.consumer);

      const providerNode = getOrCreateNode(dependency.provider);

      const edgeId = `${dependency.consumer}-${dependency.provider}`;
      const edge: Edge = {
        id: edgeId,
        source: dependency.consumer,
        target: dependency.provider,
        animated: true,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
        },
        labelStyle: {
          fontSize: "10px",
          fill: "#4b5563",
        },
        type: "smoothstep",
      };

      edges.push(edge);
    });

    const nodes = Array.from(nodeMap.values());

    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    nodes.forEach((node, index) => {
      if (node.id === applicationData.mainApplication.name) {
        node.position = { x: centerX, y: centerY };
      } else {
        const angle = (2 * Math.PI * index) / (nodes.length - 1);
        node.position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }
    });

    return { nodes, edges };
  }, [applicationData]);

  return (
    <div className="w-full aspect-[16/9] min-h-96">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
