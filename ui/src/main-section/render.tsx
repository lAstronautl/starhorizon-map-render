import {
  GuidebookImageHeight,
  GuidebookImageWidth,
  renderToByteArray,
  type EntityColorFn,
  type MapGrid,
  type TileColorFn,
} from 'frontier-map-renderer-backend';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import {
  DownloadIcon,
  MinusIcon,
  PlusIcon,
  RotateLeftIcon,
  RotateRightIcon,
  ScaleIcon,
  WarningIcon,
  ZoomInIcon,
} from '../icons';

export interface RenderedGridProps {
  grid: MapGrid;
  parentFileName: string;
  isOnlyGrid: boolean;
  tileColorFn: TileColorFn;
  entityColorFn: EntityColorFn;
}

const MinZoom = 1;
const MaxZoom = 6;
const DefaultZoom = 2;

const MinScale = 1;
const MaxScale = 8;
const DefaultScale = 1;

export default function RenderedGrid({
  grid,
  parentFileName,
  isOnlyGrid,
  tileColorFn,
  entityColorFn,
}: RenderedGridProps) {
  // Zoom applied to the canvas itself, without changing the image data.
  const [zoom, setZoom] = useState(DefaultZoom);
  // Scaling applied to the image data when rendering to the canvas.
  const [scale, setScale] = useState(DefaultScale);
  const [rotation, setRotation] = useState<Angle>(0);

  const [canvasWidth, canvasHeight] = useMemo(() => {
    const rotator = Rotations[rotation];
    const [gridWidth, gridHeight] = rotator.newSize(
      grid.width * scale,
      grid.height * scale
    );
    return [
      Math.max(gridWidth, GuidebookImageWidth),
      Math.max(gridHeight, GuidebookImageHeight),
    ];
  }, [scale, rotation, grid]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return; // :(
    }

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const original = renderToByteArray(grid, tileColorFn, entityColorFn);
    const transformed = transformImage(
      grid.width,
      grid.height,
      original,
      scale,
      rotation
    );

    const x = Math.floor((canvasWidth - transformed.width) / 2);
    const y = Math.floor((canvasHeight - transformed.height) / 2);
    context.putImageData(transformed, x, y);
  }, [scale, rotation, grid, tileColorFn, entityColorFn]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL();
    // I hate this :(
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = getDownloadFileName(
      grid.uid,
      grid.name,
      parentFileName,
      isOnlyGrid
    );
    downloadLink.click();
  }, [grid, parentFileName, isOnlyGrid]);

  const guidebookX = zoom * ((canvasWidth - GuidebookImageWidth) / 2);
  const guidebookY = zoom * ((canvasHeight - GuidebookImageHeight) / 2);
  const isTooBigForGuidebook =
    canvasWidth > GuidebookImageWidth ||
    canvasHeight > GuidebookImageHeight;

  return (
    <section class='RenderedGrid'>
      <div class='RenderedGridHeader'>
        <span>Grid UID {grid.uid}: {grid.name ?? '(unnamed)'}</span>
        <span class='Spacer'/>
        <ZoomInIcon/>
        <span>Zoom:</span>
        <button
          title='Zoom out'
          disabled={zoom === MinZoom}
          onClick={() => setZoom(z => Math.max(MinZoom, z - 1))}
        >
          <MinusIcon/>
        </button>
        <span>
          {100 * zoom}%
        </span>
        <button
          title='Zoom in'
          disabled={zoom === MaxZoom}
          onClick={() => setZoom(z => Math.min(MaxZoom, z + 1))}
        >
          <PlusIcon/>
        </button>
        <span/>
        <button onClick={handleSave}>
          <DownloadIcon/>
          <span>Save image</span>
        </button>
      </div>
      <div class='RenderedGridToolbar'>
        <div class='RenderedGridTool'>
          <ScaleIcon/>
          <span>Scale:</span>
          <button
            title='Decrease scale'
            disabled={scale === MinScale}
            onClick={() => setScale(s => Math.max(MinScale, s - 1))}
          >
            <MinusIcon/>
          </button>
          <span>{scale}x</span>
          <button
            title='Increase scale'
            disabled={scale === MaxScale}
            onClick={() => setScale(s => Math.min(MaxScale, s + 1))}
          >
            <PlusIcon/>
          </button>
        </div>
        <div class='RenderedGridTool'>
          <span>Rotate:</span>
          <button
            title='Rotate left (counterclockwise)'
            onClick={() => setRotation(rotateLeft)}
          >
            <RotateLeftIcon/>
          </button>
          <span class='RotationAngle'>{90 * rotation}°</span>
          <button
            title='Rotate right (clockwise)'
            onClick={() => setRotation(rotateRight)}
          >
            <RotateRightIcon/>
          </button>
        </div>
      </div>
      <div class='RenderedGridContent'>
        <span
          class='RenderedGridGuidebookPage'
          style={{
            left: `${guidebookX}px`,
            top: `${guidebookY}px`,
            width: `${zoom * GuidebookImageWidth}px`,
            height: `${zoom * GuidebookImageHeight}px`,
          }}
        />
        <canvas
          class='RenderedGridImage'
          width={canvasWidth}
          height={canvasHeight}
          style={{
            width: `${zoom * canvasWidth}px`,
          }}
          ref={canvasRef}
        />
      </div>
      {isTooBigForGuidebook && (
        <div class='RenderedGridWarning'>
          <WarningIcon/>
          <span>Too big for guidebook image!</span>
        </div>
      )}
    </section>
  );
}

type Angle = 0 | 1 | 2 | 3;

function rotateRight(rotation: Angle): Angle {
  return ((rotation + 1) % 4) as Angle;
}

function rotateLeft(rotation: Angle): Angle {
  return ((3 + rotation) % 4) as Angle;
}

// Yes, you could also represent this as a transformation matrix.
interface Rotation {
  // These compute the *old* x and y coordinate, i.e. performs the *inverse*
  // rotation.
  readonly oldX: (x: number, y: number, w: number, h: number) => number;
  readonly oldY: (x: number, y: number, w: number, h: number) => number;
  readonly newSize: (w: number, h: number) => [number, number];
}

const Rotations: readonly Rotation[] = [
  // 0°
  {
    oldX: (x, _y) => x,
    oldY: (_x, y) => y,
    newSize: (w, h) => [w, h],
  },
  // 90° CW
  {
    oldX: (_x, y, _w, _h) => y,
    oldY: (x, _y, _w, h) => h - x - 1,
    newSize: (w, h) => [h, w],
  },
  // 180° CW
  {
    oldX: (x, _y, w, _h) => w - x - 1,
    oldY: (_x, y, _w, h) => h - y - 1,
    newSize: (w, h) => [w, h],
  },
  // 270° CW / 90° CCW
  {
    oldX: (_x, y, w, _h) => w - y - 1,
    oldY: (x, _y, _w, _h) => x,
    newSize: (w, h) => [h, w],
  },
];

function transformImage(
  originalWidth: number,
  originalHeight: number,
  original: Uint8ClampedArray<ArrayBuffer>,
  scale: number,
  rotation: Angle,
): ImageData {
  if (scale === 1 && rotation === 0) {
    // No transformation to do!
    return new ImageData(original, originalWidth, originalHeight);
  }

  const oldU32 = new Uint32Array(original.buffer);

  const rotator = Rotations[rotation % Rotations.length];
  const [newWidth, newHeight] = rotator.newSize(
    originalWidth * scale,
    originalHeight * scale
  );
  const newU32 = new Uint32Array(newWidth * newHeight);

  for (let y = 0; y < newHeight; y++) {
    const scaledY = (y / scale) | 0;
    for (let x = 0; x < newWidth; x++) {
      const scaledX = (x / scale) | 0;
      const oldX = rotator.oldX(
        scaledX,
        scaledY,
        originalWidth,
        originalHeight
      );
      const oldY = rotator.oldY(
        scaledX,
        scaledY,
        originalWidth,
        originalHeight
      );
      newU32[x + newWidth * y] = oldU32[oldX + originalWidth * oldY];
    }
  }

  return new ImageData(
    new Uint8ClampedArray(newU32.buffer),
    newWidth,
    newHeight
  );
}

function getDownloadFileName(
  gridUid: number,
  gridName: string | null,
  fileName: string,
  isOnlyGrid: boolean
): string {
  const baseName = getDownloadFileNameBase(
    gridUid,
    gridName,
    fileName,
    isOnlyGrid
  );
  return baseName.replace(/[^a-z0-9 ()]/gi, '') + '.png';
}

function getDownloadFileNameBase(
  gridUid: number,
  gridName: string | null,
  fileName: string,
  isOnlyGrid: boolean
): string {
  const baseFileName = fileName.replace(/\.[a-z]+$/, '');
  if (isOnlyGrid && baseFileName) {
    return baseFileName;
  }
  if (gridName) {
    if (isOnlyGrid) {
      return `${gridName}_grid-${gridUid}`;
    }
    return gridName;
  }
  if (baseFileName) {
    return `${baseFileName}_grid-${gridUid}`;
  }
  if (isOnlyGrid) {
    return 'grid';
  }
  return `grid-${gridUid}`;
}
