import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SuccessStepComponent } from './success-step.component';
import { Service } from '../../../../../../core/models/service.model';
import { User } from '../../../../../../core/models/user.model';
import { Company } from '../../../../../../core/models/company.model';

describe('SuccessStepComponent', () => {
  let component: SuccessStepComponent;
  let fixture: ComponentFixture<SuccessStepComponent>;

  const mockServices: Service[] = [
    { id: 'service-1', name: 'Corte de cabello', duration_minutes: 30, price: 25 } as Service,
  ];

  const mockEmployee: User = { id: 'employee-1', full_name: 'Juan Pérez' } as User;

  const mockCompany: Company = { id: 'company-1', name: 'Peluquería Juan', slug: 'peluqueria-juan' } as Company;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessStepComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessStepComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedServices', mockServices);
    fixture.componentRef.setInput('employee', mockEmployee);
    fixture.componentRef.setInput('company', mockCompany);
    fixture.componentRef.setInput('selectedDate', '2026-04-10');
    fixture.componentRef.setInput('selectedTime', '10:00');
    fixture.componentRef.setInput('totalDuration', 30);
    fixture.componentRef.setInput('totalPrice', 25);
  });

  describe('Renderizado', () => {
    it('debe mostrar el título de confirmación', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('¡Reserva Confirmada!');
    });

    it('debe mostrar los servicios seleccionados', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Corte de cabello');
      expect(fixture.nativeElement.textContent).toContain('30 min');
    });

    it('debe mostrar la duración total', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('30 min');
    });

    it('debe mostrar el nombre del profesional', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Juan Pérez');
    });

    it('debe mostrar la hora', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('10:00');
    });

    it('debe mostrar el precio total cuando es mayor a 0', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('$25.00');
    });

    it('debe mostrar el recordatorio de llegar temprano', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Recuerda llegar 5 minutos antes');
    });

    it('debe mostrar el botón de volver al inicio', () => {
      fixture.detectChanges();
      const homeBtn = fixture.nativeElement.querySelector('.home-btn');
      expect(homeBtn).toBeTruthy();
      expect(homeBtn.textContent).toContain('Volver al inicio');
    });
  });

  describe('Eventos', () => {
    it('debe emitir goHome al hacer clic en el botón volver al inicio', () => {
      const goHomeSpy = jest.fn();
      component.goHome.subscribe(goHomeSpy);
      fixture.detectChanges();

      const homeBtn = fixture.nativeElement.querySelector('.home-btn');
      homeBtn.click();

      expect(goHomeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
