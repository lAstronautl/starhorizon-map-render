export interface MapGrid {
  readonly uid: number;
  readonly name: string | null;
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (string | undefined)[];
  readonly entities: readonly (readonly string[] | undefined)[];
}

export type Color = [r: number, g: number, b: number, a: number];

export type TileColorFn = (tile: string) => Color;

export type EntityColorFn = (proto: readonly string[]) => Color | null;
