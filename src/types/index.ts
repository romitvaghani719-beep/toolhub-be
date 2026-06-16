import type { Role } from "@toolhub/shared";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
