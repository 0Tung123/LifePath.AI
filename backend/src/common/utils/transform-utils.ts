/**
 * Utility functions for transforming data between frontend and backend
 */
import { isDate, isObject, isArray, isISODateString } from './type-guards';

// Types removed as they were unused

/**
 * Type for transformation functions
 */
type TransformFunction<T, U> = (value: T) => U;

/**
 * Convert all Date objects in an object to ISO strings
 * This is useful when sending data to the frontend
 */
export function convertDatesToISOStrings<T>(
  data: T,
): T extends Date
  ? string
  : T extends (infer U)[]
    ? ReturnType<typeof convertDatesToISOStrings<U>>[]
    : T extends object
      ? { [K in keyof T]: ReturnType<typeof convertDatesToISOStrings<T[K]>> }
      : T {
  if (isDate(data)) {
    return data.toISOString() as any;
  }

  if (isArray(data)) {
    return data.map((item) => convertDatesToISOStrings(item)) as any;
  }

  if (isObject(data)) {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertDatesToISOStrings(
          (data as Record<string, unknown>)[key],
        );
      }
    }
    return result as any;
  }

  return data as any;
}

/**
 * Convert all ISO date strings in an object to Date objects
 * This is useful when receiving data from the frontend
 */
export function convertISOStringsToDates<T>(
  data: T,
): T extends string
  ? Date
  : T extends (infer U)[]
    ? ReturnType<typeof convertISOStringsToDates<U>>[]
    : T extends object
      ? { [K in keyof T]: ReturnType<typeof convertISOStringsToDates<T[K]>> }
      : T {
  if (isISODateString(data)) {
    return new Date(data as string) as any;
  }

  if (isArray(data)) {
    return data.map((item) => convertISOStringsToDates(item)) as any;
  }

  if (isObject(data)) {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertISOStringsToDates(
          (data as Record<string, unknown>)[key],
        );
      }
    }
    return result as any;
  }

  return data as any;
}

/**
 * Transform an entity to a DTO by converting dates and applying transformations
 */
export function transformEntityToDto<T extends Record<string, unknown>, U>(
  entity: T,
  transformations: Partial<
    Record<keyof T, TransformFunction<unknown, unknown>>
  > = {},
): U {
  if (!isObject(entity)) {
    throw new Error('Entity must be an object');
  }

  const result: Record<string, unknown> = {};

  for (const key in entity) {
    if (Object.prototype.hasOwnProperty.call(entity, key)) {
      const value = entity[key];

      if (transformations[key as keyof T]) {
        result[key] = transformations[key as keyof T]!(value);
      } else {
        result[key] = convertDatesToISOStrings(value);
      }
    }
  }

  return result as unknown as U;
}
