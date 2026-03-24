import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../models/appointment.model';
import { ScheduleService } from './schedule.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private supabase = inject(SupabaseClient);
  private scheduleService = inject(ScheduleService);

  async getByEmployee(employeeId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');
    
    if (error) throw error;
    return data || [];
  }

  async getByEmployeeAll(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        service:service_id (name)
      `)
      .eq('employee_id', employeeId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getCompletedByEmployee(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        service:service_id (name)
      `)
      .eq('employee_id', employeeId)
      .eq('status', 'completed')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getAvailableSlots(companyId: string, employeeId: string, date: string, durationMinutes: number): Promise<string[]> {
    const dayOfWeek = new Date(date).getDay();
    
    const schedules = await this.scheduleService.getByCompany(companyId);
    const daySchedule = schedules.find(s => s.day_of_week === dayOfWeek);
    
    if (!daySchedule) return [];

    const appointments = await this.getByEmployee(employeeId, date);
    
    const slots: string[] = [];
    const [startHour, startMin] = daySchedule.start_time.split(':').map(Number);
    const [endHour, endMin] = daySchedule.end_time.split(':').map(Number);
    
    const slotDuration = durationMinutes;
    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (currentTime + slotDuration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const mins = currentTime % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      const isAvailable = !appointments.some(apt => {
        const [aptHour, aptMin] = apt.appointment_time.split(':').map(Number);
        const aptTime = aptHour * 60 + aptMin;
        const aptEndTime = aptTime + slotDuration;
        return currentTime < aptEndTime && (currentTime + slotDuration) > aptTime;
      });

      if (isAvailable) {
        slots.push(timeStr);
      }
      
      currentTime += slotDuration;
    }

    return slots;
  }

  async create(appointment: CreateAppointmentDto): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .insert({
        ...appointment,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update({ ...appointment, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async cancel(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  async getByCompany(companyId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        service:service_id (name),
        employee:employee_id (full_name)
      `)
      .eq('company_id', companyId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getByDate(companyId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        service:service_id (name),
        employee:employee_id (full_name)
      `)
      .eq('company_id', companyId)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async updateStatus(id: string, status: AppointmentStatus, amountCollected?: number): Promise<void> {
    const updateData: Partial<Appointment> = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (amountCollected !== undefined) {
      updateData.amount_collected = amountCollected;
    }

    const { error } = await this.supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  }
}
