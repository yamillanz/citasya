import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    CardModule, 
    InputTextModule,
    Textarea,
    DividerModule,
    ToastModule,
    AvatarModule,
    PanelModule
  ],
  providers: [MessageService],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required]
  });

  loading = false;

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.loading = true;

    try {
      // Aquí iría la lógica para enviar el mensaje a Supabase
      // await this.contactService.sendMessage(this.contactForm.value);
      
      // Simulación de éxito
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Mensaje enviado!',
          detail: 'Te contactaremos en menos de 24 horas'
        });
        this.contactForm.reset();
        this.loading = false;
      }, 1000);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el mensaje. Intenta de nuevo.'
      });
      this.loading = false;
    }
  }
}
