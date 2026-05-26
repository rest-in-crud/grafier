import type { ReactNode } from 'react';
import type { IconProps } from './types';

const makeIcon = (path: ReactNode, viewBox = '0 0 16 16', fill = false) => {
  return ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
};

const IMove = makeIcon(
  <>
    <path d="M8 1v14M1 8h14M5 4l3-3 3 3M4 5l-3 3 3 3M11 12l-3 3-3-3M12 11l3-3-3-3" />
  </>,
);

const IMarquee = makeIcon(
  <>
    <path d="M2 2h3M11 2h3M2 14h3M11 14h3M2 2v3M2 11v3M14 2v3M14 11v3" strokeDasharray="2 1.2" />
  </>,
);

const ILasso = makeIcon(
  <>
    <path d="M3 9c0-3 2-6 5-6s5 3 5 5-2 4-4 4H6c-1 0-2 .5-2 1.5S5 15 6 14" />
  </>,
);

const IBrush = makeIcon(
  <>
    <path d="M2 14c1-1 2-2 4-2M6 12l5-5M11 7l3-3-2-2-3 3M11 7l2 2" />
  </>,
);

const IPencil = makeIcon(
  <>
    <path d="m3 13 7-7 3 3-7 7H3v-3zM10 6l3 3" />
  </>,
);

const IEraser = makeIcon(
  <>
    <path d="m3 13 8-8 2 2-8 8H3v-2zM3 13h7" />
  </>,
);

const IShape = makeIcon(
  <>
    <rect x="2" y="6" width="8" height="8" />
    <circle cx="11" cy="5" r="3" />
  </>,
);

const IText = makeIcon(
  <>
    <path d="M3 3h10M8 3v10M5 13h6" />
  </>,
);

const IImage = makeIcon(
  <>
    <rect x="2" y="3" width="12" height="10" />
    <circle cx="5.5" cy="6.5" r="1" />
    <path d="M2 11.5 L5.5 8.5 L8 10.5 L14 5.5" />
  </>,
);

const IDropper = makeIcon(
  <>
    <path d="m11 5 1-1 1 1-1 1M11 5 4 12v2h2l7-7M9 7l1 1" />
  </>,
);

const IHand = makeIcon(
  <>
    <path d="M5 7V3a1 1 0 1 1 2 0v4M7 7V2a1 1 0 1 1 2 0v5M9 7V3a1 1 0 1 1 2 0v4M11 7V4a1 1 0 1 1 2 0v6c0 3-2 5-5 5s-5-2-5-5V7a1 1 0 1 1 2 0" />
  </>,
);

const IUpload = makeIcon(
  <>
    <path d="M8 10V4M5 7l3-3 3 3" />
    <path d="M3 12v1a1 1 0 001 1h8a1 1 0 001-1v-1" />
  </>,
);

const IUndo = makeIcon(
  <>
    <path d="M3 7h7c2 0 4 1 4 4M3 7l3-3M3 7l3 3" />
  </>,
);

const IRedo = makeIcon(
  <>
    <path d="M13 7H6c-2 0-4 1-4 4M13 7l-3-3M13 7l-3 3" />
  </>,
);

const IClose = makeIcon(
  <>
    <path d="M3 3l10 10M13 3 3 13" />
  </>,
);

const IPlus = makeIcon(
  <>
    <path d="M8 3v10M3 8h10" />
  </>,
);

const IHistory = makeIcon(
  <>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5v3.5l2.25 1.5" />
    <path d="M3 5.5h2.5v-2.5" />
    <path d="M5.5 5.5a6 6 0 0 0-2.5 2.5" />
  </>,
);

const IFolder = makeIcon(
  <>
    <path d="M2 4h4l2 2h6v8H2V4z" />
  </>,
);

const ISquare = makeIcon(
  <>
    <rect x="3" y="3" width="10" height="10" />
  </>,
);

const ICircle = makeIcon(
  <>
    <circle cx="8" cy="8" r="5" />
  </>,
);

const ITextLayer = makeIcon(
  <>
    <path d="M3 5h10M8 5v8M5 13h6" />
  </>,
);

const IEye = makeIcon(
  <>
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </>,
);

const ILock = makeIcon(
  <>
    <rect x="3" y="7" width="10" height="7" />
    <path d="M5 7V5a3 3 0 1 1 6 0v2" />
  </>,
);

const IChev = makeIcon(
  <>
    <path d="m6 4 4 4-4 4" />
  </>,
);

const IDuplicate = makeIcon(
  <>
    <rect x="3" y="3" width="8" height="8" />
    <rect x="6" y="6" width="8" height="8" />
  </>,
);

const ICut = makeIcon(
  <>
    <circle cx="4" cy="11" r="2" />
    <circle cx="12" cy="11" r="2" />
    <path d="m6 9 7-7M10 9 3 2" />
  </>,
);

const ITrash = makeIcon(
  <>
    <path d="M3 4h10M5 4v9h6V4M6 4V2h4v2M6 7v4M10 7v4" />
  </>,
);

const IPin = makeIcon(
  <>
    <path d="M8 1v6l3 3v1H5v-1l3-3M8 11v4" />
  </>,
);

const IPaste = makeIcon(
  <>
    <rect x="3" y="4" width="10" height="11" />
    <path d="M5 4V2h6v2M6 8h4M6 11h4" />
  </>,
);

const IStar = makeIcon(
  <>
    <path d="m8 2 1.8 4 4.2.4-3 2.8.8 4.4L8 11.5 4.2 13.6 5 9.2 2 6.4l4.2-.4z" />
  </>,
);

const ISettings = makeIcon(
  <>
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M3 13l1.5-1.5M11.5 4.5 13 3" />
  </>,
);

const IExport = makeIcon(
  <>
    <path d="M8 2v9M5 5l3-3 3 3M2 11v3h12v-3" />
  </>,
);

export {
  IMove,
  IMarquee,
  ILasso,
  IBrush,
  IPencil,
  IEraser,
  IShape,
  IText,
  IImage,
  IDropper,
  IHand,
  IUpload,
  IUndo,
  IRedo,
  IClose,
  IPlus,
  IHistory,
  IFolder,
  ISquare,
  ICircle,
  ITextLayer,
  IEye,
  ILock,
  IChev,
  IDuplicate,
  ICut,
  ITrash,
  IPin,
  IPaste,
  IStar,
  ISettings,
  IExport,
};
