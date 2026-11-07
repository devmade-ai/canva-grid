// Requirement: Shared color picker used in both structured text and freeform text editors
// Approach: Extracted component rendering theme swatches + neutral swatches with divider.
//   The painted disc is an inner span so a coarse pointer can grow the hit box
//   to 44px without growing the swatch.
// Alternatives:
//   - Inline in each editor: Rejected - duplicated code, harder to maintain consistent touch targets
//   - Single generic picker: Rejected - this is specific to text color with theme integration
//   - Background on the button: Rejected - min-size would scale the disc itself
import { memo } from 'react'
import { neutralColors } from '../config/themes'

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

function Swatch({ name, selected, onClick, backgroundColor, discClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      aria-label={name}
      className="inline-flex items-center justify-center p-0 bg-transparent"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none ${discClass} ${
          selected
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-base-300'
        }`}
        style={{ backgroundColor }}
      />
    </button>
  )
}

export default memo(function ColorPicker({ value, onChange, theme }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {themeColorOptions.map((color) => (
        <Swatch
          key={color.id}
          name={color.name}
          selected={value === color.id}
          onClick={() => onChange(color.id)}
          backgroundColor={theme[color.id]}
          discClass="w-7 h-7 rounded-full border-2"
        />
      ))}
      <span className="w-px h-5 bg-base-300 mx-0.5" />
      {neutralColors.map((color) => (
        <Swatch
          key={color.id}
          name={color.name}
          selected={value === color.id}
          onClick={() => onChange(color.id)}
          backgroundColor={color.hex}
          discClass="w-6 h-6 rounded-full border"
        />
      ))}
    </div>
  )
})
