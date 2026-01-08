import { toByteArray } from 'base64-js';
import { parse } from 'yaml';
import { ChunkSize, SpaceTileId } from './constants.js';
import { describeValue, isPlainObject, PlainObject } from './parse-utils.js';
import { MapGrid } from './types.js';

export default function parseMapFile(source: string): MapGrid[] {
  const root: unknown = parse(source, {
    logLevel: 'silent',
  });

  if (!isPlainObject(root)) {
    throw new Error(
      `expected document to be an object, got ${describeValue(root)}`
    );
  }

  const { meta, tilemap, entities } = root;

  if (!isPlainObject(meta)) {
    throw new Error(
      `expected \`meta\` to contain an object, got ${describeValue(meta)}`
    );
  }
  parseFormatVersion(meta);

  if (!isPlainObject(tilemap)) {
    throw new Error(
      `expected \`tilemap\` to contain an object, got ${describeValue(tilemap)}`
    );
  }
  const tileMap = parseTileMap(tilemap);

  if (!Array.isArray(entities)) {
    throw new Error(
      `expected \`entities\` to contain an array, got ${describeValue(entities)}`
    );
  }

  const grids = findAllGrids(entities);
  if (grids.size === 0) {
    return [];
  }

  for (const grid of grids.values()) {
    buildTileGrid(grid, tileMap);
  }

  placeEntities(entities, grids);

  return Array.from(grids.values(), finalizeGrid);
}

interface PartialGrid {
  readonly uid: number;
  readonly components: Component[];
  name: string | null;
  offset: [number, number];
  width: number;
  height: number;
  tiles: Map<PointKey, string>;
  entities: Map<PointKey, Set<string>>;
}

type PointKey = `${number},${number}`;

function pointKey(x: number, y: number): PointKey {
  return `${x},${y}`;
}

function parsePoint(pt: string, uid: number): [number, number] {
  const coords = pt.split(',');
  if (coords.length !== 2) {
    throw new Error(`expected exactly 2 coordinates, got '${pt}'`);
  }

  const [x, y] = coords.map(c => parseFloat(c));
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`invalid point: ${pt}`);
  }
  return [x, y];
}

function findAllGrids(
  entitiesByPrototype: unknown[]
): Map<number, PartialGrid> {
  const result = new Map<number, PartialGrid>();

  for (const { uid, components } of allEntities(entitiesByPrototype)) {
    let isGrid = false;
    let name: string | undefined;
    for (const comp of components) {
      switch (comp.type) {
        case 'MapGrid':
          isGrid = true;
          break;
        case 'MetaData':
          name = comp.name;
          break;
      }
    }

    if (isGrid) {
      result.set(uid, {
        uid,
        components,
        name: name ?? null,
        offset: [0, 0],
        width: -1,
        height: -1,
        tiles: new Map(),
        entities: new Map(),
      });
    }
  }

  return result;
}

function buildTileGrid(
  grid: PartialGrid,
  tileMap: Map<number, string>
): void {
  const mapGridComp = grid.components.find(c => c.type === 'MapGrid');
  if (!mapGridComp) {
    throw new Error(`grid ${grid.uid} has no MapGrid`);
  }

  if (!mapGridComp.chunks) {
    grid.width = 0;
    grid.height = 0;
    return;
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const chunk of Object.values(mapGridComp.chunks)) {
    const [chunkX, chunkY] = parsePoint(chunk.ind, grid.uid);
    const tileDataBytes = toByteArray(chunk.tiles);
    const tileData = new DataView(tileDataBytes.buffer);
    const version = chunk.version;

    let b = 0;
    for (let y = 0; y < ChunkSize; y++) {
      for (let x = 0; x < ChunkSize; x++) {
        let tileIndex: number;
        if (version >= 6) {
          tileIndex = tileData.getInt32(b, true);
          b += 4;
        } else {
          tileIndex = tileData.getUint16(b, true);
          b += 2;
        }

        b += 2; // flags, variant
        if (version >= 7) {
          b += 1; // rotationMirroring
        }

        const tile = tileMap.get(tileIndex)!;
        if (tile !== SpaceTileId) {
          const gridX = x + chunkX * ChunkSize;
          const gridY = y + chunkY * ChunkSize;
          grid.tiles.set(pointKey(gridX, gridY), tile);

          xMin = Math.min(gridX, xMin);
          xMax = Math.max(gridX, xMax);
          yMin = Math.min(gridY, yMin);
          yMax = Math.max(gridY, yMax);
        }
      }
    }
  }

  grid.offset = [-xMin, -yMin];
  grid.width = xMax - xMin + 1;
  grid.height = yMax - yMin + 1;
}

function placeEntities(
  entitiesByPrototype: unknown[],
  grids: Map<number, PartialGrid>
): void {
  for (const { uid, proto, components } of allEntities(entitiesByPrototype)) {
    const transform = components.find(c => c.type === 'Transform');
    if (!transform) {
      // Can't do anything with this
      continue;
    }

    const parentGrid = grids.get(transform.parent ?? -1);
    if (!parentGrid) {
      // It might be orphaned, or it might be contained inside an entity that
      // isn't a grid.
      continue;
    }

    const [x, y] = transform.pos ? parsePoint(transform.pos, uid) : [0, 0];
    const point = pointKey(Math.floor(x), Math.floor(y));

    let entities = parentGrid.entities.get(point);
    if (!entities) {
      parentGrid.entities.set(point, entities = new Set());
    }
    entities.add(proto);
  }
}

function finalizeGrid(grid: PartialGrid): MapGrid {
  const offsetX = grid.offset[0];
  // In the game, Y coordinates grow *up*, while in most image data formats
  // Y coordinates grow *down*. We translate the former to the latter here.
  const offsetY = grid.height - grid.offset[1] - 1;

  const tiles: (string | undefined)[] = [];
  const entities: (string[] | undefined)[] = [];

  for (const [pos, tile] of grid.tiles) {
    const [x, y] = parsePoint(pos, grid.uid);

    const finalX = x + offsetX;
    const finalY = offsetY - y;

    const index = finalX + finalY * grid.width;
    tiles[index] = tile;

    const tileEntities = grid.entities.get(pos);
    if (tileEntities) {
      entities[index] = Array.from(tileEntities);
    }
  }

  return {
    uid: grid.uid,
    name: grid.name,
    width: grid.width,
    height: grid.height,
    tiles,
    entities,
  };
}

interface EntityInfo {
  readonly proto: string;
  readonly uid: number;
  readonly components: Component[];
}

type Component =
  | MapGridComponent
  | MetaDataComponent
  | TransformComponent
  ;

interface MapGridComponent {
  readonly type: 'MapGrid';
  readonly chunks?: GridChunkMap;
}

interface GridChunkMap {
  readonly [ind: string]: GridChunk;
}

interface GridChunk {
  readonly ind: string;
  readonly tiles: string;
  readonly version: number;
}

interface MetaDataComponent {
  readonly type: 'MetaData';
  readonly name?: string;
}

interface TransformComponent {
  readonly type: 'Transform';
  readonly pos?: string;
  readonly parent?: number;
}

function* allEntities(entitiesByPrototype: unknown[]): Generator<EntityInfo> {
  for (const def of entitiesByPrototype) {
    if (!isPlainObject(def)) {
      throw new Error(`expected a plain object, got ${describeValue(def)}`);
    }

    if (typeof def.proto !== 'string') {
      throw new Error(
        `expected \`proto\` to be a string, got ${describeValue(def.proto)}`
      );
    }
    if (!Array.isArray(def.entities)) {
      throw new Error(
        `expected \`entities\` to be an array, got ${describeValue(def.entities)}`
      );
    }

    const proto = def.proto as string;
    for (const ent of def.entities as unknown[]) {
      if (!isPlainObject(ent)) {
        throw new Error(
          `expected entity to be a plain object, got ${describeValue(ent)}`
        );
      }

      if (typeof ent.uid !== 'number') {
        throw new Error(
          `expected \`uid\` to be a number, got ${describeValue(ent.uid)}`
        );
      }
      if (ent.components != null && !Array.isArray(ent.components)) {
        throw new Error(
          `expected \`components\` to be an array, got ${
            describeValue(ent.components)
          }`
        );
      }

      const uid = ent.uid;
      const components = ent.components ?? [];

      yield { proto, uid, components };
    }
  }
}

type SupportedFormatVersion = 6 | 7;

function parseFormatVersion(meta: PlainObject): SupportedFormatVersion {
  switch (meta.format) {
    case 6:
    case 7:
      return meta.format;
    default:
      throw new Error(`unsupported file format: ${meta.format}`);
  }
}

function parseTileMap(value: PlainObject): Map<number, string> {
  if (!value || !isPlainObject(value)) {
    throw new Error(
      `expected \`tilemap\` key to contain an object, got ${
        describeValue(value)
      }`
    );
  }
  return new Map<number, string>(
    Object.entries(value).map(([key, value]) =>
      [+key, String(value)]
    )
  );
}
