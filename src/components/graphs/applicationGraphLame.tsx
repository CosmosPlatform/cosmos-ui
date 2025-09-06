import React, { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Position,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { GetApplicationInteractionsResponse } from "@/lib/api/monitoring/monitoring";

interface ApplicationGraphProps {
  applicationData: GetApplicationInteractionsResponse;
}

export default function ApplicationGraph({
  applicationData,
}: ApplicationGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeArray: Edge[] = [];

    // Create the main application node (center)
    const mainApp = applicationData.mainApplication;
    nodeMap.set(mainApp.name, {
      id: mainApp.name,
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-lg">{mainApp.name}</div>
            <div className="text-xs text-muted-foreground">
              {mainApp.team || "No team"}
            </div>
          </div>
        ),
      },
      position: { x: 0, y: 0 },
      type: "default",
      style: {
        background: "#3b82f6",
        color: "white",
        border: "2px solid #1d4ed8",
        borderRadius: "8px",
        padding: "10px",
        minWidth: "150px",
      },
    });

    // Create nodes for applications that this app provides services to
    const providesToApps = applicationData.applicationsToProvide;
    providesToApps.forEach((app, index) => {
      const angle = (index * 2 * Math.PI) / Math.max(providesToApps.length, 1);
      const radius = 250;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius - 100;

      if (!nodeMap.has(app.name)) {
        nodeMap.set(app.name, {
          id: app.name,
          data: {
            label: (
              <div className="text-center">
                <div className="font-semibold">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  {app.team || "No team"}
                </div>
              </div>
            ),
          },
          position: { x, y },
          type: "default",
          style: {
            background: "#10b981",
            color: "white",
            border: "2px solid #059669",
            borderRadius: "8px",
            padding: "8px",
            minWidth: "120px",
          },
        });
      }

      // Create edge from main app to this app (main app provides to this app)
      edgeArray.push({
        id: `${mainApp.name}-${app.name}`,
        source: mainApp.name,
        target: app.name,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
        label: "provides to",
        labelStyle: { fontSize: "10px", fill: "#6b7280" },
      });
    });

    // Create nodes for applications that this app consumes services from
    const consumesFromApps = applicationData.applicationsToConsume;
    consumesFromApps.forEach((app, index) => {
      const angle =
        (index * 2 * Math.PI) / Math.max(consumesFromApps.length, 1) + Math.PI;
      const radius = 250;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius + 100;

      if (!nodeMap.has(app.name)) {
        nodeMap.set(app.name, {
          id: app.name,
          data: {
            label: (
              <div className="text-center">
                <div className="font-semibold">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  {app.team || "No team"}
                </div>
              </div>
            ),
          },
          position: { x, y },
          type: "default",
          style: {
            background: "#f59e0b",
            color: "white",
            border: "2px solid #d97706",
            borderRadius: "8px",
            padding: "8px",
            minWidth: "120px",
          },
        });
      }

      // Create edge from this app to main app (main app consumes from this app)
      edgeArray.push({
        id: `${app.name}-${mainApp.name}`,
        source: app.name,
        target: mainApp.name,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#f59e0b", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#f59e0b",
        },
        label: "consumed by",
        labelStyle: { fontSize: "10px", fill: "#6b7280" },
      });
    });

    // Handle detailed dependencies for additional context
    applicationData.dependencies.forEach((dep) => {
      // If we don't already have an edge for this relationship, add it
      const edgeId = `${dep.consumer}-${dep.provider}`;
      const reverseEdgeId = `${dep.provider}-${dep.consumer}`;
      
      if (!edgeArray.find(e => e.id === edgeId || e.id === reverseEdgeId)) {
        // Create nodes if they don't exist
        if (!nodeMap.has(dep.consumer) && dep.consumer !== mainApp.name) {
          nodeMap.set(dep.consumer, {
            id: dep.consumer,
            data: {
              label: (
                <div className="text-center">
                  <div className="font-semibold">{dep.consumer}</div>
                  <div className="text-xs text-muted-foreground">Unknown team</div>
                </div>
              ),
            },
            position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
            type: "default",
            style: {
              background: "#6b7280",
              color: "white",
              border: "2px solid #4b5563",
              borderRadius: "8px",
              padding: "8px",
              minWidth: "120px",
            },
          });
        }

        if (!nodeMap.has(dep.provider) && dep.provider !== mainApp.name) {
          nodeMap.set(dep.provider, {
            id: dep.provider,
            data: {
              label: (
                <div className="text-center">
                  <div className="font-semibold">{dep.provider}</div>
                  <div className="text-xs text-muted-foreground">Unknown team</div>
                </div>
              ),
            },
            position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
            type: "default",
            style: {
              background: "#6b7280",
              color: "white",
              border: "2px solid #4b5563",
              borderRadius: "8px",
              padding: "8px",
              minWidth: "120px",
            },
          });
        }

        edgeArray.push({
          id: edgeId,
          source: dep.consumer,
          target: dep.provider,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#6b7280",
          },
          label: dep.reasons?.length ? `${dep.reasons.length} reasons` : "dependency",
          labelStyle: { fontSize: "9px", fill: "#6b7280" },
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeArray,
    };
  }, [applicationData]);

  if (!applicationData) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">No application data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-background border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#e5e7eb" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background) return node.style.background as string;
            return "#6b7280";
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
