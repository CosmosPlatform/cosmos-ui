import { GetApplicationsInteractionsResponse } from "@/lib/api/monitoring/monitoring";
import { ReactFlow, Background, Edge, Node } from "@xyflow/react";
import { useMemo, useEffect, useState, useCallback } from "react";
import "@xyflow/react/dist/style.css";
import ApplicationNode from "./applicationNode";
import DependencyDetailsDrawer from "./dependencyDetailsDrawer";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

const nodeTypes = {
  applicationNode: ApplicationNode,
};

interface ApplicationGraphProps {
  mainApplication?: string;
  applicationData: GetApplicationsInteractionsResponse;
}

import ELK from "elkjs";
import { ZoomSlider } from "../flow/zoom-slider";

const elk = new ELK();

const elkOptions = {
  "elk.algorithm": "layered", // alternatives: "force", "radial", "stress"
  "elk.direction": "RIGHT", // graph direction: RIGHT, DOWN, UP, LEFT
  "elk.edgeRouting": "ORTHOGONAL", // routes edges around nodes
  "elk.layered.spacing.nodeNodeBetweenLayers": "200",
  "elk.spacing.nodeNode": "100",
  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
};

async function layoutGraph(
  nodes: Node[],
  edges: Edge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const elkGraph = {
    id: "root",
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width || 30,
      height: node.height || 30,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(elkGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const elkNode = layout.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: elkNode?.x || 0,
        y: elkNode?.y || 0,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function ApplicationGraph({
  mainApplication,
  applicationData,
}: ApplicationGraphProps) {
  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>([]);
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>([]);
  const [isLayouting, setIsLayouting] = useState(true);
  const [selectedDependency, setSelectedDependency] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme } = useTheme();

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const dependency = applicationData.dependencies.find(
        (dep) => `${dep.consumer}-${dep.provider}` === edge.id,
      );

      if (dependency) {
        setSelectedDependency(dependency);
        setIsDrawerOpen(true);
      }
    },
    [applicationData.dependencies],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedDependency(null);
  }, []);

  const { initialNodes, initialEdges } = useMemo(() => {
    const edges: Edge[] = [];

    const createNodes = (): Node[] => {
      const nodes: Node[] = [];

      for (const appName in applicationData.applicationsInvolved) {
        const appInfo = applicationData.applicationsInvolved[appName];
        const isMainApp = appName === mainApplication;
        const node: Node = {
          id: appName,
          position: { x: 0, y: 0 },
          data: {
            applicationName: appName,
            applicationTeam: appInfo.team,
            standOut: isMainApp,
          },
          type: "applicationNode",
        };
        nodes.push(node);
      }
      return nodes;
    };

    const nodes = createNodes();

    applicationData.dependencies.forEach((dependency, _index) => {
      const edgeId = `${dependency.consumer}-${dependency.provider}`;
      const edge: Edge = {
        id: edgeId,
        source: dependency.consumer,
        target: dependency.provider,
        animated: true,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
          cursor: "pointer",
        },
        labelStyle: {
          fontSize: "10px",
          fill: "#4b5563",
        },
        type: "bezier",
        className:
          "hover:!stroke-primary hover:!stroke-4 transition-all duration-200",
      };

      edges.push(edge);
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [applicationData]);

  useEffect(() => {
    const applyLayout = async () => {
      setIsLayouting(true);
      try {
        const { nodes: layouted, edges } = await layoutGraph(
          initialNodes,
          initialEdges,
        );
        setLayoutedNodes(layouted);
        setLayoutedEdges(edges);
      } catch (error) {
        console.error("Failed to layout graph:", error);
        // Fallback to initial nodes/edges if layout fails
        setLayoutedNodes(initialNodes);
        setLayoutedEdges(initialEdges);
      } finally {
        setIsLayouting(false);
      }
    };

    if (initialNodes.length > 0) {
      applyLayout();
    } else {
      setIsLayouting(false);
    }
  }, [initialNodes, initialEdges]);

  if (isLayouting) {
    return (
      <div className="w-full aspect-[16/9] min-h-96 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Laying out graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/9] min-h-96">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={layoutedNodes}
        edges={layoutedEdges}
        onEdgeClick={handleEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        preventScrolling={false}
        zoomOnScroll={false}
        panOnScroll={false}
        colorMode={theme === "dark" ? "dark" : "light"}
      >
        <Background />
        <ZoomSlider position="top-left" />
      </ReactFlow>

      <DependencyDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        dependency={selectedDependency}
        applications={applicationData.applicationsInvolved}
      />
    </div>
  );
}
