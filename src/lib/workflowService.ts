import { supabase } from './supabase';
import { Workflow, CanvasData } from '../types/workflow';

export const workflowService = {
  async createWorkflow(name: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name,
        canvas_data: {
          nodes: [],
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Workflow;
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async listWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Workflow;
  },

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase.from('workflows').delete().eq('id', id);

    if (error) throw error;
  },

  async saveCanvasData(id: string, canvasData: CanvasData): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .update({
        canvas_data: canvasData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },
};
