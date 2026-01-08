export interface PlainObject {
  [key: string]: unknown;
}

export function isPlainObject(value: unknown): value is PlainObject {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function describeValue(value: unknown): string {
  switch (typeof value) {
    case 'string': {
      const displayValue = value.length > 8
        ? `${value.slice(0, 8)}...`
        : value;
      return `string \`${displayValue}\``;
    }
    case 'number':
    case 'bigint':
      return `number ${value}`;
    case 'boolean':
      return `boolean ${value}`;
    case 'symbol':
      return 'symbol';
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return 'array';
      }
      return 'object';
    case 'function':
      return 'function';
  }
}
