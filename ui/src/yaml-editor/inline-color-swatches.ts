import { RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  type DecorationSet,
} from '@codemirror/view';

// TODO: Show a color picker when the swatch is clicked

const InlineColorSwatchSize = 12; // px

const showColorPickers = ViewPlugin.fromClass(class {
  public decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = makeColorSwatches(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = makeColorSwatches(update.view);
    }
  }
}, {
  decorations: v => v.decorations,
});

const theme = EditorView.baseTheme({
  '.cm-inlineColorSwatch': {
    boxSizing: 'border-box',
    display: 'inline-block',
    marginInline: `calc(1ch - ${InlineColorSwatchSize / 2}px)`,
    width: `${InlineColorSwatchSize}px`,
    height: `${InlineColorSwatchSize}px`,
    verticalAlign: '0',
    border: '1px solid #fff',
    backgroundColor: 'var(--cm-color-value, black)',
    // TODO: reenable when colour picker is real and not fake
    // cursor: 'pointer',
  },
});

function makeColorSwatches(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos)

      ColorPattern.lastIndex = 0;
      let match: RegExpExecArray | null = null;
      while ((match = ColorPattern.exec(line.text)) != null) {
        const matchLength = match[0].length;
        // +1 and -2 to place it *inside* the quotes
        const start = line.from + match.index + 1;
        const end = start + matchLength - 2;
        builder.add(start, start, Decoration.widget({
          widget: new ColorSwatch(start, end),
        }));
      }

      pos = line.to + 1;
    }
  }
  return builder.finish();
}

// This matches colours inside single- and double-quoted strings only.
// YAML has about a trillion stupid ways to make strings, and if you try to use
// any that isn't ' or ", that's your problem.
// Unquoted strings do not need to be considered here, as `#` starts a comment.
const ColorPattern = /(["'])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\1/ig;

export default function inlineColorSwatches(): Extension {
  return [theme, showColorPickers];
}

class ColorSwatch extends WidgetType {
  private from: number;
  private to: number;

  public constructor(from: number, to: number) {
    super();
    this.from = from;
    this.to = to;
  }

  toDOM(view: EditorView): HTMLElement {
    const elem = document.createElement('span');
    elem.classList.add('cm-inlineColorSwatch');
    elem.style.setProperty(
      '--cm-color-value',
      view.state.sliceDoc(this.from, this.to)
    );
    return elem;
  }

  updateDOM(dom: HTMLElement, view: EditorView): boolean {
    dom.style.setProperty(
      '--cm-color-value',
      view.state.sliceDoc(this.from, this.to)
    );
    return true;
  }

  get estimatedHeight(): number {
    return 12;
  }
}
