import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Company, CreateCompanyDto } from '../models/company.model';
import { supabase } from '../supabase';

export interface CompanyWithPlan extends Company {
  plans?: { id: string; name: string } | null;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private supabase: SupabaseClient = supabase;

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

  async getAll(): Promise<CompanyWithPlan[]> {
    const { data: companies, error: companyError } = await this.supabase
      .from('companies')
      .select('*')
      .order('name');

    if (companyError) throw companyError;

    const { data: plans, error: planError } = await this.supabase
      .from('plans')
      .select('id, name');

    if (planError) throw planError;

    const planMap = new Map((plans || []).map((p: any) => [p.id, p]));

    return (companies || []).map((company: any) => ({
      ...company,
      plans: company.plan_id ? planMap.get(company.plan_id) || null : null
    }));
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

  async getActiveCompaniesPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ data: CompanyWithPlan[]; hasMore: boolean }> {
    const start = page * size;
    const end = start + size - 1;

    let query = this.supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: companies, error, count } = await query
      .order('name')
      .range(start, end);

    if (error) throw error;

    const { data: plans } = await this.supabase
      .from('plans')
      .select('id, name');

    const planMap = new Map((plans || []).map((p: any) => [p.id, p]));
    const totalCount = count ?? 0;
    const hasMore = start + (companies || []).length < totalCount;

    return {
      data: (companies || []).map((company: any) => ({
        ...company,
        plans: company.plan_id ? planMap.get(company.plan_id) || null : null,
      })),
      hasMore,
    };
  }
}
