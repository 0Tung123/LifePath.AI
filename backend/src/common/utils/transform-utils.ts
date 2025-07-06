/**
 * Utility functions for transforming data between frontend and backend
 */
import { isDate, isObject, isArray, isISODateString } from './type-guards';

/**
 * Convert all Date objects in an object to ISO strings
 * This is useful when sending data to the frontend
 */
export function convertDatesToISOStrings<T>(data: T): any {
  if (isDate(data)) {
    return data.toISOString();
  }

  if (isArray(data)) {
    return data.map((item) => convertDatesToISOStrings(item));
  }

  if (isObject(data)) {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertDatesToISOStrings((data as any)[key]);
      }
    }
    return result;
  }

  return data;
}

/**
 * Convert all ISO date strings in an object to Date objects
 * This is useful when receiving data from the frontend
 */
export function convertISOStringsToDates<T>(data: T): any {
  if (isISODateString(data)) {
    return new Date(data);
  }

  if (isArray(data)) {
    return data.map((item) => convertISOStringsToDates(item));
  }

  if (isObject(data)) {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertISOStringsToDates((data as any)[key]);
      }
    }
    return result;
  }

  return data;
}

/**
 * Transform an entity to a DTO by converting dates and applying transformations
 */
export function transformEntityToDto<T, U>(
  entity: T,
  transformations: Partial<Record<keyof T, (value: any) => any>> = {},
): U {
  if (!isObject(entity)) {
    throw new Error('Entity must be an object');
  }

  const result: Record<string, any> = {};

  for (const key in entity) {
    if (Object.prototype.hasOwnProperty.call(entity, key)) {
      const value = (entity as any)[key];

      if (transformations[key as keyof T]) {
        result[key] = transformations[key as keyof T]!(value);
      } else {
        result[key] = convertDatesToISOStrings(value);
      }
    }
  }

  return result as unknown as U;
}
