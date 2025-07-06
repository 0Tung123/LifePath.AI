/**
 * Utility functions for validation and sanitization
 */
import { isObject, isString, isNumber, isArray } from './type-guards';

/**
 * Sanitize a string by removing HTML tags and trimming
 */
export function sanitizeString(value: string): string {
  if (!isString(value)) return '';

  // Remove HTML tags
  const withoutTags = value.replace(/<[^>]*>/g, '');

  // Trim whitespace
  return withoutTags.trim();
}

/**
 * Sanitize an object by applying sanitization to all string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!isObject(obj)) return obj;

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (isString(value)) {
        result[key] = sanitizeString(value);
      } else if (isObject(value)) {
        result[key] = sanitizeObject(value);
      } else if (isArray(value)) {
        result[key] = value.map((item) =>
          isObject(item)
            ? sanitizeObject(item)
            : isString(item)
              ? sanitizeString(item)
              : item,
        );
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Validate that a value is within a specified range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
): boolean {
  if (!isNumber(value)) return false;
  return value >= min && value <= max;
}

/**
 * Ensure a value is within a specified range, clamping if necessary
 */
export function clampValue(value: number, min: number, max: number): number {
  if (!isNumber(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Validate that a string matches a regex pattern
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  if (!isString(value)) return false;
  return pattern.test(value);
}

/**
 * Validate that an object has all required properties
 */
export function validateRequiredProperties<T extends Record<string, any>>(
  obj: T,
  requiredProps: (keyof T)[],
): boolean {
  if (!isObject(obj)) return false;

  return requiredProps.every(
    (prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      obj[prop] !== undefined &&
      obj[prop] !== null,
  );
}
