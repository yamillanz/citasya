import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface Schedule {
  id: string;
  company_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private supabase: SupabaseClient = supabase;

  async getByCompany(companyId: string, includeInactive = false): Promise<Schedule[]> {
    let query = this.supabase
      .from('schedules')
      .select('*')
      .eq('company_id', companyId)
      .order('day_of_week');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async create(schedule: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await this.supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await this.supabase
      .from('schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
