export type NodeType =
  | 'trigger-manual'
  | 'action-http'
  | 'action-set-variable'
  | 'action-condition'
  | 'action-code';

export interface NodeConfig {
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  config: NodeConfig;
  label?: string;
}

export interface NodeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceOutput?: string;
  targetInput?: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasData {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  viewport: Viewport;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  canvas_data: CanvasData;
  created_at: string;
  updated_at: string;
}

export interface NodeExecutionResult {
  nodeId: string;
  output: any;
  error?: string;
  timestamp: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  execution_data: {
    results: NodeExecutionResult[];
    currentNodeId?: string;
  };
  error_message?: string;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  category: 'trigger' | 'action';
  description: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  configFields: ConfigField[];
}

export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
}

export interface NodeOutput {
  name: string;
  type: string;
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'code' | 'number' | 'boolean';
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}
