import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Company, CreateCompanyDto } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private supabase = inject(SupabaseClient);

  async getBySlug(slug: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data;
  }

  async getById(id: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async getAll(): Promise<Company[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*, plans:plan_id(id, name)')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async create(company: Partial<Company>): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, company: Partial<Company>): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ ...company, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deactivate(id: string): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async activate(id: string): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
