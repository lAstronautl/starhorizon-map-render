import { EntityColorFn, MapGrid, TileColorFn } from './types.js';

const BytesPerColor = 4;

export function renderToByteArray(
  grid: MapGrid,
  tileColor: TileColorFn,
  entityColor: EntityColorFn
): Uint8ClampedArray<ArrayBuffer> {
  const buf = new ArrayBuffer(grid.width * grid.height * BytesPerColor);
  const values = new Uint8ClampedArray(buf);
  renderInto(grid, values, tileColor, entityColor);
  return values;
}

function renderInto(
  grid: MapGrid,
  values: Uint8ClampedArray<ArrayBuffer>,
  tileColor: TileColorFn,
  entityColor: EntityColorFn
): void {
  for (let i = 0; i < grid.tiles.length; i++) {
    const tile = grid.tiles[i];
    if (!tile) {
      continue;
    }

    const entities = grid.entities[i];
    const color = (entities && entityColor(entities)) ?? tileColor(tile);

    const pixelIndex = i * BytesPerColor;
    values[pixelIndex + 0] = color[0];
    values[pixelIndex + 1] = color[1];
    values[pixelIndex + 2] = color[2];
    values[pixelIndex + 3] = color[3];
  }
}
