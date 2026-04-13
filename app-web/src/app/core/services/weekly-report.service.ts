import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Service } from '../models/service.model';
import { User } from '../models/user.model';
import {
  WeeklySummaryRow,
  WeeklyDetailRow,
  calculateAppointmentCommission,
  formatDate
} from '../models/weekly-report.model';

interface AppointmentWithServices extends Appointment {
  services: Service[];
  employee_name?: string;
}

@Injectable({ providedIn: 'root' })
export class WeeklyReportService {
  private supabase: SupabaseClient = supabase;

  async getEmployees(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .in('role', ['employee', 'manager'])
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    return data || [];
  }

  async getWeeklySummary(
    companyId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<WeeklySummaryRow[]> {
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        ),
        employee:employee_id (full_name)
      `)
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .order('appointment_date', { ascending: true });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const appointments = (data || []).map((apt: any) => this.flattenServices(apt));

    const employeeMap = new Map<string, { name: string; appointments: AppointmentWithServices[] }>();

    for (const apt of appointments) {
      const empId = apt.employee_id;
      const empName = (apt as any).employee?.full_name || 'Desconocido';

      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, { name: empName, appointments: [] });
      }
      employeeMap.get(empId)!.appointments.push(apt);
    }

    const summary: WeeklySummaryRow[] = [];

    employeeMap.forEach((value, empId) => {
      const totalAppointments = value.appointments.length;
      const totalAmount = value.appointments.reduce((sum, apt) => sum + (apt.amount_collected || 0), 0);
      const totalCommission = value.appointments.reduce((sum, apt) => {
        return sum + calculateAppointmentCommission(apt.amount_collected || 0, apt.services || []);
      }, 0);

      summary.push({
        employee_id: empId,
        employee_name: value.name,
        total_appointments: totalAppointments,
        total_amount: totalAmount,
        total_commission: Math.round(totalCommission * 100) / 100
      });
    });

    return summary.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
  }

  async getEmployeeDetail(
    companyId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeeklyDetailRow[]> {
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services:appointment_services(
          service:services(*)
        )
      `)
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) throw error;

    const appointments = (data || []).map((apt: any) => this.flattenServices(apt));

    return appointments.map(apt => ({
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      client_name: apt.client_name,
      services: apt.services || [],
      amount_collected: apt.amount_collected || 0,
      status: apt.status as AppointmentStatus,
      commission: Math.round(
        calculateAppointmentCommission(apt.amount_collected || 0, apt.services || []) * 100
      ) / 100
    }));
  }

  private flattenServices(appointment: any): AppointmentWithServices {
    return {
      ...appointment,
      services: appointment.services?.map((s: any) => s.service) || [],
      employee_name: appointment.employee?.full_name
    };
  }
}