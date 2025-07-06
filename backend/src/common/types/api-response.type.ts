/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | 'eq' // equals
  | 'neq' // not equals
  | 'gt' // greater than
  | 'gte' // greater than or equal
  | 'lt' // less than
  | 'lte' // less than or equal
  | 'in' // in array
  | 'nin' // not in array
  | 'contains' // contains string
  | 'ncontains' // not contains string
  | 'between'; // between two values

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: SortDirection;
}
