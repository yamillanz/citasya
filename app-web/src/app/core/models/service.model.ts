export interface Service {
  id: string;
  company_id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateServiceDto {
  company_id: string;
  name: string;
  duration_minutes: number;
  price?: number;
}
