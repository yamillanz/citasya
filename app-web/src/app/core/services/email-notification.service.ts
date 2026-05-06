import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { EmailEventType } from '../models/email-notification.model';

@Injectable({ providedIn: 'root' })
export class EmailNotificationService {
  private supabase: SupabaseClient = supabase;

  async notify(appointmentId: string, eventType: EmailEventType): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-appointment-email', {
        body: { appointment_id: appointmentId, event_type: eventType },
      });

      if (error) {
        console.error('EmailNotificationService error:', error);
      }
    } catch (err) {
      console.error('EmailNotificationService invoke failed:', err);
    }
  }
}
