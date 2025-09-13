export type UserRole = 'patient' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
