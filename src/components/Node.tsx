import React from 'react';
import * as Icons from 'lucide-react';
import { WorkflowNode } from '../types/workflow';
import { getNodeDefinition } from '../lib/nodeDefinitions';

interface NodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  isExecuting: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
}

const Node: React.FC<NodeProps> = ({
  node,
  isSelected,
  isExecuting,
  isConnecting,
  onSelect,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
}) => {
  const definition = getNodeDefinition(node.type);
  if (!definition) return null;

  const IconComponent = Icons[definition.icon as keyof typeof Icons] as React.FC<{ size?: number; className?: string }>;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (e.button === 0) {
      onDragStart(e);
    }
  };

  const handleOutputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionStart();
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onConnectionEnd();
    }
  };

  return (
    <div
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isExecuting ? 'animate-pulse' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: 240,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className={`${definition.color} px-4 py-3 flex items-center gap-3`}>
          {IconComponent && <IconComponent size={20} className="text-white" />}
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{definition.label}</div>
            <div className="text-white/80 text-xs truncate">{node.label || 'Untitled'}</div>
          </div>
        </div>

        <div className="px-4 py-3 bg-white">
          <div className="text-xs text-slate-600">{definition.description}</div>
        </div>

        {definition.inputs.length > 0 && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 hover:scale-110 transition-all"
            onClick={handleInputClick}
          />
        )}

        {definition.outputs.length > 0 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 hover:scale-110 transition-all"
            onClick={handleOutputClick}
          />
        )}

        {isExecuting && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
            <Icons.Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Node;
