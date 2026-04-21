import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, CreateUserDto } from '../models/user.model';
import { supabase } from '../supabase';

@Injectable({ providedIn: 'root' })
export class UserService {
  private supabase: SupabaseClient = supabase;

  async getEmployeesByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .or('role.eq.employee,and(role.eq.manager,can_be_employee.eq.true)')
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, companies:company_id(id, name)')
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getAllByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(user: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabase.functions.invoke('create-user', {
      body: user,
    });

    if (error) {
      const message = error.message?.toLowerCase() || '';
      if (message.includes('already') || message.includes('duplicate') || message.includes('registered') || message.includes('unique')) {
        throw new Error('El email ya existe');
      }
      if (message.includes('password') && message.includes('6')) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      throw new Error(error.message || 'No se pudo crear el usuario');
    }

    return data;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async deactivate(id: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async activate(id: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCanBeEmployee(id: string, value: boolean): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ can_be_employee: value, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
