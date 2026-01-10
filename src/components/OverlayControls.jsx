import { overlayTypes } from '../config/layouts'

const colorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

export default function OverlayControls({ overlay, onOverlayChange, theme }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Overlay</h3>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Type</label>
        <div className="grid grid-cols-2 gap-1">
          {overlayTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onOverlayChange({ type: type.id })}
              className={`px-2 py-1.5 text-xs rounded ${
                overlay.type === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Color</label>
        <div className="flex gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.id}
              onClick={() => onOverlayChange({ color: color.id })}
              className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                overlay.color === color.id
                  ? 'ring-2 ring-blue-500 ring-offset-1'
                  : 'hover:bg-gray-100'
              }`}
              style={{ backgroundColor: theme[color.id] }}
            >
              <span
                className="text-xs"
                style={{
                  color: color.id === 'primary' ? theme.secondary : theme.primary,
                }}
              >
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-medium text-gray-600">Opacity</label>
          <span className="text-xs text-gray-500">{overlay.opacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={overlay.opacity}
          onChange={(e) => onOverlayChange({ opacity: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
