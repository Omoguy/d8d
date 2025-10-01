import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { NodeExecutionResult } from '../types/workflow';

interface DataPanelProps {
  executionResults: NodeExecutionResult[];
  nodes: any[];
}

const DataPanel: React.FC<DataPanelProps> = ({ executionResults, nodes }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.label || node?.type || 'Unknown Node';
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l border-slate-200 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Execution Data</h2>
        <p className="text-sm text-slate-500 mt-1">
          {executionResults.length === 0
            ? 'No execution data yet'
            : `${executionResults.length} node${executionResults.length === 1 ? '' : 's'} executed`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {executionResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6 text-center">
            <Clock size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Run the workflow to see execution data</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {executionResults.map((result, index) => {
              const isExpanded = expandedNodes.has(result.nodeId);
              const hasError = !!result.error;

              return (
                <div key={`${result.nodeId}-${index}`} className="px-4 py-3">
                  <button
                    onClick={() => toggleNode(result.nodeId)}
                    className="w-full flex items-start gap-3 text-left hover:bg-slate-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {getNodeLabel(result.nodeId)}
                        </span>
                        {hasError ? (
                          <XCircle size={16} className="text-red-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 ml-7 space-y-3">
                      {hasError ? (
                        <div>
                          <div className="text-xs font-semibold text-red-600 mb-2">Error</div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                              {result.error}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs font-semibold text-slate-600 mb-2">Output</div>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-96 overflow-auto">
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words font-mono">
                              {formatJson(result.output)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPanel;
