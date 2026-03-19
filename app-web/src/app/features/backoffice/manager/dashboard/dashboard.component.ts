import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    AvatarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = signal<User | null>(null);
  todayAppointments = signal<Appointment[]>([]);
  loading = signal(true);

  todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  totalToday = computed(() => this.todayAppointments().length);
  
  completedToday = computed(() => 
    this.todayAppointments().filter(a => a.status === 'completed').length
  );
  
  pendingToday = computed(() => 
    this.todayAppointments().filter(a => a.status === 'pending').length
  );

  totalRevenue = computed(() =>
    this.todayAppointments()
      .filter(a => a.status === 'completed')
      .reduce((sum, apt) => sum + (apt.amount_collected || 0), 0)
  );

  async ngOnInit() {
    this.user.set(await this.authService.getCurrentUser());
    if (this.user()?.company_id) {
      await this.loadTodayAppointments();
    }
    this.loading.set(false);
  }

  async loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await this.appointmentService.getByDate(
      this.user()!.company_id!,
      today
    );
    
    this.todayAppointments.set(appointments);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'no_show': return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Completada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'no_show': 'No asistió'
    };
    return labels[status] || status;
  }
}
