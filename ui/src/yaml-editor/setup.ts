import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { yaml } from '@codemirror/lang-yaml';
import {
  bracketMatching,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { EditorView } from 'codemirror';
import inlineColorSwatches from './inline-color-swatches';

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c586c0" },
  { tag: [tags.atom, tags.contentSeparator, tags.labelName], color: "#c586c0" },
  { tag: [tags.literal, tags.bool], color: "#b5cea8" },
  { tag: tags.string, color: "#ce9178" },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], color: "#d7ba7d" },
  { tag: tags.definition(tags.variableName), color: "#4fc1ff" },
  { tag: tags.local(tags.variableName), color: "#4fc1ff" },
  { tag: [tags.typeName, tags.namespace], color: "#4ec9b0" },
  { tag: tags.className, color: "#4ec9b0" },
  { tag: [tags.special(tags.variableName), tags.macroName], color: "#4fc1ff" },
  { tag: tags.definition(tags.propertyName), color: "#569cd6" },
  { tag: tags.comment, color: "#6A9955" },
  { tag: tags.invalid, color: "#f66" },
]);

const theme = EditorView.theme({
  '&': {
    color: '#fff',
    backgroundColor: '#222',
  },
  '.cm-content': {
    fontSize: '14.75px',
    caretColor: '#fff',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#4448',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#fff',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#07c6',
  },
  '.cm-gutters': {
    paddingRight: '1ch',
    backgroundColor: '#222',
    color: '#999',
  },
}, { dark: true });

export default function editorSetup(): Extension {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(highlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    EditorView.lineWrapping,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
    ]),
    yaml(),
    theme,
    inlineColorSwatches(),
  ];
}
