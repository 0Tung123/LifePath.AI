/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  search?: string;
}
