/*
  # Create Workflow Automation Schema

  1. New Tables
    - `workflows`
      - `id` (uuid, primary key)
      - `name` (text) - Workflow name
      - `description` (text) - Optional description
      - `canvas_data` (jsonb) - Stores node positions, connections, and configurations
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `workflow_executions`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, foreign key) - Reference to workflow
      - `status` (text) - Execution status (running, completed, failed)
      - `started_at` (timestamptz) - When execution started
      - `completed_at` (timestamptz) - When execution completed
      - `execution_data` (jsonb) - Stores node outputs and execution state
      - `error_message` (text) - Error details if failed

  2. Security
    - Enable RLS on both tables
    - Public access for MVP (authenticated users can read/write all workflows)
    
  3. Notes
    - Using JSONB for flexible storage of workflow canvas state
    - Execution history allows tracking and debugging
    - Timestamps track workflow modifications
*/

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Workflow',
  description text DEFAULT '',
  canvas_data jsonb DEFAULT '{"nodes": [], "connections": [], "viewport": {"x": 0, "y": 0, "zoom": 1}}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  status text DEFAULT 'running',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  execution_data jsonb DEFAULT '{}'::jsonb,
  error_message text
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Public access policies for MVP
CREATE POLICY "Anyone can view workflows"
  ON workflows FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert workflows"
  ON workflows FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update workflows"
  ON workflows FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete workflows"
  ON workflows FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view executions"
  ON workflow_executions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert executions"
  ON workflow_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update executions"
  ON workflow_executions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at DESC);