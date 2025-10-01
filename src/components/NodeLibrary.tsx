import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { nodeDefinitions } from '../lib/nodeDefinitions';
import { NodeType } from '../types/workflow';

interface NodeLibraryProps {
  onNodeAdd: (type: NodeType) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onNodeAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodeDefinitions.filter(
    (node) =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerNodes = filteredNodes.filter((node) => node.category === 'trigger');
  const actionNodes = filteredNodes.filter((node) => node.category === 'action');

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Node Library</h2>
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {triggerNodes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Triggers
            </h3>
            <div className="space-y-2">
              {triggerNodes.map((node) => {
                const IconComponent = Icons[node.icon as keyof typeof Icons] as React.FC<{ size?: number }>;
                return (
                  <button
                    key={node.type}
                    onClick={() => onNodeAdd(node.type)}
                    className="w-full text-left px-4 py-3 rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${node.color} p-2 rounded-lg`}>
                        {IconComponent && <IconComponent size={20} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {node.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {actionNodes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {actionNodes.map((node) => {
                const IconComponent = Icons[node.icon as keyof typeof Icons] as React.FC<{ size?: number }>;
                return (
                  <button
                    key={node.type}
                    onClick={() => onNodeAdd(node.type)}
                    className="w-full text-left px-4 py-3 rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${node.color} p-2 rounded-lg`}>
                        {IconComponent && <IconComponent size={20} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {node.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Icons.Search size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No nodes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeLibrary;
