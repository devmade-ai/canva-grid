import { layouts, layoutCategories } from '../config/layouts'

export default function LayoutSelector({ selectedLayout, onLayoutChange }) {
  const layoutsByCategory = layoutCategories.map((category) => ({
    ...category,
    layouts: layouts.filter((l) => l.category === category.id),
  }))

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {layoutsByCategory.map((category) => (
        <div key={category.id} className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">{category.name}</label>
          <div className="grid grid-cols-2 gap-1">
            {category.layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => onLayoutChange(layout.id)}
                className={`p-2 text-xs rounded border transition-colors ${
                  selectedLayout === layout.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <LayoutThumbnail layout={layout} isSelected={selectedLayout === layout.id} />
                <span className="block mt-1 truncate">{layout.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function LayoutThumbnail({ layout, isSelected }) {
  const baseClass = isSelected ? 'bg-blue-200' : 'bg-gray-300'
  const textClass = isSelected ? 'bg-blue-400' : 'bg-gray-400'

  if (layout.category === 'background') {
    return (
      <div className={`w-full h-8 rounded ${baseClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-0.5">
          <div className={`w-6 h-1 rounded ${textClass}`} />
          <div className={`w-4 h-0.5 rounded ${textClass}`} />
        </div>
      </div>
    )
  }

  if (layout.category === 'vertical') {
    const imgWidth = layout.imageProportion
    const isLeft = layout.imagePosition === 'left'

    return (
      <div className="w-full h-8 rounded overflow-hidden flex">
        {isLeft ? (
          <>
            <div className={`h-full ${baseClass}`} style={{ width: `${imgWidth}%` }} />
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-0.5 rounded ${textClass}`} />
                <div className={`w-3 h-0.5 rounded ${textClass}`} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-0.5 rounded ${textClass}`} />
                <div className={`w-3 h-0.5 rounded ${textClass}`} />
              </div>
            </div>
            <div className={`h-full ${baseClass}`} style={{ width: `${imgWidth}%` }} />
          </>
        )}
      </div>
    )
  }

  if (layout.category === 'horizontal') {
    if (layout.splitThirds) {
      return (
        <div className="w-full h-8 rounded overflow-hidden flex flex-col">
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className={`w-4 h-0.5 rounded ${textClass}`} />
          </div>
          <div className={`flex-1 ${baseClass}`} />
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className={`w-3 h-0.5 rounded ${textClass}`} />
          </div>
        </div>
      )
    }

    const imgHeight = layout.imageProportion
    const isTop = layout.imagePosition === 'top'

    return (
      <div className="w-full h-8 rounded overflow-hidden flex flex-col">
        {isTop ? (
          <>
            <div className={`w-full ${baseClass}`} style={{ height: `${imgHeight}%` }} />
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-0.5 rounded ${textClass}`} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-0.5 rounded ${textClass}`} />
              </div>
            </div>
            <div className={`w-full ${baseClass}`} style={{ height: `${imgHeight}%` }} />
          </>
        )}
      </div>
    )
  }

  return null
}
