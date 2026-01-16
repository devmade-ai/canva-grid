import { memo } from 'react'
import { platforms } from '../config/platforms'

export default memo(function PlatformPreview({ selectedPlatform, onPlatformChange }) {
  const platform = platforms.find((p) => p.id === selectedPlatform) || platforms[0]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Platform</h3>
        <span className="text-sm text-gray-500 font-medium">
          {platform.width} × {platform.height}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => onPlatformChange(p.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              selectedPlatform === p.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
})
