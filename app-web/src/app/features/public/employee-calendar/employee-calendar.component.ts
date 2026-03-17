import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
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
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './employee-calendar.component.html',
  styleUrls: ['./employee-calendar.component.scss']
})
export class EmployeeCalendarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);

  company: Company | null = null;
  employee: User | null = null;
  services: Service[] = [];
  selectedDate: string = '';
  availableSlots: string[] = [];
  selectedService: Service | null = null;
  selectedTime: string = '';
  loading = true;
  error = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    events: []
  };

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');

    if (!slug || !employeeId) {
      this.error = 'Página no encontrada';
      this.loading = false;
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    if (!this.company) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.employee = await this.userService.getById(employeeId);
    if (!this.employee) {
      this.error = 'Profesional no encontrado';
      this.loading = false;
      return;
    }

    this.services = await this.serviceService.getByEmployee(employeeId);
    this.loading = false;
  }

  async onDateSelect(arg: any) {
    this.selectedDate = arg.startStr.split('T')[0];
    await this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    if (!this.selectedDate || !this.selectedService || !this.employee || !this.company) return;

    this.availableSlots = await this.appointmentService.getAvailableSlots(
      this.company.id,
      this.employee.id,
      this.selectedDate,
      this.selectedService.duration_minutes
    );
  }

  async onServiceChange(service: Service) {
    this.selectedService = service;
    if (this.selectedDate) {
      await this.loadAvailableSlots();
    }
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  proceedToBooking() {
    if (!this.selectedDate || !this.selectedTime || !this.selectedService || !this.company || !this.employee) {
      return;
    }

    this.router.navigate(['/c', this.company.slug, 'e', this.employee.id, 'book'], {
      queryParams: {
        date: this.selectedDate,
        time: this.selectedTime,
        serviceId: this.selectedService.id
      }
    });
  }

  handleDateSelect(arg: any) {
    this.selectedDate = arg.startStr.split('T')[0];
    this.loadAvailableSlots();
  }
}
