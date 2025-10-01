import React, { useState, useEffect, useCallback } from 'react';
import { Play, Save, Loader2, FileText, Workflow } from 'lucide-react';
import Canvas from './components/Canvas';
import NodeLibrary from './components/NodeLibrary';
import NodeConfigPanel from './components/NodeConfigPanel';
import DataPanel from './components/DataPanel';
import { WorkflowNode, NodeConnection, Viewport, NodeType, NodeExecutionResult } from './types/workflow';
import { WorkflowExecutor } from './lib/workflowExecutor';
import { workflowService } from './lib/workflowService';
import { getNodeDefinition } from './lib/nodeDefinitions';

function App() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<NodeExecutionResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);

  useEffect(() => {
    initializeWorkflow();
  }, []);

  const initializeWorkflow = async () => {
    try {
      const workflow = await workflowService.createWorkflow('My First Workflow');
      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
    }
  };

  const handleNodeAdd = useCallback(
    (type: NodeType) => {
      const definition = getNodeDefinition(type);
      if (!definition) return;

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}-${Math.random()}`,
        type,
        position: {
          x: (400 - viewport.x) / viewport.zoom,
          y: (300 - viewport.y) / viewport.zoom,
        },
        config: {},
        label: definition.label,
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [viewport]
  );

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setConnections((prev) =>
      prev.filter((conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId)
    );
    setSelectedNodeId(null);
  }, []);

  const handleConnectionCreate = useCallback(
    (connection: Omit<NodeConnection, 'id'>) => {
      const existingConnection = connections.find(
        (conn) =>
          conn.sourceId === connection.sourceId &&
          conn.targetId === connection.targetId
      );

      if (existingConnection) return;

      const newConnection: NodeConnection = {
        ...connection,
        id: `conn-${Date.now()}-${Math.random()}`,
      };

      setConnections((prev) => [...prev, newConnection]);
    },
    [connections]
  );

  const handleConnectionDelete = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  }, []);

  const handleExecute = async () => {
    if (isExecuting || nodes.length === 0) return;

    setIsExecuting(true);
    setExecutionResults([]);
    setShowDataPanel(true);

    try {
      const executor = new WorkflowExecutor(
        nodes,
        connections,
        (nodeId) => {
          setExecutingNodeId(nodeId);
        },
        (result) => {
          setExecutionResults((prev) => [...prev, result]);
          setExecutingNodeId(null);
        }
      );

      await executor.execute();
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
      setExecutingNodeId(null);
    }
  };

  const handleSave = async () => {
    if (!workflowId || isSaving) return;

    setIsSaving(true);
    try {
      await workflowService.saveCanvasData(workflowId, {
        nodes,
        connections,
        viewport,
      });

      await workflowService.updateWorkflow(workflowId, {
        name: workflowName,
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Workflow className="text-white" size={24} />
          </div>
          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
            <p className="text-sm text-slate-500">Visual Workflow Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDataPanel(!showDataPanel)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showDataPanel
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200'
            }`}
          >
            <FileText size={18} />
            Data Panel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium flex items-center gap-2 border-2 border-slate-200 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || nodes.length === 0}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            Execute
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <NodeLibrary onNodeAdd={handleNodeAdd} />

        <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            connections={connections}
            viewport={viewport}
            selectedNodeId={selectedNodeId}
            executingNodeId={executingNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeMove={handleNodeMove}
            onNodeDelete={handleNodeDelete}
            onConnectionCreate={handleConnectionCreate}
            onConnectionDelete={handleConnectionDelete}
            onViewportChange={setViewport}
            onCanvasClick={() => setSelectedNodeId(null)}
          />
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNodeId(null)}
            onDelete={handleNodeDelete}
          />
        )}

        {showDataPanel && (
          <DataPanel executionResults={executionResults} nodes={nodes} />
        )}
      </div>
    </div>
  );
}

export default App;
