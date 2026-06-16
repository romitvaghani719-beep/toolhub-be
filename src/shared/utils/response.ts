import type { ApiError, ApiSuccess } from "../../types/index.js";

export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function error(message: string): ApiError {
  return { success: false, message };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
