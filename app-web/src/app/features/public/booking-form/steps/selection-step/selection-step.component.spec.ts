import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionStepComponent } from './selection-step.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../../../../core/models/service.model';

describe('SelectionStepComponent', () => {
  let component: SelectionStepComponent;
  let fixture: ComponentFixture<SelectionStepComponent>;
  let fb: FormBuilder;

  const mockServices: Service[] = [
    { id: 'service-1', name: 'Corte de cabello', duration_minutes: 30, price: 25 } as Service,
    { id: 'service-2', name: 'Tinte', duration_minutes: 60, price: 50 } as Service,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionStepComponent, ReactiveFormsModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionStepComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    fixture.componentRef.setInput('selectionForm', fb.group({
      service_id: ['', Validators.required],
      appointment_date: ['', Validators.required],
      appointment_time: ['', Validators.required],
    }));
    fixture.componentRef.setInput('services', mockServices);
    fixture.componentRef.setInput('minDate', '2026-01-01');
  });

  describe('Renderizado', () => {
    it('debe mostrar el listado de servicios en el select', () => {
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('#service_id');
      const options = select.querySelectorAll('option');

      expect(options.length).toBe(3);
      expect(options[1].textContent).toContain('Corte de cabello');
      expect(options[2].textContent).toContain('Tinte');
    });

    it('debe mostrar los campos de fecha y hora', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#appointment_date')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#appointment_time')).toBeTruthy();
    });
  });

  describe('Validación', () => {
    it('no debe emitir proceed si el formulario es inválido', () => {
      const proceedSpy = jest.fn();
      component.proceed.subscribe(proceedSpy);

      component.onProceed();

      expect(proceedSpy).not.toHaveBeenCalled();
    });

    it('debe marcar los controles como tocados si el formulario es inválido', () => {
      component.onProceed();

      expect(component.selectionForm().get('service_id')?.touched).toBe(true);
      expect(component.selectionForm().get('appointment_date')?.touched).toBe(true);
      expect(component.selectionForm().get('appointment_time')?.touched).toBe(true);
    });

    it('debe emitir proceed si el formulario es válido', () => {
      const proceedSpy = jest.fn();
      component.proceed.subscribe(proceedSpy);

      component.selectionForm().patchValue({
        service_id: 'service-1',
        appointment_date: '2026-04-10',
        appointment_time: '10:00',
      });

      component.onProceed();

      expect(proceedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('canProceed computed', () => {
    it('debe ser false cuando el formulario es inválido', () => {
      expect(component.canProceed()).toBe(false);
    });

    it('debe ser true cuando el formulario es válido', () => {
      component.selectionForm().patchValue({
        service_id: 'service-1',
        appointment_date: '2026-04-10',
        appointment_time: '10:00',
      });

      expect(component.canProceed()).toBe(true);
    });
  });
});
