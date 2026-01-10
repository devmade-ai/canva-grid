export const layoutCategories = [
  { id: 'background', name: 'Background Image' },
  { id: 'vertical', name: 'Vertical Columns' },
  { id: 'horizontal', name: 'Horizontal Rows' },
]

export const layouts = [
  // Background Image Layouts
  {
    id: 'fullbleed-center',
    name: 'Full Bleed - Centered',
    category: 'background',
    imagePosition: 'background',
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  {
    id: 'fullbleed-left',
    name: 'Full Bleed - Left',
    category: 'background',
    imagePosition: 'background',
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  {
    id: 'fullbleed-right',
    name: 'Full Bleed - Right',
    category: 'background',
    imagePosition: 'background',
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  {
    id: 'fullbleed-bottom',
    name: 'Full Bleed - Bottom',
    category: 'background',
    imagePosition: 'background',
    textAlign: 'center',
    textVerticalAlign: 'end',
  },
  {
    id: 'fullbleed-top',
    name: 'Full Bleed - Top',
    category: 'background',
    imagePosition: 'background',
    textAlign: 'center',
    textVerticalAlign: 'start',
  },

  // Vertical Column Layouts
  {
    id: '2col-equal-img-left',
    name: '2 Col Equal - Image Left',
    category: 'vertical',
    imagePosition: 'left',
    imageProportion: 50,
    textAlign: 'left',
  },
  {
    id: '2col-equal-img-right',
    name: '2 Col Equal - Image Right',
    category: 'vertical',
    imagePosition: 'right',
    imageProportion: 50,
    textAlign: 'left',
  },
  {
    id: '2col-img-heavy-left',
    name: '2 Col Image Heavy - Left',
    category: 'vertical',
    imagePosition: 'left',
    imageProportion: 65,
    textAlign: 'left',
  },
  {
    id: '2col-img-heavy-right',
    name: '2 Col Image Heavy - Right',
    category: 'vertical',
    imagePosition: 'right',
    imageProportion: 65,
    textAlign: 'left',
  },
  {
    id: '2col-text-heavy-left',
    name: '2 Col Text Heavy - Image Left',
    category: 'vertical',
    imagePosition: 'left',
    imageProportion: 35,
    textAlign: 'left',
  },
  {
    id: '2col-text-heavy-right',
    name: '2 Col Text Heavy - Image Right',
    category: 'vertical',
    imagePosition: 'right',
    imageProportion: 35,
    textAlign: 'left',
  },

  // Horizontal Row Layouts
  {
    id: 'row-img-top',
    name: 'Image Top - Text Bottom',
    category: 'horizontal',
    imagePosition: 'top',
    imageProportion: 60,
    textAlign: 'center',
  },
  {
    id: 'row-img-bottom',
    name: 'Image Bottom - Text Top',
    category: 'horizontal',
    imagePosition: 'bottom',
    imageProportion: 40,
    textAlign: 'center',
  },
  {
    id: 'banner-bottom',
    name: 'Banner Bottom',
    category: 'horizontal',
    imagePosition: 'top',
    imageProportion: 80,
    textAlign: 'center',
    bannerStyle: true,
  },
  {
    id: 'banner-top',
    name: 'Banner Top',
    category: 'horizontal',
    imagePosition: 'bottom',
    imageProportion: 80,
    textAlign: 'center',
    bannerStyle: true,
  },
  {
    id: 'split-thirds',
    name: 'Split Thirds',
    category: 'horizontal',
    imagePosition: 'middle',
    imageProportion: 33,
    textAlign: 'center',
    splitThirds: true,
  },
]

export const overlayTypes = [
  {
    id: 'solid',
    name: 'Solid',
    getCss: (color, opacity) => color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba'),
  },
  {
    id: 'gradient-down',
    name: 'Gradient Down',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to bottom, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-up',
    name: 'Gradient Up',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to top, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'vignette',
    name: 'Vignette',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `radial-gradient(ellipse at center, transparent 0%, ${rgbaColor} 100%)`
    },
  },
]

// Helper to convert hex to rgb string
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
}
