import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Service, CreateServiceDto } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private supabase = inject(SupabaseClient);

  async getByCompany(companyId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getByEmployee(employeeId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('employee_services')
      .select(`
        service:services(*)
      `)
      .eq('employee_id', employeeId);
    
    if (error) throw error;
    const services = (data || []).map((d: any) => d.service as Service).filter((s: Service | null): s is Service => s !== null && s.is_active === true);
    return services;
  }

  async getById(id: string): Promise<Service | null> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(service: CreateServiceDto): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
}
