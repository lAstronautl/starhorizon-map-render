import arg from 'arg';
import { Jimp, JimpInstance } from 'jimp';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  buildColorFns,
  DefaultConfig,
  GuidebookImageHeight,
  GuidebookImageWidth,
  parseConfig,
  parseMapFile,
  RendererConfig,
  renderToByteArray,
} from './index.js';

async function main(): Promise<void> {
  const args = arg({
    '--config': String,
    '-c': '--config',

    '--input': String,
    '-i': '--input',

    '--output': String,
    '-o': '--output',
  });

  const configFile = args['--config'];
  const inputFile = args['--input'] ?? args._[0];
  const outputFile = args['--output'] ?? args._[1] ?? 'map.png';

  if (!inputFile) {
    console.error('error: missing input file');
    process.exit(1);
  }
  if (!outputFile) {
    console.error('error: missing output file');
    process.exit(1);
  }

  const configText = configFile
    ? readFileSync(configFile, { encoding: 'utf-8' })
    : DefaultConfig;

  let config: RendererConfig;
  try {
    config = parseConfig(configText);
  } catch (e) {
    console.error('error: could not parse config:', e);
    process.exit(2);
  }

  const inputFileSource = readFileSync(inputFile, { encoding: 'utf-8' });
  const mapGrids = parseMapFile(inputFileSource);
  if (mapGrids.length === 0) {
    console.error('error: ship file contains no grids');
    process.exit(3);
  }

  const [tileColor, entityColor] = buildColorFns(config);
  if (mapGrids.length > 1) {
    console.warn(
      `warning: ship file has ${mapGrids.length} grids; rendering to multiple files`
    );
  }

  for (const grid of mapGrids) {
    const bytes = renderToByteArray(grid, tileColor, entityColor);
    const jimp: JimpInstance = new Jimp({
      width: grid.width,
      height: grid.height,
      data: Buffer.from(bytes),
    });

    const targetFile = mapGrids.length > 1
      ? outputFile.replace(/(\.[a-z0-9]+)?$/, ext => `-grid(${grid.uid})${ext ?? ''}`)
      : outputFile;
    const buffer = await jimp.getBuffer('image/png');
    writeFileSync(targetFile, buffer);
    console.log(`info: saved render to ${targetFile}`);

    const maxScaleNormal = Math.min(
      Math.floor(GuidebookImageWidth / grid.width),
      Math.floor(GuidebookImageHeight / grid.height)
    );
    const maxScaleRotated = Math.min(
      Math.floor(GuidebookImageHeight / grid.width),
      Math.floor(GuidebookImageWidth / grid.height)
    );
    console.log(`info: max scale for guidebook: normal = ${maxScaleNormal}, rotated 90° = ${maxScaleRotated}`);
  }
}
main().catch(e => {
  console.error('uncaught error:', e);
  process.exit(127);
});
