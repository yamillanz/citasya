export interface Plan {
  id: string;
  name: string;
  price: number;
  max_users: number;
  max_companies: number;
  is_active: boolean;
  created_at: string;
}

export interface CreatePlanDto {
  name: string;
  price: number;
  max_users: number;
  max_companies: number;
}
