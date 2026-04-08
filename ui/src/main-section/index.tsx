import {
  buildColorFns,
  parseMapFile,
  type MapGrid,
  type RendererConfig
} from 'frontier-map-renderer-backend';
import { useCallback, useMemo, useState } from 'preact/hooks';
import DropZone, { DropZoneDivider } from '../drop-zone';
import './index.css';
import RenderedGrid from './render';
import { ErrorIcon } from '../icons';

export interface MainSectionProps {
  config: RendererConfig;
}

interface CurrentFile {
  readonly id: number;
  readonly name: string;
  readonly grids: readonly MapGrid[];
}

export default function MainSection({
  config,
}: MainSectionProps) {
  const [file, setFile] = useState<CurrentFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenFile = useCallback((file: File): void => {
    file.text()
      .then(source => {
        const grids = parseMapFile(source);
        setFile(prev => ({
          id: prev ? prev.id + 1 : 0,
          name: file.name,
          grids,
        }));
        setError(null);
      })
      .catch(err => {
        console.error('error loading map file:', err);
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  const [tileColorFn, entityColorFn] = useMemo(
    () => buildColorFns(config),
    [config]
  );

  const spacer = file === null && <span class='Spacer'/>;

  return (
    <main class='Main'>
      <div class='MainContent'>
        {spacer}
        <DropZone onDrop={handleOpenFile}>
          {file === null ? <>
            <span>Перетащите файл карты сюда</span>
            <DropZoneDivider/>
            <span>Нажмите для выбора</span>
          </> : <span>Открыть другой файл карты</span>}
        </DropZone>
        {error != null && (
          <div class='MapLoadError Error'>
            <ErrorIcon/>
            <p>Не удалось загрузить файл: {error}</p>
          </div>
        )}
        {spacer}
        {file && <>
          <h2 class='FileInfoHeading'>
            {file.name || '(безымянный файл)'} &ndash; {file.grids.length === 1 ? '1 сетка' : `${file.grids.length} сеток`}
          </h2>
          {file.grids.map(grid =>
            <RenderedGrid
              key={`${file.id}-${grid.uid}`}
              grid={grid}
              parentFileName={file.name}
              isOnlyGrid={file.grids.length === 1}
              tileColorFn={tileColorFn}
              entityColorFn={entityColorFn}
            />
          )}
        </>}
      </div>
    </main>
  );
}
