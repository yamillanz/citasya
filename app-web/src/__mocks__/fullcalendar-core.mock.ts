export interface CalendarOptions {
  plugins?: any[];
  initialView?: string;
  headerToolbar?: any;
  slotMinTime?: string;
  slotMaxTime?: string;
  weekends?: boolean;
  selectable?: boolean;
  dayMaxEvents?: boolean;
  events?: any[];
  dateClick?: (arg: any) => void;
  eventClick?: (arg: any) => void;
}

export interface EventInput {
  id?: string;
  title?: string;
  start?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, any>;
}
