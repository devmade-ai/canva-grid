// Layout presets for quick start
// Each preset defines layout settings and text group placements

export const layoutPresets = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Full image with centered text overlay',
    icon: '■',
    layout: {
      splitType: 'none',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: null },
      bodyGroup: { cell: null },
      cta: { cell: null },
      footnote: { cell: null },
    },
  },
  {
    id: 'left-image',
    name: 'Left Image',
    description: 'Image on left, text on right',
    icon: '◧',
    layout: {
      splitType: 'vertical',
      sections: 2,
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'right-image',
    name: 'Right Image',
    description: 'Text on left, image on right',
    icon: '◨',
    layout: {
      splitType: 'vertical',
      sections: 2,
      imageCells: [1],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },
  {
    id: 'top-image',
    name: 'Top Image',
    description: 'Image on top, text below',
    icon: '⬒',
    layout: {
      splitType: 'horizontal',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'start' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'bottom-image',
    name: 'Bottom Image',
    description: 'Text on top, image below',
    icon: '⬓',
    layout: {
      splitType: 'horizontal',
      sections: 2,
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },
  {
    id: 'text-focus',
    name: 'Text Focus',
    description: 'Large text area with accent image strip',
    icon: '▌',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [2],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
]
