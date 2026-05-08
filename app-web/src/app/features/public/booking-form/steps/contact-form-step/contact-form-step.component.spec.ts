import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ContactFormStepComponent } from './contact-form-step.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { atLeastOneContactValidator } from '../../booking-form.component';

describe('ContactFormStepComponent', () => {
  let component: ContactFormStepComponent;
  let fixture: ComponentFixture<ContactFormStepComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormStepComponent, ReactiveFormsModule],
      providers: [FormBuilder, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormStepComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    fixture.componentRef.setInput('bookingForm', fb.group(
      {
        client_name: ['', [Validators.required, Validators.minLength(2)]],
        client_phone: [''],
        client_email: [''],
        notes: [''],
      },
      { validators: atLeastOneContactValidator() },
    ));
    fixture.componentRef.setInput('submitError', '');
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('notesLength', 0);
  });

  describe('Renderizado', () => {
    it('debe mostrar los campos del formulario', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#client_name')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#client_phone')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#client_email')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#notes')).toBeTruthy();
    });
  });

  describe('getError', () => {
    it('debe retornar mensaje de requerido cuando el campo es touched y required', () => {
      component.bookingForm().get('client_name')?.markAsTouched();
      fixture.detectChanges();

      expect(component.getError('client_name')).toBe('Este campo es requerido');
    });

    it('debe retornar string vacío cuando el campo es válido', () => {
      component.bookingForm().patchValue({ client_name: 'Juan', client_phone: '555123456789' });
      fixture.detectChanges();

      expect(component.getError('client_name')).toBe('');
    });
  });

  describe('hasContactError', () => {
    it('debe ser true cuando no hay teléfono ni email y ambos están tocados', () => {
      component.bookingForm().patchValue({ client_name: 'Juan', client_phone: '', client_email: '' });
      component.bookingForm().get('client_phone')?.markAsTouched();
      component.bookingForm().get('client_email')?.markAsTouched();
      component.bookingForm().updateValueAndValidity();
      fixture.detectChanges();

      expect(component.hasContactError()).toBe(true);
    });

    it('debe ser false cuando hay email', () => {
      component.bookingForm().patchValue({ client_name: 'Juan', client_email: 'test@test.com' });
      component.bookingForm().updateValueAndValidity();
      fixture.detectChanges();

      expect(component.hasContactError()).toBe(false);
    });
  });

  describe('hasInvalidPhoneError', () => {
    it('debe ser true cuando el teléfono tiene menos de 10 dígitos', () => {
      component.bookingForm().patchValue({ client_name: 'Juan', client_phone: '04143333' });
      component.bookingForm().updateValueAndValidity();
      fixture.detectChanges();

      expect(component.hasInvalidPhoneError()).toBe(true);
    });

    it('debe ser false cuando el teléfono es válido', () => {
      component.bookingForm().patchValue({ client_name: 'Juan', client_phone: '555123456789' });
      component.bookingForm().updateValueAndValidity();
      fixture.detectChanges();

      expect(component.hasInvalidPhoneError()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('no debe emitir submit si el formulario es inválido', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('no debe emitir submit si hay error de contacto', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);

      component.bookingForm().patchValue({ client_name: 'Juan', client_phone: '', client_email: '' });
      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('debe emitir submit si el formulario es válido', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);

      component.bookingForm().patchValue({
        client_name: 'Juan Pérez',
        client_phone: '555123456789',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    it('debe emitir submit con solo email (sin teléfono)', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);

      component.bookingForm().patchValue({
        client_name: 'María',
        client_email: 'maria@test.com',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    it('no debe emitir submit si loading es true', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);
      fixture.componentRef.setInput('loading', true);

      component.bookingForm().patchValue({
        client_name: 'Juan Pérez',
        client_phone: '555123456789',
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('no debe emitir submit dos veces si onSubmit se llama rápidamente', () => {
      const submitSpy = jest.fn();
      component.submit.subscribe(submitSpy);

      component.bookingForm().patchValue({
        client_name: 'Juan Pérez',
        client_phone: '555123456789',
      });

      component.onSubmit();
      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('goBack', () => {
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
