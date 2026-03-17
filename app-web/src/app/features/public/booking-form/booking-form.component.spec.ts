import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan'
  };

  const mockEmployee = {
    id: 'employee-1',
    full_name: 'Juan Pérez'
  };

  const mockService = {
    id: 'service-1',
    name: 'Corte de cabello',
    duration_minutes: 30,
    price: 25
  };

  beforeEach(async () => {
    appointmentServiceMock = {
      create: jest.fn().mockResolvedValue({})
    } as any;

    const companyServiceMock = {
      getBySlug: jest.fn().mockResolvedValue(mockCompany)
    };

    const userServiceMock = {
      getById: jest.fn().mockResolvedValue(mockEmployee)
    };

    const serviceServiceMock = {
      getById: jest.fn().mockResolvedValue(mockService)
    };

    const routerMock = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      createUrlTree: jest.fn().mockReturnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'companySlug') return 'peluqueria-juan';
                  if (key === 'employeeId') return 'employee-1';
                  return null;
                }
              },
              queryParamMap: {
                get: (key: string) => {
                  if (key === 'date') return '2026-03-20';
                  if (key === 'serviceId') return 'service-1';
                  if (key === 'time') return '10:00';
                  return null;
                }
              }
            }
          }
        },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener formulario con campos requeridos', () => {
    expect(component.bookingForm.contains('client_name')).toBe(true);
    expect(component.bookingForm.contains('client_phone')).toBe(true);
  });

  it('debe validar que nombre es requerido', () => {
    component.bookingForm.patchValue({ client_name: '', client_phone: '12345678' });
    expect(component.bookingForm.valid).toBe(false);
  });

  it('debe validar que teléfono es requerido', () => {
    component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '' });
    expect(component.bookingForm.valid).toBe(false);
  });

  it('debe ser válido con datos completos', () => {
    component.bookingForm.patchValue({
      client_name: 'Juan',
      client_phone: '12345678'
    });
    expect(component.bookingForm.valid).toBe(true);
  });
});
