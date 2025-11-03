import { createContext } from "react";

interface HoverContextValue {
  hoveredNodeId: string | null;
  isNodeActive: (nodeId: string) => boolean;
}

export const ApplicationGraphHoverContext = createContext<HoverContextValue>({
  hoveredNodeId: null,
  isNodeActive: () => true,
});
