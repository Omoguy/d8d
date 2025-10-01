import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { WorkflowNode } from '../types/workflow';
import { getNodeDefinition } from '../lib/nodeDefinitions';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onClose: () => void;
  onDelete: (nodeId: string) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const definition = getNodeDefinition(node.type);
  if (!definition) return null;

  const handleConfigChange = (fieldName: string, value: any) => {
    onUpdate(node.id, {
      config: {
        ...node.config,
        [fieldName]: value,
      },
    });
  };

  const handleLabelChange = (label: string) => {
    onUpdate(node.id, { label });
  };

  return (
    <div className="w-96 h-full bg-white border-l border-slate-200 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Node Configuration</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Node Type
          </label>
          <div className={`${definition.color} text-white px-4 py-2 rounded-lg text-sm font-medium`}>
            {definition.label}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Node Label
          </label>
          <input
            type="text"
            value={node.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter a custom label"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Configuration</h3>
          <div className="space-y-4">
            {definition.configFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={node.config[field.name] || field.defaultValue || ''}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={node.config[field.name] || field.defaultValue || ''}
                    onChange={(e) => handleConfigChange(field.name, Number(e.target.value))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={node.config[field.name] || field.defaultValue || ''}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {field.type === 'textarea' && (
                  <textarea
                    value={node.config[field.name] || field.defaultValue || ''}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-mono"
                  />
                )}
                {field.type === 'code' && (
                  <textarea
                    value={node.config[field.name] || field.defaultValue || ''}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-mono bg-slate-50"
                  />
                )}
                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={node.config[field.name] || field.defaultValue || false}
                      onChange={(e) => handleConfigChange(field.name, e.target.checked)}
                      className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">Enable</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-200">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Trash2 size={16} />
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
