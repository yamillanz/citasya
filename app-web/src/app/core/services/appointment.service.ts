import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Appointment, AppointmentStatus, CreateAppointmentDto, UpdateAppointmentServicesDto } from '../models/appointment.model';
import { Service } from '../models/service.model';
import { ScheduleService } from './schedule.service';
import { supabase } from '../supabase';
import { calculateTotalDuration } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private supabase: SupabaseClient = supabase;
  private scheduleService = inject(ScheduleService);

  async getByEmployee(employeeId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        )
      `)
      .eq('employee_id', employeeId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');
    
    if (error) throw error;
    return data?.map(apt => this.flattenServices(apt)) || [];
  }

  async getByEmployeeAll(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        )
      `)
      .eq('employee_id', employeeId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(apt => this.flattenServices(apt)) || [];
  }

  async getCompletedByEmployee(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        )
      `)
      .eq('employee_id', employeeId)
      .eq('status', 'completed')
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(apt => this.flattenServices(apt)) || [];
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
        if (!apt.services) return false;
        
        const aptDuration = calculateTotalDuration(apt.services);
        const [aptHour, aptMin] = apt.appointment_time.split(':').map(Number);
        const aptTime = aptHour * 60 + aptMin;
        const aptEndTime = aptTime + aptDuration;
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
    if (!appointment.service_ids || appointment.service_ids.length === 0) {
      throw new Error('At least one service is required');
    }

    const services = await this.getServicesByIds(appointment.service_ids);
    const totalDuration = calculateTotalDuration(services);

    const isAvailable = await this.checkAvailability(
      appointment.employee_id,
      appointment.appointment_date,
      appointment.appointment_time,
      totalDuration
    );

    if (!isAvailable) {
      throw new Error('Time slot not available for the total duration of services');
    }

    const { data: newAppointment, error: aptError } = await this.supabase
      .from('appointments')
      .insert({
        company_id: appointment.company_id,
        employee_id: appointment.employee_id,
        service_id: appointment.service_ids[0],
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_email: appointment.client_email,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        notes: appointment.notes,
        status: 'pending'
      })
      .select()
      .single();
    
    if (aptError) throw aptError;

    const appointmentServices = appointment.service_ids.map(service_id => ({
      appointment_id: newAppointment.id,
      service_id
    }));

    const { error: servicesError } = await this.supabase
      .from('appointment_services')
      .insert(appointmentServices);

    if (servicesError) throw servicesError;

    return this.getById(newAppointment.id);
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
        services:appointment_services(
          service:services(*)
        ),
        employee:employee_id (full_name)
      `)
      .eq('company_id', companyId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(apt => this.flattenServices(apt)) || [];
  }

  async getByDate(companyId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        ),
        employee:employee_id (full_name)
      `)
      .eq('company_id', companyId)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(apt => this.flattenServices(apt)) || [];
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

  async updateServices(appointmentId: string, serviceIds: string[]): Promise<Appointment> {
    if (!serviceIds || serviceIds.length === 0) {
      throw new Error('At least one service is required');
    }

    const appointment = await this.getById(appointmentId);
    
    if (appointment.status !== 'pending') {
      throw new Error('Services can only be modified on pending appointments');
    }

    const services = await this.getServicesByIds(serviceIds);
    const totalDuration = calculateTotalDuration(services);

    const isAvailable = await this.checkAvailability(
      appointment.employee_id,
      appointment.appointment_date,
      appointment.appointment_time,
      totalDuration,
      appointmentId
    );

    if (!isAvailable) {
      throw new Error('Time slot not available for the total duration of services');
    }

    await this.supabase
      .from('appointment_services')
      .delete()
      .eq('appointment_id', appointmentId);

    const appointmentServices = serviceIds.map(service_id => ({
      appointment_id: appointmentId,
      service_id
    }));

    await this.supabase
      .from('appointment_services')
      .insert(appointmentServices);

    return this.getById(appointmentId);
  }

  async getById(id: string): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.flattenServices(data);
  }

  private async getServicesByIds(ids: string[]): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  }

  private flattenServices(appointment: any): Appointment {
    return {
      ...appointment,
      services: appointment.services?.map((s: any) => s.service) || []
    };
  }

  private async checkAvailability(
    employeeId: string,
    date: string,
    time: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    let query = this.supabase
      .from('appointments')
      .select(`
        id,
        appointment_time,
        services:appointment_services(
          service:services(duration_minutes)
        )
      `)
      .eq('employee_id', employeeId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data: appointments } = await query;

    const occupiedSlots = appointments?.map(apt => {
      const totalDuration = apt.services.reduce(
        (sum: number, s: any) => sum + s.service.duration_minutes, 0
      );
      return {
        start: apt.appointment_time,
        end: this.addMinutes(apt.appointment_time, totalDuration)
      };
    }) || [];

    const newStart = time;
    const newEnd = this.addMinutes(time, durationMinutes);

    for (const slot of occupiedSlots) {
      if (this.slotsOverlap(newStart, newEnd, slot.start, slot.end)) {
        return false;
      }
    }

    return true;
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  private slotsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2;
  }
}
