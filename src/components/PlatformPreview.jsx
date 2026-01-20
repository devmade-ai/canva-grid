import { memo, useMemo } from 'react'
import { platforms } from '../config/platforms'

// Category labels for display
const categoryLabels = {
  social: 'Social Media',
  web: 'Website',
  banner: 'Banners',
  email: 'Email',
  other: 'Other',
}

export default memo(function PlatformPreview({ selectedPlatform, onPlatformChange }) {
  const platform = platforms.find((p) => p.id === selectedPlatform) || platforms[0]

  // Group platforms by category
  const groupedPlatforms = useMemo(() => {
    const groups = {}
    platforms.forEach((p) => {
      const cat = p.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    })
    return groups
  }, [])

  // Order of categories to display
  const categoryOrder = ['social', 'web', 'banner', 'email', 'other']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Platform</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {platform.width} × {platform.height}
        </span>
      </div>

      <div className="space-y-2">
        {categoryOrder.map((category) => {
          const categoryPlatforms = groupedPlatforms[category]
          if (!categoryPlatforms || categoryPlatforms.length === 0) return null

          return (
            <div key={category} className="space-y-1">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
                {categoryLabels[category] || category}
              </span>
              <div className="flex flex-wrap gap-1">
                {categoryPlatforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPlatformChange(p.id)}
                    title={`${p.width} × ${p.height}`}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      selectedPlatform === p.id
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
