/**
 * Type guard utilities for runtime type checking
 */

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;

  try {
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.includes('T');
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value has a specific property
 */
export function hasProperty<K extends string>(
  value: unknown,
  property: K,
): value is { [P in K]: unknown } {
  return isObject(value) && property in value;
}

/**
 * Type guard to check if a value has all required properties
 */
export function hasRequiredProperties<K extends string>(
  value: unknown,
  properties: K[],
): value is { [P in K]: unknown } {
  if (!isObject(value)) return false;
  return properties.every((prop) => prop in value);
}

/**
 * Type guard to check if a value matches a specific enum
 */
export function isEnum<T extends Record<string, string | number>>(
  value: unknown,
  enumObject: T,
): value is T[keyof T] {
  return (
    (isString(value) || isNumber(value)) &&
    Object.values(enumObject).includes(value)
  );
}
