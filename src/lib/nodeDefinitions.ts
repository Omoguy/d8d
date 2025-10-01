import { NodeDefinition } from '../types/workflow';

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'trigger-manual',
    label: 'Manual Trigger',
    icon: 'Play',
    color: 'bg-emerald-500',
    category: 'trigger',
    description: 'Manually start the workflow with a button click',
    inputs: [],
    outputs: [{ name: 'output', type: 'any' }],
    configFields: [
      {
        name: 'buttonLabel',
        label: 'Button Label',
        type: 'text',
        placeholder: 'Start Workflow',
        defaultValue: 'Start Workflow',
      },
    ],
  },
  {
    type: 'action-http',
    label: 'HTTP Request',
    icon: 'Globe',
    color: 'bg-blue-500',
    category: 'action',
    description: 'Make HTTP requests to external APIs',
    inputs: [{ name: 'input', type: 'any', required: false }],
    outputs: [{ name: 'response', type: 'object' }],
    configFields: [
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
        defaultValue: 'GET',
      },
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        placeholder: 'https://api.example.com/data',
      },
      {
        name: 'headers',
        label: 'Headers (JSON)',
        type: 'code',
        placeholder: '{"Content-Type": "application/json"}',
        defaultValue: '{}',
      },
      {
        name: 'body',
        label: 'Body (JSON)',
        type: 'code',
        placeholder: '{"key": "value"}',
      },
    ],
  },
  {
    type: 'action-set-variable',
    label: 'Set Variable',
    icon: 'Database',
    color: 'bg-purple-500',
    category: 'action',
    description: 'Store data in a variable for later use',
    inputs: [{ name: 'input', type: 'any', required: false }],
    outputs: [{ name: 'output', type: 'any' }],
    configFields: [
      {
        name: 'variableName',
        label: 'Variable Name',
        type: 'text',
        placeholder: 'myVariable',
      },
      {
        name: 'value',
        label: 'Value',
        type: 'code',
        placeholder: '{"key": "value"}',
      },
    ],
  },
  {
    type: 'action-condition',
    label: 'IF Condition',
    icon: 'GitBranch',
    color: 'bg-orange-500',
    category: 'action',
    description: 'Branch workflow based on a condition',
    inputs: [{ name: 'input', type: 'any', required: true }],
    outputs: [
      { name: 'true', type: 'any' },
      { name: 'false', type: 'any' },
    ],
    configFields: [
      {
        name: 'condition',
        label: 'Condition (JavaScript)',
        type: 'code',
        placeholder: 'input.value > 10',
      },
    ],
  },
  {
    type: 'action-code',
    label: 'Code',
    icon: 'Code',
    color: 'bg-slate-500',
    category: 'action',
    description: 'Execute custom JavaScript code',
    inputs: [{ name: 'input', type: 'any', required: false }],
    outputs: [{ name: 'output', type: 'any' }],
    configFields: [
      {
        name: 'code',
        label: 'JavaScript Code',
        type: 'code',
        placeholder: 'return { result: input.value * 2 };',
      },
    ],
  },
];

export const getNodeDefinition = (type: string): NodeDefinition | undefined => {
  return nodeDefinitions.find((def) => def.type === type);
};
