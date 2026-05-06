import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LandingHeaderComponent } from '../../../shared/components/landing-header/landing-header.component';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastModule, LandingHeaderComponent],
  providers: [MessageService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private messageService = inject(MessageService);

  private formLoadTime = Date.now();

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required],
    website: ['']
  });

  loading = signal(false);
  success = signal(false);

  async onSubmit() {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.contactForm.value.website) return;

    const elapsed = (Date.now() - this.formLoadTime) / 1000;
    if (elapsed < 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Espera',
        detail: 'Por favor espera unos segundos antes de enviar.',
      });
      return;
    }

    this.loading.set(true);

    try {
      await this.contactService.sendMessage({
        name: this.contactForm.value.name!,
        email: this.contactForm.value.email!,
        phone: this.contactForm.value.phone || undefined,
        message: this.contactForm.value.message!,
      });

      this.success.set(true);
      this.contactForm.reset();
      this.messageService.add({
        severity: 'success',
        summary: '¡Mensaje enviado!',
        detail: 'Te responderemos pronto.',
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo enviar el mensaje.',
      });
    } finally {
      this.loading.set(false);
    }
  }
}
