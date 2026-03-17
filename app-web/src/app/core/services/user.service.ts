import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, CreateUserDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private supabase = inject(SupabaseClient);

  async getEmployeesByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(user: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
