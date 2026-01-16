import { memo } from 'react'
import { presetThemes } from '../config/themes'

export default memo(function ThemePicker({ theme, onThemeChange, onPresetChange }) {
  const isCustom = theme.preset === 'custom'

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Theme</h3>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-600">Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {presetThemes.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                theme.preset === preset.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-1.5 mb-2">
                <div
                  className="w-5 h-5 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-5 h-5 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.secondary }}
                />
                <div
                  className="w-5 h-5 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-600">Custom Colors</label>
          {!isCustom && (
            <span className="text-xs text-gray-400">(Edit to customize)</span>
          )}
        </div>

        <div className="space-y-3">
          <ColorInput
            label="Primary"
            value={theme.primary}
            onChange={(value) => onThemeChange({ preset: 'custom', primary: value })}
          />
          <ColorInput
            label="Secondary"
            value={theme.secondary}
            onChange={(value) => onThemeChange({ preset: 'custom', secondary: value })}
          />
          <ColorInput
            label="Accent"
            value={theme.accent}
            onChange={(value) => onThemeChange({ preset: 'custom', accent: value })}
          />
        </div>
      </div>
    </div>
  )
})

const ColorInput = memo(function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 shadow-sm"
      />
      <div className="flex-1">
        <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>
    </div>
  )
})
