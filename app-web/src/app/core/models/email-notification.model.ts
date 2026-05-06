export type EmailEventType = 'created' | 'cancelled' | 'no_show';

export interface EmailNotificationPayload {
  appointment_id: string;
  event_type: EmailEventType;
}
