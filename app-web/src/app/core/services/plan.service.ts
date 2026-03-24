import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Plan, CreatePlanDto } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private supabase = inject(SupabaseClient);

  async getAll(): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .order('price');
    
    if (error) throw error;
    return data || [];
  }

  async getAllActive(): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Plan | null> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(plan: CreatePlanDto): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .update(plan)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deactivate(id: string): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async activate(id: string): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
