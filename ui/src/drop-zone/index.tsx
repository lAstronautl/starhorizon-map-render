import { type ComponentChildren } from 'preact';
import { type PropsWithChildren } from 'preact/compat';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import './index.css';

export interface DropZoneProps {
  onDrop: (file: File) => void;
  children: ComponentChildren;
}

export default function DropZone({
  onDrop,
  children,
}: DropZoneProps) {
  const [active, setActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const dragEvents = useMemo(() => ({
    onDragOver: (e: DragEvent): void => {
      if (canAcceptDragEvent(e)) {
        e.preventDefault();
        e.dataTransfer!.effectAllowed = 'all';
        setActive(true);
      }
    },
    onDragEnter: (e: DragEvent): void => {
      if (canAcceptDragEvent(e)) {
        setActive(true);
      }
    },
    onDragLeave: (): void => {
      setActive(false);
    },
  }), []);

  const handleDrop = useCallback((e: DragEvent): void => {
    if (canAcceptDragEvent(e)) {
      e.preventDefault();
      setActive(false);

      const file = getDroppedFile(e);
      if (file) {
        onDrop(file);
      }
    }
  }, [onDrop]);

  const handleClick = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  }, []);

  const handleFileChange = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const files = input.files;
    if (files && files.length > 0) {
      onDrop(files[0]);
    }
  }, [onDrop]);

  return (
    <div
      class={active ? 'DropZone DropZone-active' : 'DropZone'}
      {...dragEvents}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        class='DropZoneInput'
        type='file'
        onChange={handleFileChange}
        ref={inputRef}
      />
      {children}
    </div>
  );
}

function canAcceptDragEvent(e: DragEvent): boolean {
  const { dataTransfer } = e;
  if (!dataTransfer) {
    return false;
  }
  if (dataTransfer.files.length > 0) {
    return true;
  }
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const item = dataTransfer.items[i];
    if (item.kind === 'file') {
      return true;
    }
  }
  return false;
}

function getDroppedFile(e: DragEvent): File | null {
  const { dataTransfer } = e;
  if (!dataTransfer) {
    return null;
  }
  if (dataTransfer.files.length > 0) {
    return dataTransfer.files[0];
  }
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const file = dataTransfer.items[i].getAsFile();
    if (file) {
      return file;
    }
  }
  return null;
}

export function DropZoneDivider({
  children = 'or',
}: PropsWithChildren) {
  return <span class='DropZoneDivider'>{children}</span>;
}
