import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

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
  private supabase = inject(SupabaseClient);

  async getByCompany(companyId: string): Promise<Schedule[]> {
    const { data, error } = await this.supabase
      .from('schedules')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('day_of_week');
    
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
