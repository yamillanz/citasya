export interface Company {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  plan_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyDto {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  plan_id?: string;
}
