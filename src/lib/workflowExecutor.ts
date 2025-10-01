import { WorkflowNode, NodeConnection, NodeExecutionResult } from '../types/workflow';

interface ExecutionContext {
  variables: Record<string, any>;
  results: Record<string, any>;
}

export class WorkflowExecutor {
  private nodes: WorkflowNode[];
  private connections: NodeConnection[];
  private context: ExecutionContext;
  private executionResults: NodeExecutionResult[];
  private onNodeExecute?: (nodeId: string) => void;
  private onNodeComplete?: (result: NodeExecutionResult) => void;

  constructor(
    nodes: WorkflowNode[],
    connections: NodeConnection[],
    onNodeExecute?: (nodeId: string) => void,
    onNodeComplete?: (result: NodeExecutionResult) => void
  ) {
    this.nodes = nodes;
    this.connections = connections;
    this.context = { variables: {}, results: {} };
    this.executionResults = [];
    this.onNodeExecute = onNodeExecute;
    this.onNodeComplete = onNodeComplete;
  }

  async execute(): Promise<NodeExecutionResult[]> {
    const triggerNodes = this.nodes.filter((node) => node.type.startsWith('trigger-'));

    if (triggerNodes.length === 0) {
      throw new Error('No trigger node found in workflow');
    }

    for (const triggerNode of triggerNodes) {
      await this.executeNode(triggerNode, null);
    }

    return this.executionResults;
  }

  private async executeNode(node: WorkflowNode, input: any): Promise<any> {
    this.onNodeExecute?.(node.id);

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      let output: any;

      switch (node.type) {
        case 'trigger-manual':
          output = await this.executeTriggerManual(node, input);
          break;
        case 'action-http':
          output = await this.executeHttpRequest(node, input);
          break;
        case 'action-set-variable':
          output = await this.executeSetVariable(node, input);
          break;
        case 'action-condition':
          output = await this.executeCondition(node, input);
          break;
        case 'action-code':
          output = await this.executeCode(node, input);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const result: NodeExecutionResult = {
        nodeId: node.id,
        output,
        timestamp: new Date().toISOString(),
      };

      this.executionResults.push(result);
      this.context.results[node.id] = output;
      this.onNodeComplete?.(result);

      const nextNodes = this.getNextNodes(node.id);
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, output);
      }

      return output;
    } catch (error) {
      const result: NodeExecutionResult = {
        nodeId: node.id,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };

      this.executionResults.push(result);
      this.onNodeComplete?.(result);

      throw error;
    }
  }

  private async executeTriggerManual(node: WorkflowNode, input: any): Promise<any> {
    return { triggered: true, timestamp: new Date().toISOString() };
  }

  private async executeHttpRequest(node: WorkflowNode, input: any): Promise<any> {
    const { method, url, headers, body } = node.config;

    if (!url) {
      throw new Error('URL is required for HTTP request');
    }

    const requestHeaders: HeadersInit = {};
    if (headers) {
      try {
        const parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers;
        Object.assign(requestHeaders, parsedHeaders);
      } catch (e) {
        throw new Error('Invalid headers JSON');
      }
    }

    const options: RequestInit = {
      method: method || 'GET',
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      try {
        const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        options.body = JSON.stringify(parsedBody);
      } catch (e) {
        options.body = body;
      }
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      status: response.status,
      statusText: response.statusText,
      data,
    };
  }

  private async executeSetVariable(node: WorkflowNode, input: any): Promise<any> {
    const { variableName, value } = node.config;

    if (!variableName) {
      throw new Error('Variable name is required');
    }

    let parsedValue = value;
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }
    }

    this.context.variables[variableName] = parsedValue;

    return {
      variableName,
      value: parsedValue,
    };
  }

  private async executeCondition(node: WorkflowNode, input: any): Promise<any> {
    const { condition } = node.config;

    if (!condition) {
      throw new Error('Condition is required');
    }

    try {
      const func = new Function('input', 'variables', `return ${condition}`);
      const result = func(input, this.context.variables);

      return {
        condition,
        result: Boolean(result),
        input,
      };
    } catch (error) {
      throw new Error(`Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeCode(node: WorkflowNode, input: any): Promise<any> {
    const { code } = node.config;

    if (!code) {
      throw new Error('Code is required');
    }

    try {
      const func = new Function('input', 'variables', code);
      const result = func(input, this.context.variables);

      return result || null;
    } catch (error) {
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getNextNodes(nodeId: string): WorkflowNode[] {
    const outgoingConnections = this.connections.filter((conn) => conn.sourceId === nodeId);
    return outgoingConnections
      .map((conn) => this.nodes.find((node) => node.id === conn.targetId))
      .filter((node): node is WorkflowNode => node !== undefined);
  }
}
