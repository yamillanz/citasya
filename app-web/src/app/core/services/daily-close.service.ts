import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class DailyCloseService {
  private supabase = inject(SupabaseClient);

  async generateDailyClose(
    companyId: string, 
    date: string, 
    completedAppointments: Appointment[],
    companyName: string
  ): Promise<void> {
    // Check if already closed
    const { data: existing } = await this.supabase
      .from('daily_closes')
      .select('id')
      .eq('company_id', companyId)
      .eq('close_date', date)
      .single();

    if (existing) {
      throw new Error('Cierre ya generado para esta fecha');
    }

    // Calculate totals
    const totalAmount = completedAppointments.reduce(
      (sum, apt) => sum + (apt.amount_collected || 0), 
      0
    );

    // Generate PDF
    this.generatePDF(date, completedAppointments, totalAmount, companyName);
    
    // Save to daily_closes
    const { error } = await this.supabase
      .from('daily_closes')
      .insert({
        company_id: companyId,
        close_date: date,
        total_appointments: completedAppointments.length,
        total_amount: totalAmount
      });

    if (error) throw error;
  }

  private generatePDF(
    date: string, 
    appointments: Appointment[], 
    total: number,
    companyName: string
  ): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Cierre Diario', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(companyName, 105, 30, { align: 'center' });
    doc.text(`Fecha: ${date}`, 20, 40);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Resumen', 20, 55);
    
    doc.setFontSize(11);
    doc.text(`Total de citas completadas: ${appointments.length}`, 20, 65);
    doc.text(`Monto total: $${total.toFixed(2)}`, 20, 72);
    
    // Appointments detail
    doc.setFontSize(14);
    doc.text('Detalle de Citas', 20, 90);
    
    let y = 100;
    doc.setFontSize(10);
    
    // Table header
    doc.setFillColor(157, 193, 131); // Verde salvia
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Hora', 22, y);
    doc.text('Cliente', 50, y);
    doc.text('Servicio', 100, y);
    doc.text('Monto', 170, y);
    
    doc.setTextColor(0, 0, 0);
    y += 10;
    
    appointments.forEach((apt, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 5, 170, 7, 'F');
      }
      
      doc.text(apt.appointment_time, 22, y);
      doc.text(apt.client_name.substring(0, 20), 50, y);
      doc.text(((apt as any).service?.name || 'N/A').substring(0, 25), 100, y);
      doc.text(`$${(apt.amount_collected || 0).toFixed(2)}`, 170, y);
      
      y += 8;
      
      // New page if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Footer with total
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: $${total.toFixed(2)}`, 170, y, { align: 'right' });
    
    // Save
    doc.save(`cierre-${date}.pdf`);
  }

  async checkIfClosed(companyId: string, date: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('daily_closes')
      .select('id')
      .eq('company_id', companyId)
      .eq('close_date', date)
      .single();

    return !!data;
  }
}