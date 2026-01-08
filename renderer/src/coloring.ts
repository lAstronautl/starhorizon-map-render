import {
  IdMatcher,
  ObjectColorConfig,
  RendererConfig,
} from './config.js';
import { Black } from './constants.js';
import { Color, EntityColorFn, TileColorFn } from './types.js';

export default function buildColorFns(
  config: RendererConfig
): [TileColorFn, EntityColorFn] {
  return [
    buildTileColorFn(config.tiles),
    buildEntityColorFn(config.entities),
  ];
}

export function buildTileColorFn(
  config: readonly ObjectColorConfig[]
): TileColorFn {
  const selectors = config.map(buildColorSelector);
  return id => selectors.findLast(p => p.applies(id))?.color ?? Black;
}

export function buildEntityColorFn(
  config: readonly ObjectColorConfig[]
): EntityColorFn {
  const selectors = config.map(buildColorSelector);
  return id => selectors.findLast(p => id.some(p.applies))?.color ?? null;
}

interface ColorSelector {
  color: Color;
  applies: (id: string) => boolean;
}

function buildColorSelector(
  colorConfig: ObjectColorConfig
): ColorSelector {
  const whitelistMatches = colorConfig.match
    ? buildPredicate(colorConfig.match)
    : () => true;
  const blacklistMatches = colorConfig.exclude
    ? buildPredicate(colorConfig.exclude)
    : () => false;
  return {
    color: colorConfig.color,
    applies: id => whitelistMatches(id) && !blacklistMatches(id),
  };
}

function buildPredicate(match: IdMatcher): (id: string) => boolean {
  // whatever
  if (typeof match === 'string') {
    match = [match];
  }

  const predicates = match.map(m => {
    if (m.includes('*')) {
      const pattern = new RegExp(
        m.replace(/(\*)|([\\.+?^$|()\[\]{}])/g, (_, star, meta) => {
          if (star) {
            return WildcardPattern;
          } else {
            return `\\${meta}`;
          }
        })
      );
      return (id: string) => pattern.test(id);
    }
    return (id: string) => id === m;
  });
  switch (predicates.length) {
    case 0:
      return () => false;
    case 1:
      return predicates[0];
    default:
      return id => predicates.some(p => p(id));
  }
}

const WildcardPattern = '(?:[A-Z][a-z0-9]*)*';
