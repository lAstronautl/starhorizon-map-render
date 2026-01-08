export interface IconProps {
  class?: string;
}

function icon(path: string) {
  return ({ class: className }: IconProps) =>
    <svg
      class={className ? `Icon ${className}` : 'Icon'}
      width='24'
      height='24'
      viewBox='0 0 32 32'
    >
      <path fill='currentColor' d={path}/>
    </svg>;
}

export const ZoomInIcon = icon(`
  M18 12h-4V8h-2v4H8v2h4v4h2v-4h4z
  M21.448 20A10.86 10.86 0 0 0 24 13a11 11 0 1 0-11 11a10.86 10.86 0 0 0 7-2.552L27.586 29L29 27.586ZM13 22a9 9 0 1 1 9-9a9.01 9.01 0 0 1-9 9
`);

export const ScaleIcon = icon(`
  M13 17H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m-6 8v-6h6v6Z
  M19 21v2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H11a2 2 0 0 0-2 2v6h2V7h14v14
`);

export const RotateRightIcon = icon(`
  M16 30H4a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2M4 16v12h12.001L16 16z
  m26-1l-1.41-1.41L26 16.17V11a7.01 7.01 0 0 0-7-7h-5v2h5a5.006 5.006 0 0 1 5 5v5.17l-2.59-2.58L20 15l5 5z
`);

export const RotateLeftIcon = icon(`
  M14 28V16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2m2-12l-.001 12H28V16z
  M2 15l1.41-1.41L6 16.17V11a7.01 7.01 0 0 1 7-7h5v2h-5a5.006 5.006 0 0 0-5 5v5.17l2.59-2.58L12 15l-5 5z
`);

export const PlusIcon = icon(`M17 15V5h-2v10H5v2h10v10h2V17h10v-2z`);

export const MinusIcon = icon(`M5 15v2h22v-2z`);

export const CheckIcon = icon(`m13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9z`);

export const WarningIcon = icon(`
  M16 23a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 23m-1-11h2v9h-2z
  M29 30H3a1 1 0 0 1-.887-1.461l13-25a1 1 0 0 1 1.774 0l13 25A1 1 0 0 1 29 30M4.65 28h22.7l.001-.003L16.002 6.17h-.004L4.648 27.997Z
`);

export const ErrorIcon = icon(`
  M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12
  M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z
`);

export const DownloadIcon = icon(`M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10z`);

export const ConfigIcon = icon(`M12.1 2a9.8 9.8 0 0 0-5.4 1.6l6.4 6.4a2.1 2.1 0 0 1 .2 3a2.1 2.1 0 0 1-3-.2L3.7 6.4A9.84 9.84 0 0 0 2 12.1a10.14 10.14 0 0 0 10.1 10.1a11 11 0 0 0 2.6-.3l6.7 6.7a5 5 0 0 0 7.1-7.1l-6.7-6.7a11 11 0 0 0 .3-2.6A10 10 0 0 0 12.1 2m8 10.1a7.6 7.6 0 0 1-.3 2.1l-.3 1.1l.8.8l6.7 6.7a2.88 2.88 0 0 1 .9 2.1A2.72 2.72 0 0 1 27 27a2.9 2.9 0 0 1-4.2 0l-6.7-6.7l-.8-.8l-1.1.3a7.6 7.6 0 0 1-2.1.3a8.27 8.27 0 0 1-5.7-2.3A7.63 7.63 0 0 1 4 12.1a8.3 8.3 0 0 1 .3-2.2l4.4 4.4a4.14 4.14 0 0 0 5.9.2a4.14 4.14 0 0 0-.2-5.9L10 4.2a6.5 6.5 0 0 1 2-.3a8.27 8.27 0 0 1 5.7 2.3a8.5 8.5 0 0 1 2.4 5.9`);

export const CloseIcon = icon(`M17.414 16L26 7.414L24.586 6L16 14.586L7.414 6L6 7.414L14.586 16L6 24.586L7.414 26L16 17.414L24.586 26L26 24.586z`);
