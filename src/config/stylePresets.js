// Looks presets - apply visual effects without changing theme or layout
// Each preset applies: overlay, fonts, text alignment, and image filters

export const lookPresets = [
  // ========== CLEAN ==========
  {
    id: 'clean',
    name: 'Clean',
    description: 'Minimal overlay, crisp and clear',
    preview: { style: 'clean' },
    settings: {
      fonts: { title: 'inter', body: 'inter' },
      overlay: { type: 'solid', color: 'primary', opacity: 15 },
      textAlign: 'center',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-light touch, content first',
    preview: { style: 'minimal' },
    settings: {
      fonts: { title: 'dm-sans', body: 'dm-sans' },
      overlay: { type: 'solid', color: 'secondary', opacity: 5 },
      textAlign: 'left',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 95, brightness: 105 },
    },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Gentle gradient, easy on the eyes',
    preview: { style: 'soft' },
    settings: {
      fonts: { title: 'raleway', body: 'open-sans' },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 25 },
      textAlign: 'center',
      textVerticalAlign: 'end',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 95, brightness: 102 },
    },
  },

  // ========== BOLD ==========
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong gradient, high impact',
    preview: { style: 'bold' },
    settings: {
      fonts: { title: 'bebas-neue', body: 'inter' },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 70 },
      textAlign: 'center',
      textVerticalAlign: 'end',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 110, brightness: 95 },
    },
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Deep vignette, cinematic feel',
    preview: { style: 'dramatic' },
    settings: {
      fonts: { title: 'oswald', body: 'lato' },
      overlay: { type: 'vignette', color: 'primary', opacity: 60 },
      textAlign: 'center',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 115, brightness: 92 },
    },
  },
  {
    id: 'punch',
    name: 'Punch',
    description: 'Top-heavy gradient, attention-grabbing',
    preview: { style: 'punch' },
    settings: {
      fonts: { title: 'archivo-black', body: 'dm-sans' },
      overlay: { type: 'gradient-down', color: 'primary', opacity: 55 },
      textAlign: 'center',
      textVerticalAlign: 'start',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 108, brightness: 98 },
    },
  },

  // ========== VINTAGE ==========
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Warm sepia tones, nostalgic feel',
    preview: { style: 'vintage' },
    settings: {
      fonts: { title: 'playfair', body: 'lora' },
      overlay: { type: 'vignette', color: 'primary', opacity: 35 },
      textAlign: 'center',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 30, blur: 0, contrast: 100, brightness: 98 },
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Faded colors, throwback vibes',
    preview: { style: 'retro' },
    settings: {
      fonts: { title: 'oswald', body: 'lato' },
      overlay: { type: 'gradient-up', color: 'accent', opacity: 40 },
      textAlign: 'center',
      textVerticalAlign: 'end',
      imageFilters: { grayscale: 0, sepia: 25, blur: 0, contrast: 105, brightness: 95 },
    },
  },
  {
    id: 'film',
    name: 'Film',
    description: 'Classic film look with grain effect',
    preview: { style: 'film' },
    settings: {
      fonts: { title: 'merriweather', body: 'merriweather' },
      overlay: { type: 'film-grain', color: 'primary', opacity: 20 },
      textAlign: 'center',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 15, blur: 0, contrast: 108, brightness: 96 },
    },
  },

  // ========== NOIR ==========
  {
    id: 'noir',
    name: 'Noir',
    description: 'Black & white, dramatic contrast',
    preview: { style: 'noir' },
    settings: {
      fonts: { title: 'bebas-neue', body: 'inter' },
      overlay: { type: 'vignette', color: 'primary', opacity: 50 },
      textAlign: 'center',
      textVerticalAlign: 'end',
      imageFilters: { grayscale: 100, sepia: 0, blur: 0, contrast: 120, brightness: 90 },
    },
  },
  {
    id: 'monochrome',
    name: 'Mono',
    description: 'Subtle grayscale, modern feel',
    preview: { style: 'mono' },
    settings: {
      fonts: { title: 'space-grotesk', body: 'dm-sans' },
      overlay: { type: 'solid', color: 'primary', opacity: 20 },
      textAlign: 'left',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 100, sepia: 0, blur: 0, contrast: 105, brightness: 100 },
    },
  },
  {
    id: 'duotone',
    name: 'Duotone',
    description: 'Two-color effect, stylized look',
    preview: { style: 'duotone' },
    settings: {
      fonts: { title: 'montserrat', body: 'inter' },
      overlay: { type: 'duotone', color: 'primary', opacity: 60 },
      textAlign: 'center',
      textVerticalAlign: 'center',
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 110, brightness: 95 },
    },
  },
]

// Helper to get a look preset by ID
export const getLookPreset = (id) => {
  return lookPresets.find(preset => preset.id === id)
}

// Legacy exports for backwards compatibility (can be removed later)
export const stylePresets = lookPresets
export const styleCategories = [{ id: 'all', name: 'All' }]
export const getFilteredStylePresets = () => lookPresets
