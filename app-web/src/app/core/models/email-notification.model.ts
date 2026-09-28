export type EmailEventType = 'created' | 'cancelled' | 'no_show' | 'rescheduled';

export interface EmailNotificationPayload {
  appointment_id: string;
  event_type: EmailEventType;
}
