import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    RouterLink,
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.scss'
})
export class EmployeeCalendarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);

  company = signal<Company | null>(null);
  employee = signal<User | null>(null);
  services = signal<Service[]>([]);
  selectedDate = signal('');
  availableSlots = signal<string[]>([]);
  selectedService = signal<Service | null>(null);
  selectedTime = signal('');
  loading = signal(true);
  error = signal('');

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    dateClick: this.handleDateClick.bind(this),
    unselectAuto: false,
    events: []
  };

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');

    if (!slug || !employeeId) {
      this.error.set('Página no encontrada');
      this.loading.set(false);
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      if (!company) {
        this.error.set('Empresa no encontrada');
        this.loading.set(false);
        return;
      }
      this.company.set(company);

      const employee = await this.userService.getById(employeeId);
      if (!employee) {
        this.error.set('Profesional no encontrado');
        this.loading.set(false);
        return;
      }
      this.employee.set(employee);

      const services = await this.serviceService.getByEmployee(employeeId);
      this.services.set(services);
    } catch (err) {
      this.error.set('Error al cargar los datos');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDateSelect(arg: any) {
    this.selectedDate.set(arg.startStr.split('T')[0]);
    this.selectedTime.set('');
    await this.loadAvailableSlots();
  }

  async handleDateClick(arg: any) {
    // arg.dateStr is like "2026-04-06T00:00:00+00:00"
    const dateStr = arg.dateStr;
    const datePart = dateStr.split('T')[0];
    this.selectedDate.set(datePart);
    this.selectedTime.set('');
    await this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    const service = this.selectedService();
    const date = this.selectedDate();
    const emp = this.employee();
    const comp = this.company();

    if (!date || !service || !emp || !comp) return;

    const slots = await this.appointmentService.getAvailableSlots(
      comp.id,
      emp.id,
      date,
      service.duration_minutes
    );
    this.availableSlots.set(slots);
  }

  async onServiceChange(service: Service) {
    this.selectedService.set(service);
    this.selectedTime.set('');
    if (this.selectedDate()) {
      await this.loadAvailableSlots();
    }
  }

  selectTime(time: string) {
    this.selectedTime.set(time);
  }

  proceedToBooking() {
    const comp = this.company();
    const emp = this.employee();
    const service = this.selectedService();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!comp || !emp || !service || !date || !time) {
      return;
    }

    this.router.navigate(['/c', comp.slug, 'e', emp.id, 'book'], {
      queryParams: {
        date: date,
        time: time,
        serviceId: service.id
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}
