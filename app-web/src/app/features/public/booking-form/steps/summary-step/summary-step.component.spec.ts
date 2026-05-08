import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryStepComponent } from './summary-step.component';
import { Service } from '../../../../../../core/models/service.model';
import { User } from '../../../../../../core/models/user.model';
import { Company } from '../../../../../../core/models/company.model';

describe('SummaryStepComponent', () => {
  let component: SummaryStepComponent;
  let fixture: ComponentFixture<SummaryStepComponent>;

  const mockServices: Service[] = [
    { id: 'service-1', name: 'Corte de cabello', duration_minutes: 30, price: 25 } as Service,
  ];

  const mockEmployee: User = { id: 'employee-1', full_name: 'Juan Pérez' } as User;

  const mockCompany: Company = { id: 'company-1', name: 'Peluquería Juan', slug: 'peluqueria-juan', address: 'Calle 123' } as Company;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryStepComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedServices', mockServices);
    fixture.componentRef.setInput('employee', mockEmployee);
    fixture.componentRef.setInput('company', mockCompany);
    fixture.componentRef.setInput('selectedDate', '2026-04-10');
    fixture.componentRef.setInput('selectedTime', '10:00');
    fixture.componentRef.setInput('totalDuration', 30);
    fixture.componentRef.setInput('totalPrice', 25);
    fixture.componentRef.setInput('isOpenMode', true);
  });

  describe('Renderizado', () => {
    it('debe mostrar los servicios seleccionados', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Corte de cabello');
      expect(fixture.nativeElement.textContent).toContain('30 min');
    });

    it('debe mostrar el nombre del profesional', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Juan Pérez');
    });

    it('debe mostrar la fecha formateada y la hora', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('10:00');
    });

    it('debe mostrar el nombre del negocio', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Peluquería Juan');
    });

    it('debe mostrar la duración total', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('30 min');
    });

    it('debe mostrar el precio total cuando es mayor a 0', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('$25.00');
    });

    it('debe mostrar el botón de volver cuando isOpenMode es true', () => {
      fixture.detectChanges();
      const backBtn = fixture.nativeElement.querySelector('.btn-secondary');
      expect(backBtn).toBeTruthy();
    });

    it('no debe mostrar el botón de volver cuando isOpenMode es false', () => {
      fixture.componentRef.setInput('isOpenMode', false);
      fixture.detectChanges();
      const backBtn = fixture.nativeElement.querySelector('.btn-secondary');
      expect(backBtn).toBeFalsy();
    });
  });

  describe('Eventos', () => {
    it('debe emitir continue al hacer clic en el botón continuar', () => {
      const continueSpy = jest.fn();
      component.continue.subscribe(continueSpy);
      fixture.detectChanges();

      const continueBtn = fixture.nativeElement.querySelector('.btn-primary');
      continueBtn.click();

      expect(continueSpy).toHaveBeenCalledTimes(1);
    });

    it('debe emitir goBack al hacer clic en el botón volver', () => {
      const goBackSpy = jest.fn();
      component.goBack.subscribe(goBackSpy);
      fixture.detectChanges();

      const backBtn = fixture.nativeElement.querySelector('.btn-secondary');
      backBtn.click();

      expect(goBackSpy).toHaveBeenCalledTimes(1);
    });
  });
});
