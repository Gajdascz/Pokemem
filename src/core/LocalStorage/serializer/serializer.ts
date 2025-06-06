/**
 * Checks if a value is an ISO 8601 date string.
 * Used to detect and revive Date objects during deserialization.
 */
const isIsoString = (value: unknown): value is string =>
  typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);

/**
 * Custom replacer for JSON.stringify.
 * Serializes Set and Map objects with type metadata so they can be revived.
 */
const replacer = (_: string, value: unknown): unknown => {
  if (value instanceof Set) {
    return { __type: 'Set', values: Array.from(value) };
  }
  if (value instanceof Map) {
    return { __type: 'Map', entries: Array.from(value.entries()) };
  }
  return value;
};

/** Types for objects with __type metadata used during serialization. */
type Replaced =
  | { __type: 'Set'; values: unknown[] }
  | { __type: 'Map'; entries: [unknown, unknown][] };

/**
 * Custom reviver for JSON.parse.
 * Restores Set, Map, and Date objects from their serialized representations.
 */
const reviver = (_: string, value?: Replaced): unknown => {
  if (
    value
    && typeof value === 'object'
    && '__type' in value
    && typeof (value as { __type: string }).__type === 'string'
  ) {
    const v = value;
    switch (v.__type) {
      case 'Set':
        return new Set(v.values);
      case 'Map':
        return new Map(v.entries);
    }
  }
  // Restore Date objects from ISO strings
  if (isIsoString(value)) return new Date(value);

  return value;
};

/**
 * Serializes data to a JSON string, preserving Set, Map, and Date types.
 * @param data - The data to serialize.
 * @returns The serialized JSON string.
 */
const serialize = (data: unknown): string => JSON.stringify(data, replacer);

/**
 * Deserializes a JSON string (or object) to its original form,
 * restoring Set, Map, and Date types.
 * @param data - The data to deserialize (string or object).
 * @returns The deserialized value, or null if input is falsy.
 */
const deserialize = <T>(data: unknown): T | null =>
  !data ? null : (
    (JSON.parse(
      typeof data === 'string' ? data : serialize(data),
      reviver
    ) as T | null)
  );

export { serialize, deserialize };
