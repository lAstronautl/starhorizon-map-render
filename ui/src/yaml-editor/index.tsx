import { EditorView } from 'codemirror';
import { useEffect, useRef } from 'preact/hooks';
import useDebounced from '../debounce';
import editorSetup from './setup';

export interface YamlEditorProps {
  initialValue: string;
  onChangeDebounced: (value: string) => void;
}

export default function YamlEditor({
  initialValue,
  onChangeDebounced,
}: YamlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useDebounced(onChangeDebounced);

  useEffect(() => {
    if (containerRef.current) {
      const editor = new EditorView({
        parent: containerRef.current,
        doc: initialValue,
        extensions: [
          editorSetup(),
          EditorView.updateListener.of(v => {
            if (v.docChanged) {
              handleChange(v.state.sliceDoc());
            }
          }),
        ],
      });
      return () => editor.destroy();
    }
  }, []);

  return (
    <div class='YamlEditor' ref={containerRef}/>
  );
}
