import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WorkflowNode, NodeConnection, Viewport } from '../types/workflow';
import Node from './Node';
import ConnectionLine from './ConnectionLine';

interface CanvasProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  viewport: Viewport;
  selectedNodeId: string | null;
  executingNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionCreate: (connection: Omit<NodeConnection, 'id'>) => void;
  onConnectionDelete: (connectionId: string) => void;
  onViewportChange: (viewport: Viewport) => void;
  onCanvasClick: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  viewport,
  selectedNodeId,
  executingNodeId,
  onNodeSelect,
  onNodeMove,
  onNodeDelete,
  onConnectionCreate,
  onConnectionDelete,
  onViewportChange,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(2, viewport.zoom * delta));
      onViewportChange({ ...viewport, zoom: newZoom });
    },
    [viewport, onViewportChange]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      e.preventDefault();
    } else if (e.button === 0 && e.target === e.currentTarget) {
      onCanvasClick();
    }
  }, [viewport, onCanvasClick]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        onViewportChange({
          ...viewport,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (isDraggingNode && draggedNodeId) {
        const node = nodes.find((n) => n.id === draggedNodeId);
        if (node) {
          const newX = (e.clientX - viewport.x - dragOffset.x) / viewport.zoom;
          const newY = (e.clientY - viewport.y - dragOffset.y) / viewport.zoom;
          onNodeMove(draggedNodeId, { x: newX, y: newY });
        }
      } else if (isConnecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setTempConnectionEnd({
          x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
          y: (e.clientY - rect.top - viewport.y) / viewport.zoom,
        });
      }
    },
    [isPanning, isDraggingNode, isConnecting, draggedNodeId, nodes, viewport, dragOffset, panStart, onViewportChange, onNodeMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDraggingNode(false);
    setDraggedNodeId(null);
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnectionEnd(null);
  }, []);

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setIsDraggingNode(true);
        setDraggedNodeId(nodeId);
        const nodeScreenX = node.position.x * viewport.zoom + viewport.x;
        const nodeScreenY = node.position.y * viewport.zoom + viewport.y;
        setDragOffset({
          x: e.clientX - nodeScreenX,
          y: e.clientY - nodeScreenY,
        });
      }
    },
    [nodes, viewport]
  );

  const handleConnectionStart = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  }, []);

  const handleConnectionEnd = useCallback(
    (targetNodeId: string) => {
      if (connectionStart && connectionStart !== targetNodeId) {
        onConnectionCreate({
          sourceId: connectionStart,
          targetId: targetNodeId,
        });
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnectionEnd(null);
    },
    [connectionStart, onConnectionCreate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        onNodeDelete(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onNodeDelete]);

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.position.x + 120,
      y: node.position.y + 40,
    };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50 cursor-move"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      <div
        className="absolute"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {connections.map((conn) => {
            const start = getNodeCenter(conn.sourceId);
            const end = getNodeCenter(conn.targetId);
            return (
              <ConnectionLine
                key={conn.id}
                start={start}
                end={end}
                isSelected={false}
                onClick={() => {}}
              />
            );
          })}
          {isConnecting && connectionStart && tempConnectionEnd && (
            <ConnectionLine
              start={getNodeCenter(connectionStart)}
              end={tempConnectionEnd}
              isSelected={false}
              isTemp
              onClick={() => {}}
            />
          )}
        </svg>

        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isExecuting={executingNodeId === node.id}
            onSelect={() => onNodeSelect(node.id)}
            onDragStart={(e) => handleNodeDragStart(node.id, e)}
            onConnectionStart={() => handleConnectionStart(node.id)}
            onConnectionEnd={() => handleConnectionEnd(node.id)}
            isConnecting={isConnecting}
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-slate-600 border border-slate-200">
        Zoom: {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
