const isIsoString = (value: unknown): value is string =>
  typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);

const replacer = (_: string, value: unknown): unknown => {
  if (value instanceof Set) {
    return { __type: 'Set', values: Array.from(value) };
  }
  if (value instanceof Map) {
    return { __type: 'Map', entries: Array.from(value.entries()) };
  }
  return value;
};

type Replaced =
  | { __type: 'Set'; values: unknown[] }
  | { __type: 'Map'; entries: [unknown, unknown][] };

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
  if (isIsoString(value)) return new Date(value);

  return value;
};

const serialize = (data: unknown): string => JSON.stringify(data, replacer);
const deserialize = <T>(data: unknown): T | null =>
  !data ? null : (
    (JSON.parse(
      typeof data === 'string' ? data : serialize(data),
      reviver
    ) as T | null)
  );

export { serialize, deserialize };
