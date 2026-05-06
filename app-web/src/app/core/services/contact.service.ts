import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase: SupabaseClient = supabase;

  async sendMessage(data: ContactMessageData): Promise<void> {
    const { error: insertError } = await this.supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        status: 'new',
      });

    if (insertError) {
      throw new Error(insertError.message || 'No se pudo enviar el mensaje');
    }

    const { error: fnError } = await this.supabase.functions.invoke(
      'send-contact-email',
      { body: data }
    );

    if (fnError) {
      console.error('Error al enviar email de contacto:', fnError);
    }
  }
}
