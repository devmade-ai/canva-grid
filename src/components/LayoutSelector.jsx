import { useState, useMemo } from 'react'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
} from '../config/layoutPresets'
import { defaultState } from '../hooks/useAdState'

const layoutTypes = [
  { id: 'fullbleed', name: 'Full', icon: '□' },
  { id: 'rows', name: 'Rows', icon: '☰' },
  { id: 'columns', name: 'Cols', icon: '|||' },
]

const textAlignOptions = [
  { id: 'left', name: 'Left', icon: '◀' },
  { id: 'center', name: 'Center', icon: '●' },
  { id: 'right', name: 'Right', icon: '▶' },
]

const verticalAlignOptions = [
  { id: 'start', name: 'Top', icon: '▲' },
  { id: 'center', name: 'Middle', icon: '●' },
  { id: 'end', name: 'Bottom', icon: '▼' },
]

const textGroupDefs = [
  { id: 'titleGroup', name: 'Title + Tagline', short: 'Title' },
  { id: 'bodyGroup', name: 'Body Text', short: 'Body' },
  { id: 'cta', name: 'Call to Action', short: 'CTA' },
  { id: 'footnote', name: 'Footnote', short: 'Note' },
]

// Sub-tabs for the Layout section
const subTabs = [
  { id: 'presets', name: 'Presets', icon: '⊞' },
  { id: 'structure', name: 'Structure', icon: '⊟' },
  { id: 'alignment', name: 'Alignment', icon: '≡' },
  { id: 'placement', name: 'Placement', icon: '¶' },
]

// Helper to count total cells in structure
function getTotalCells(structure) {
  if (!structure) return 1
  return structure.reduce((sum, section) => sum + (section.subdivisions || 1), 0)
}

// Helper to get cell info for display
function getCellInfo(layout) {
  const { type, structure } = layout
  if (type === 'fullbleed' || !structure) {
    return [{ index: 0, label: 'Full', sectionIndex: 0, subIndex: 0 }]
  }

  const cells = []
  let cellIndex = 0
  const isRows = type === 'rows'

  structure.forEach((section, sectionIndex) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      let label
      if (subdivisions === 1) {
        label = isRows ? `Row ${sectionIndex + 1}` : `Col ${sectionIndex + 1}`
      } else {
        const subLabel = isRows ? `Col ${subIndex + 1}` : `Row ${subIndex + 1}`
        const sectionLabel = isRows ? `R${sectionIndex + 1}` : `C${sectionIndex + 1}`
        label = `${sectionLabel}-${subLabel}`
      }
      cells.push({ index: cellIndex, label, sectionIndex, subIndex })
      cellIndex++
    }
  })

  return cells
}

// SVG Preview Icon Component
function PresetIcon({ presetId, isActive }) {
  const iconData = presetIcons[presetId]
  if (!iconData) return <span className="text-base">?</span>

  return (
    <svg
      viewBox={iconData.viewBox}
      className="w-10 h-7"
      style={{ display: 'block' }}
    >
      {iconData.elements.map((el, i) => {
        const Element = el.type
        const props = { ...el.props }
        if (isActive) {
          if (props.fill === '#3b82f6') props.fill = '#ffffff'
          if (props.fill === '#e5e7eb') props.fill = 'rgba(255,255,255,0.4)'
        }
        return <Element key={i} {...props} />
      })}
    </svg>
  )
}

// Visual grid preview for cell selection - supports multiple modes
function CellGrid({
  layout,
  imageCell,
  selectedCell = null,
  mode = 'image', // 'image' | 'alignment' | 'placement'
  onSelectCell,
  textGroups = {},
}) {
  const { type, structure } = layout

  // Get cells that have text groups assigned
  const textGroupCells = useMemo(() => {
    const cellMap = {}
    textGroupDefs.forEach(group => {
      const cell = textGroups?.[group.id]?.cell
      if (cell !== null && cell !== undefined) {
        if (!cellMap[cell]) cellMap[cell] = []
        cellMap[cell].push(group.short)
      }
    })
    return cellMap
  }, [textGroups])

  if (type === 'fullbleed' || !structure) {
    const isSelected = selectedCell === 0
    return (
      <div
        className={`w-full aspect-[4/3] rounded cursor-pointer border-2 transition-all ${
          mode === 'image'
            ? 'bg-blue-500 border-blue-600'
            : isSelected
              ? 'bg-purple-500 border-purple-600'
              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
        }`}
        onClick={() => onSelectCell(0)}
        title={mode === 'image' ? 'Image covers full area' : 'Click to select'}
      >
        <div className={`w-full h-full flex items-center justify-center text-xs font-medium ${
          mode === 'image' || isSelected ? 'text-white' : 'text-gray-500'
        }`}>
          {mode === 'image' ? '📷 Image' : isSelected ? '✓ Selected' : 'All'}
        </div>
      </div>
    )
  }

  const isRows = type === 'rows'
  let cellIndex = 0

  return (
    <div
      className={`w-full aspect-[4/3] rounded overflow-hidden border border-gray-300 flex ${isRows ? 'flex-col' : 'flex-row'}`}
    >
      {structure.map((section, sectionIndex) => {
        const sectionSize = section.size || (100 / structure.length)
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          const isSelected = currentCellIndex === selectedCell
          cellIndex++

          // Determine cell styling based on mode
          let bgClass, textClass, content

          if (mode === 'image') {
            bgClass = isImage
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-200 hover:bg-gray-300'
            textClass = isImage ? 'text-white' : 'text-gray-500'
            content = isImage ? '📷' : currentCellIndex
          } else if (mode === 'alignment') {
            if (isSelected) {
              bgClass = 'bg-purple-500 hover:bg-purple-600'
              textClass = 'text-white'
              content = '✓'
            } else if (isImage) {
              bgClass = 'bg-blue-400 hover:bg-blue-500'
              textClass = 'text-white'
              content = '📷'
            } else {
              bgClass = 'bg-gray-200 hover:bg-gray-300'
              textClass = 'text-gray-500'
              content = currentCellIndex
            }
          } else if (mode === 'placement') {
            const assignedGroups = textGroupCells[currentCellIndex]
            if (isSelected) {
              bgClass = 'bg-purple-500 hover:bg-purple-600'
              textClass = 'text-white'
              content = '✓'
            } else if (isImage) {
              bgClass = 'bg-blue-400 hover:bg-blue-500'
              textClass = 'text-white'
              content = '📷'
            } else if (assignedGroups) {
              bgClass = 'bg-amber-100 hover:bg-amber-200'
              textClass = 'text-amber-700'
              content = assignedGroups.join(', ')
            } else {
              bgClass = 'bg-gray-200 hover:bg-gray-300'
              textClass = 'text-gray-500'
              content = currentCellIndex
            }
          }

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors ${bgClass}`}
              style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
              title={mode === 'image'
                ? (isImage ? 'Image cell (click another to move)' : 'Click to place image here')
                : (isSelected ? 'Click to deselect' : 'Click to edit this cell')
              }
            >
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${textClass}`}>
                {content}
              </div>
            </div>
          )
        }

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `0 0 ${sectionSize}%` }}
          >
            {sectionCells}
          </div>
        )
      })}
    </div>
  )
}

export default function LayoutSelector({
  layout,
  onLayoutChange,
  textGroups = {},
  onTextGroupsChange,
  imageAspectRatio,
  platform,
}) {
  const { type = 'fullbleed', structure = [], imageCell = 0, textAlign, textVerticalAlign, cellAlignments = [] } = layout

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState('presets')
  // Cell selection state for alignment/placement tabs (null = all cells)
  const [selectedCell, setSelectedCell] = useState(null)
  // Preset category state
  const [activeCategory, setActiveCategory] = useState('suggested')

  const totalCells = useMemo(() => getTotalCells(structure), [structure])
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Get suggested layouts
  const suggestedIds = useMemo(() => {
    return getSuggestedLayouts(imageAspectRatio, platform)
  }, [imageAspectRatio, platform])

  const suggestedPresets = useMemo(() => {
    return layoutPresets.filter(p => suggestedIds.includes(p.id))
  }, [suggestedIds])

  const displayPresets = useMemo(() => {
    if (activeCategory === 'all') return layoutPresets
    if (activeCategory === 'suggested') {
      return suggestedPresets.length > 0 ? suggestedPresets : layoutPresets.slice(0, 6)
    }
    return getPresetsByCategory(activeCategory)
  }, [activeCategory, suggestedPresets])

  // Helper to update a specific cell's alignment
  const updateCellAlignment = (cellIndex, updates) => {
    const newAlignments = [...(cellAlignments || [])]
    while (newAlignments.length <= cellIndex) {
      newAlignments.push({ textAlign: null, textVerticalAlign: null })
    }
    newAlignments[cellIndex] = { ...newAlignments[cellIndex], ...updates }
    onLayoutChange({ cellAlignments: newAlignments })
  }

  // Update all cells' alignment
  const updateAllCellsAlignment = (updates) => {
    // Update global alignment
    onLayoutChange(updates)
    // Also update all cell alignments to match
    const newAlignments = cellInfoList.map((_, idx) => ({
      ...(cellAlignments?.[idx] || {}),
      ...updates,
    }))
    onLayoutChange({ cellAlignments: newAlignments, ...updates })
  }

  // Get current alignment for a cell
  const getCellAlignment = (cellIndex, prop) => {
    const cellAlign = cellAlignments?.[cellIndex]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? textAlign : textVerticalAlign
  }

  // Handle cell selection for alignment/placement tabs
  const handleCellSelect = (cellIndex) => {
    if (activeSubTab === 'image') {
      // Image mode: directly set image cell
      onLayoutChange({ imageCell: cellIndex })
    } else {
      // Alignment/placement mode: toggle selection
      setSelectedCell(selectedCell === cellIndex ? null : cellIndex)
    }
  }

  // Change layout type
  const handleTypeChange = (newType) => {
    if (newType === 'fullbleed') {
      onLayoutChange({
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
      })
    } else {
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
      })
    }
    setSelectedCell(null)
  }

  // Add a section
  const addSection = () => {
    if (type === 'fullbleed') return
    const newStructure = [...structure]
    const newSize = 100 / (newStructure.length + 1)
    newStructure.forEach(s => s.size = newSize)
    newStructure.push({ size: newSize, subdivisions: 1, subSizes: [100] })
    onLayoutChange({ structure: newStructure })
  }

  // Remove a section
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const newStructure = structure.filter((_, i) => i !== index)
    const newSize = 100 / newStructure.length
    newStructure.forEach(s => s.size = newSize)
    const newTotalCells = getTotalCells(newStructure)
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
  }

  // Update section size with proportional balancing
  const updateSectionSize = (index, newSize) => {
    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = newSize - oldSize

    const otherIndices = structure.map((_, i) => i).filter(i => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach(i => {
        const proportion = structure[i].size / otherTotalSize
        const adjustment = sizeDiff * proportion
        newStructure[i] = {
          ...newStructure[i],
          size: Math.max(10, Math.min(90, structure[i].size - adjustment))
        }
      })
    }

    newStructure[index] = { ...newStructure[index], size: newSize }

    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: s.size * scale }
      })
    }

    onLayoutChange({ structure: newStructure })
  }

  // Add subdivision to a section
  const addSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs >= 3) return

    const newSubs = currentSubs + 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }
    onLayoutChange({ structure: newStructure })
  }

  // Remove subdivision from a section
  const removeSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs <= 1) return

    const newSubs = currentSubs - 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }

    const newTotalCells = getTotalCells(newStructure)
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
  }

  // Update subdivision sizes
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const oldSize = subSizes[subIndex]
    const sizeDiff = newSize - oldSize

    const otherIndices = subSizes.map((_, i) => i).filter(i => i !== subIndex)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + subSizes[i], 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach(i => {
        const proportion = subSizes[i] / otherTotalSize
        const adjustment = sizeDiff * proportion
        subSizes[i] = Math.max(10, Math.min(90, subSizes[i] - adjustment))
      })
    }

    subSizes[subIndex] = newSize

    const total = subSizes.reduce((sum, s) => sum + s, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      subSizes.forEach((s, i) => {
        subSizes[i] = s * scale
      })
    }

    newStructure[sectionIndex] = { ...section, subSizes }
    onLayoutChange({ structure: newStructure })
  }

  // Apply a preset
  const applyPreset = (preset) => {
    onLayoutChange(preset.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(preset.textGroups)
    }
    setSelectedCell(null)
  }

  // Check if current layout matches a preset
  const getActivePreset = () => {
    return layoutPresets.find(preset => {
      return JSON.stringify(preset.layout) === JSON.stringify(layout)
    })
  }

  const activePreset = getActivePreset()

  // Reset to default
  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(defaultState.textGroups)
    }
    setSelectedCell(null)
  }

  // Category tabs for presets
  const categoryTabs = [
    ...(suggestedPresets.length > 0 ? [{ id: 'suggested', name: 'Suggested' }] : []),
    { id: 'all', name: 'All' },
    ...presetCategories.map(c => ({ id: c.id, name: c.name })),
  ]

  // Render sub-tab content
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'presets':
        return (
          <div className="space-y-3">
            {/* Layout Type Quick Select */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <div className="flex gap-1">
                {layoutTypes.map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => handleTypeChange(lt.id)}
                    className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-0.5 ${
                      type === lt.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm">{lt.icon}</span>
                    <span>{lt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
              {categoryTabs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-1 text-[10px] rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                  {cat.id === 'suggested' && <span className="ml-1">★</span>}
                </button>
              ))}
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {displayPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  title={preset.description}
                  className={`px-1.5 py-2 text-xs rounded flex flex-col items-center gap-1 transition-colors ${
                    activePreset?.id === preset.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PresetIcon presetId={preset.id} isActive={activePreset?.id === preset.id} />
                  <span className="text-[9px] leading-tight text-center line-clamp-2">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Image Position Preview */}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Image Position <span className="text-gray-400 font-normal">(click to move)</span>
              </label>
              <CellGrid
                layout={layout}
                imageCell={imageCell}
                mode="image"
                onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
              />
            </div>
          </div>
        )

      case 'structure':
        return (
          <div className="space-y-3">
            {/* Layout Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Layout Type</label>
              <div className="flex gap-1">
                {layoutTypes.map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => handleTypeChange(lt.id)}
                    className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-0.5 ${
                      type === lt.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm">{lt.icon}</span>
                    <span>{lt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structure Controls */}
            {type !== 'fullbleed' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">
                    {type === 'rows' ? 'Rows' : 'Columns'}
                  </label>
                  <button
                    onClick={addSection}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={structure.length >= 4}
                  >
                    + Add
                  </button>
                </div>

                {structure.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="p-2 bg-gray-50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        {type === 'rows' ? `Row ${sectionIndex + 1}` : `Col ${sectionIndex + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 mr-1">Split:</span>
                        <button
                          onClick={() => removeSubdivision(sectionIndex)}
                          disabled={(section.subdivisions || 1) <= 1}
                          className={`w-5 h-5 text-[10px] rounded ${
                            (section.subdivisions || 1) <= 1
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          −
                        </button>
                        <span className="text-[10px] text-gray-600 w-4 text-center font-medium">
                          {section.subdivisions || 1}
                        </span>
                        <button
                          onClick={() => addSubdivision(sectionIndex)}
                          disabled={(section.subdivisions || 1) >= 3}
                          className={`w-5 h-5 text-[10px] rounded ${
                            (section.subdivisions || 1) >= 3
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                        {structure.length > 1 && (
                          <button
                            onClick={() => removeSection(sectionIndex)}
                            className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 rounded ml-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section size slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-8">Size</span>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={section.size}
                        onChange={(e) => updateSectionSize(sectionIndex, Number(e.target.value))}
                        className="flex-1 h-1"
                      />
                      <span className="text-[10px] text-gray-500 w-8">{Math.round(section.size)}%</span>
                    </div>

                    {/* Subdivision sizes */}
                    {section.subdivisions > 1 && (
                      <div className="pl-2 border-l-2 border-gray-200">
                        <span className="text-[10px] text-gray-400">
                          {type === 'rows' ? 'Column widths' : 'Row heights'}
                        </span>
                        {section.subSizes?.map((subSize, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 w-6">{subIndex + 1}</span>
                            <input
                              type="range"
                              min="20"
                              max="80"
                              value={subSize}
                              onChange={(e) => updateSubSize(sectionIndex, subIndex, Number(e.target.value))}
                              className="flex-1 h-1"
                            />
                            <span className="text-[10px] text-gray-500 w-8">{Math.round(subSize)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {type === 'fullbleed' && (
              <div className="text-xs text-gray-500 text-center py-4">
                Full image layout has a single cell.
                <br />
                Switch to Rows or Columns for more structure options.
              </div>
            )}

            {/* Preview */}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
              <CellGrid
                layout={layout}
                imageCell={imageCell}
                mode="image"
                onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
              />
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
            >
              Reset to Default
            </button>
          </div>
        )

      case 'alignment':
        return (
          <div className="space-y-3">
            {/* Cell Selector Grid */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select Cell <span className="text-gray-400 font-normal">(none = all cells)</span>
              </label>
              <CellGrid
                layout={layout}
                imageCell={imageCell}
                selectedCell={selectedCell}
                mode="alignment"
                onSelectCell={handleCellSelect}
              />
            </div>

            {/* Selection indicator */}
            <div className="text-xs text-center py-1 bg-gray-50 rounded">
              {selectedCell === null ? (
                <span className="text-gray-600">Editing: <strong>All Cells</strong></span>
              ) : (
                <span className="text-purple-600">
                  Editing: <strong>{cellInfoList.find(c => c.index === selectedCell)?.label || `Cell ${selectedCell}`}</strong>
                </span>
              )}
            </div>

            {/* Alignment Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Horizontal Align</label>
                <div className="flex gap-1">
                  {textAlignOptions.map((align) => {
                    const isActive = selectedCell === null
                      ? textAlign === align.id
                      : getCellAlignment(selectedCell, 'textAlign') === align.id
                    return (
                      <button
                        key={align.id}
                        onClick={() => {
                          if (selectedCell === null) {
                            updateAllCellsAlignment({ textAlign: align.id })
                          } else {
                            updateCellAlignment(selectedCell, { textAlign: align.id })
                          }
                        }}
                        title={align.name}
                        className={`flex-1 px-2 py-2 text-sm rounded ${
                          isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {align.icon}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Align</label>
                <div className="flex gap-1">
                  {verticalAlignOptions.map((align) => {
                    const isActive = selectedCell === null
                      ? textVerticalAlign === align.id
                      : getCellAlignment(selectedCell, 'textVerticalAlign') === align.id
                    return (
                      <button
                        key={align.id}
                        onClick={() => {
                          if (selectedCell === null) {
                            updateAllCellsAlignment({ textVerticalAlign: align.id })
                          } else {
                            updateCellAlignment(selectedCell, { textVerticalAlign: align.id })
                          }
                        }}
                        title={align.name}
                        className={`flex-1 px-2 py-2 text-sm rounded ${
                          isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {align.icon}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick tip */}
            <div className="text-[10px] text-gray-400 text-center">
              Tip: Click a cell to customize it individually, or edit all at once
            </div>
          </div>
        )

      case 'placement':
        return (
          <div className="space-y-3">
            {type === 'fullbleed' ? (
              <div className="text-xs text-gray-500 text-center py-4">
                Full image layout has a single cell.
                <br />
                All text appears in the same area.
                <br />
                Switch to Rows or Columns to place text in different cells.
              </div>
            ) : (
              <>
                {/* Cell Selector Grid */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Cell <span className="text-gray-400 font-normal">(to assign text)</span>
                  </label>
                  <CellGrid
                    layout={layout}
                    imageCell={imageCell}
                    selectedCell={selectedCell}
                    mode="placement"
                    onSelectCell={handleCellSelect}
                    textGroups={textGroups}
                  />
                </div>

                {/* Selection indicator */}
                <div className="text-xs text-center py-1 bg-gray-50 rounded">
                  {selectedCell === null ? (
                    <span className="text-gray-600">Select a cell to assign text groups</span>
                  ) : (
                    <span className="text-purple-600">
                      Assigning to: <strong>{cellInfoList.find(c => c.index === selectedCell)?.label || `Cell ${selectedCell}`}</strong>
                    </span>
                  )}
                </div>

                {/* Text Group Assignment */}
                {onTextGroupsChange && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Text Groups</label>
                    {textGroupDefs.map((group) => {
                      const currentCell = textGroups?.[group.id]?.cell
                      const isAssignedToSelected = selectedCell !== null && currentCell === selectedCell
                      return (
                        <div
                          key={group.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded ${
                            isAssignedToSelected ? 'bg-purple-50' : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-xs text-gray-600">{group.name}</span>
                          <div className="flex items-center gap-1">
                            {selectedCell !== null && (
                              <button
                                onClick={() => {
                                  const newValue = isAssignedToSelected ? null : selectedCell
                                  onTextGroupsChange({ [group.id]: { cell: newValue } })
                                }}
                                className={`px-2 py-1 text-[10px] rounded ${
                                  isAssignedToSelected
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {isAssignedToSelected ? '✓ Here' : '+ Add'}
                              </button>
                            )}
                            <select
                              value={currentCell === null || currentCell === undefined ? 'auto' : currentCell}
                              onChange={(e) => {
                                const value = e.target.value === 'auto' ? null : parseInt(e.target.value)
                                onTextGroupsChange({ [group.id]: { cell: value } })
                              }}
                              className="text-[10px] px-1 py-1 border border-gray-200 rounded bg-white"
                            >
                              <option value="auto">Auto</option>
                              {cellInfoList.map((cell) => (
                                <option key={cell.index} value={cell.index}>
                                  {cell.label} {cell.index === imageCell ? '[img]' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id)
              // Reset cell selection when switching tabs
              if (tab.id !== 'alignment' && tab.id !== 'placement') {
                setSelectedCell(null)
              }
            }}
            className={`flex-1 px-1.5 py-1.5 text-[10px] rounded-md transition-colors flex flex-col items-center gap-0.5 ${
              activeSubTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {renderSubTabContent()}
    </div>
  )
}
