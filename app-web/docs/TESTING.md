# Testing Strategy - holacitas

## Stack de Testing

| Herramienta | Propósito |
|-------------|-----------|
| **Jest** | Test runner |
| **@testing-library/angular** | Testing de componentes |
| **@testing-library/jest-dom** | Assertions de DOM |

## Prioridades de Testing

### 1. Testing de Interfaz (Prioridad Alta)
Priorizar tests que validan la interacción del usuario con la interfaz.

```typescript
// ✓ BIEN: Testing de comportamiento del usuario
render(<BookingForm />);
await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan');
await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

expect(screen.getByText(/reserva confirmada/i)).toBeInTheDocument();

// ✓ BIEN: Verificar elementos en el DOM
expect(screen.getByText('Selecciona un servicio')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /ver disponibilidad/i })).toBeVisible();
```

### 2. Testing de Comportamiento de Servicios (Prioridad Media)
Cuando sea necesario mockear servicios, priorizar `toHaveBeenCalled` y `toHaveBeenCalledWith`.

```typescript
// ✓ BIEN: Verificar llamadas al servicio
jest.spyOn(appointmentService, 'create').mockResolvedValue(appointmentMock);

await component.onSubmit();

expect(appointmentService.create).toHaveBeenCalledWith({
  company_id: 'company-1',
  employee_id: 'employee-1',
  service_id: 'service-1',
  client_name: 'Juan Pérez',
  client_phone: '12345678',
  appointment_date: '2026-03-20',
  appointment_time: '10:00'
});

// ✓ BIEN: Verificar que se llamó con parámetros específicos
expect(companyService.getBySlug).toHaveBeenCalledWith('mi-empresa');
```

### 3. Tests de equality (Menor prioridad)
Solo usar cuando sea necesario verificar valores específicos.

```typescript
// ✓ ACEPTABLE: Para valores simples o constantes
expect(component.loading).toBe(false);
expect(component.error).toBe('');

// ✗ EVITAR: Mockear respuestas complejas
expect(mockResponse).toEqual(expect.objectContaining({ ... }));
```

## Estructura de Archivos de Test

```
src/app/
├── core/
│   └── services/
│       ├── auth.service.spec.ts
│       ├── company.service.spec.ts
│       └── appointment.service.spec.ts
└── features/
    └── public/
        ├── company-list/
        │   ├── company-list.component.spec.ts
        │   └── company-list.component.html
        ├── employee-calendar/
        │   ├── employee-calendar.component.spec.ts
        │   └── employee-calendar.component.html
        └── booking-form/
            ├── booking-form.component.spec.ts
            └── booking-form.component.html
```

## Ejemplos de Tests

### Test de Componente de Interfaz

```typescript
// booking-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { Screen } from '@testing-library/angular';
import { provideMock } from '@testing-library/angular/jest-util';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let screen: Screen;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        provideMock(AppointmentService)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
    screen = await fixture.screen;
    fixture.detectChanges();
  });

  it('debe mostrar formulario de reserva', () => {
    expect(screen.getByText('Confirmar Reserva')).toBeInTheDocument();
  });

  it('debe validar que nombre es requerido', async () => {
    const submitBtn = screen.getByRole('button', { name: /confirmar reserva/i });
    
    await userEvent.click(submitBtn);
    
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
  });

  it('debe llamar a appointmentService.create al enviar formulario válido', async () => {
    const appointmentService = TestBed.inject(AppointmentService);
    jest.spyOn(appointmentService, 'create').mockResolvedValue({} as any);

    component.company = { id: 'company-1', name: 'Test', slug: 'test' } as any;
    component.employee = { id: 'employee-1', full_name: 'Juan' } as any;
    component.service = { id: 'service-1', name: 'Corte', duration_minutes: 30 } as any;
    component.selectedDate = '2026-03-20';
    component.selectedTime = '10:00';
    
    component.bookingForm.patchValue({
      client_name: 'Juan Pérez',
      client_phone: '12345678'
    });

    await component.onSubmit();

    expect(appointmentService.create).toHaveBeenCalledWith({
      company_id: 'company-1',
      employee_id: 'employee-1',
      service_id: 'service-1',
      client_name: 'Juan Pérez',
      client_phone: '12345678',
      appointment_date: '2026-03-20',
      appointment_time: '10:00'
    });
  });
});
```

### Test de Servicio

```typescript
// appointment.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockSupabase: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: {}, error: null })
          })
        })
      })
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        { provide: SupabaseClient, useValue: mockSupabase }
      ]
    });

    service = TestBed.inject(AppointmentService);
  });

  it('debe crear una cita', async () => {
    const appointmentData = {
      company_id: 'company-1',
      employee_id: 'employee-1',
      service_id: 'service-1',
      client_name: 'Juan',
      client_phone: '12345678',
      appointment_date: '2026-03-20',
      appointment_time: '10:00'
    };

    await service.create(appointmentData);

    expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
  });
});
```

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## Notas

- Jest reemplazó a Jasmine/Karma para mejor rendimiento y DX
- Testing Library prioriza tests que se parecen a cómo el usuario usa la app
- Mockear solo lo necesario, preferir integración real cuando sea posible
