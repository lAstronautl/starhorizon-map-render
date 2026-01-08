import { parse } from 'yaml';
import { describeValue, isPlainObject } from './parse-utils.js';
import { Color } from './types.js';

export interface RendererConfig {
  readonly tiles: readonly ObjectColorConfig[];
  readonly entities: readonly ObjectColorConfig[];
}

export interface ObjectColorConfig {
  readonly color: Color;
  readonly match: IdMatcher | null;
  readonly exclude: IdMatcher | null;
}

/**
 * A string or array of strings that are tested against the ID of an entity or
 * tile. The string can contain characters to match against literally, such as
 * `Lattice` or `Thruster`.
 *
 * The character `*` is allowed as a kind of wildcard. It is transformed to the
 * regular expression `(?:[A-Z][a-z0-9]*)*`. That is, it matches a sequence of
 * whole words, defined as an uppercase letter followed zero or more lowercase
 * letters or digits.
 *
 * For example, the string `Wall*` will match `Wall`, `WallAsteroid` and
 * `WallSuperCool`, but not `Wallet`. This behavior is intended as a good-enough
 * "do what I mean" solution.
 *
 * Note that `*` will *never* match part of an ID that is all lowercase.
 */
export type IdMatcher = string | readonly string[];

export function parseConfig(text: string): RendererConfig {
  const root = parse(text, {
    logLevel: 'silent',
  });

  const tiles = parseArrayOfObjectColorConfig(root.tiles, 'tiles');
  const entities = parseArrayOfObjectColorConfig(root.entities, 'entities');
  return { tiles, entities };
}

function parseArrayOfObjectColorConfig(
  value: unknown,
  path: string
): ObjectColorConfig[] {
  if (!Array.isArray(value)) {
    throw new Error(`at \`${path}\`: expected an array, got ${describeValue(value)}`);
  }
  return value.map((x, i) => parseObjectColorConfig(x, `${path}[${i}]`));
}

function parseObjectColorConfig(
  value: unknown,
  path: string
): ObjectColorConfig {
  if (!isPlainObject(value)) {
    throw new Error(`at \`${path}\`: expected an object, got ${describeValue(value)}`);
  }

  const color = parseColor(value.color, `${path}.color`);
  const match = parseOptionalIdMatcher(value.match, `${path}.match`);
  const exclude = parseOptionalIdMatcher(value.exclude, `${path}.exclude`);

  return { color, match, exclude };
}

const ColorPattern = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function parseColor(value: unknown, path: string): Color {
  if (typeof value !== 'string') {
    throw new Error(`at \`${path}\`: expected string, got ${describeValue(value)}`);
  }

  const m = ColorPattern.exec(value);
  if (!m) {
    throw new Error(`at \`${path}\`: invalid color value: ${value}`);
  }

  let r = 0, g = 0, b = 0, a = 255;

  const rgba = m[1];
  switch (rgba.length) {
    case 3:
      r = parseInt(rgba[0] + rgba[0], 16);
      g = parseInt(rgba[1] + rgba[1], 16);
      b = parseInt(rgba[2] + rgba[2], 16);
      break;
    case 4:
      r = parseInt(rgba[0] + rgba[0], 16);
      g = parseInt(rgba[1] + rgba[1], 16);
      b = parseInt(rgba[2] + rgba[2], 16);
      a = parseInt(rgba[3] + rgba[3], 16);
      break;
    case 6:
      r = parseInt(rgba.slice(0, 2), 16);
      g = parseInt(rgba.slice(2, 4), 16);
      b = parseInt(rgba.slice(4, 6), 16);
      break;
    case 8:
      r = parseInt(rgba.slice(0, 2), 16);
      g = parseInt(rgba.slice(2, 4), 16);
      b = parseInt(rgba.slice(4, 6), 16);
      a = parseInt(rgba.slice(6, 8), 16);
      break;
  }

  return [r, g, b, a];
}

function parseOptionalIdMatcher(value: unknown, path: string): IdMatcher | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    value = [value];
  } else if (!Array.isArray(value)) {
    throw new Error(
      `at \`${path}\`: expected a string or array of strings, got ${
        describeValue(value)
      }`
    );
  }
  return (value as unknown[]).map(x => String(x));
}
