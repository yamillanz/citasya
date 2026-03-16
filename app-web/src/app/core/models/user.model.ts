export type UserRole = 'superadmin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  photo_url?: string;
  role: UserRole;
  company_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  company_id?: string;
}
