import { forwardRef, useMemo } from 'react'
import { overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'

const defaultTextLayer = { content: '', visible: false, color: 'secondary', size: 1 }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = state.layout
  const textGroups = state.textGroups || {}
  const titleFont = fonts.find((f) => f.id === state.fonts.title) || fonts[0]
  const bodyFont = fonts.find((f) => f.id === state.fonts.body) || fonts[0]

  const themeColors = useMemo(() => ({
    primary: state.theme.primary,
    secondary: state.theme.secondary,
    accent: state.theme.accent,
  }), [state.theme])

  const overlayColor = themeColors[state.overlay.color] || themeColors.primary
  const overlayType = overlayTypes.find((o) => o.id === state.overlay.type) || overlayTypes[0]
  const overlayStyle = overlayType.getCss(hexToRgb(overlayColor), state.overlay.opacity)

  const getTextColor = (colorKey) => themeColors[colorKey] || themeColors.secondary
  const getTextLayer = (layerId) => state.text?.[layerId] || defaultTextLayer

  const containerStyle = {
    width: platform.width,
    height: platform.height,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: themeColors.primary,
  }

  // Logo position styles
  const getLogoPositionStyle = () => {
    const logoWidth = platform.width * (state.logoSize || 0.15)
    const margin = platform.width * 0.03

    const baseStyle = {
      position: 'absolute',
      width: logoWidth,
      height: 'auto',
      maxHeight: logoWidth,
      objectFit: 'contain',
      zIndex: 10,
    }

    switch (state.logoPosition) {
      case 'top-left':
        return { ...baseStyle, top: margin, left: margin }
      case 'top-right':
        return { ...baseStyle, top: margin, right: margin }
      case 'bottom-left':
        return { ...baseStyle, bottom: margin, left: margin }
      case 'bottom-right':
        return { ...baseStyle, bottom: margin, right: margin }
      case 'center':
        return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return { ...baseStyle, bottom: margin, right: margin }
    }
  }

  // Render logo
  const renderLogo = () => {
    if (!state.logo) return null
    return (
      <img
        src={state.logo}
        alt="Logo"
        style={getLogoPositionStyle()}
      />
    )
  }

  // Render image with overlay
  const renderImage = (style = {}) => (
    <div style={{ position: 'relative', backgroundColor: themeColors.primary, ...style }}>
      {state.image && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${state.image})`,
            backgroundSize: state.imageObjectFit,
            backgroundPosition: state.imagePosition,
            backgroundRepeat: 'no-repeat',
            filter: state.imageGrayscale ? 'grayscale(100%)' : 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayStyle,
        }}
      />
    </div>
  )

  // Get alignment CSS values
  const getAlignItems = (align) => {
    switch (align) {
      case 'left': return 'flex-start'
      case 'right': return 'flex-end'
      default: return 'center'
    }
  }

  const getJustifyContent = (align) => {
    switch (align) {
      case 'start': return 'flex-start'
      case 'end': return 'flex-end'
      default: return 'center'
    }
  }

  // Get cell-specific alignment with fallback to global
  const getCellTextAlign = (cellIndex) => {
    const cellAlign = layout.cellAlignments?.[cellIndex]?.textAlign
    return cellAlign !== null && cellAlign !== undefined ? cellAlign : layout.textAlign
  }

  const getCellVerticalAlign = (cellIndex) => {
    const cellAlign = layout.cellAlignments?.[cellIndex]?.textVerticalAlign
    return cellAlign !== null && cellAlign !== undefined ? cellAlign : layout.textVerticalAlign
  }

  // Get imageCells array with default
  const imageCells = layout.imageCells || [0]

  // Check if a cell has image overlay
  const cellHasImage = (index) => imageCells.includes(index)

  // Find the first cell without image (for auto text placement)
  const getFirstNonImageCellIndex = () => {
    for (let i = 0; i < layout.sections; i++) {
      if (!cellHasImage(i)) return i
    }
    return -1 // All cells have image
  }

  // Get text groups assigned to a specific cell
  // Returns array of group IDs that should render in this cell
  const getGroupsForCell = (cellIndex, onImageLayer) => {
    const groups = []
    const groupIds = ['titleGroup', 'bodyGroup', 'cta', 'footnote']
    const hasImage = cellHasImage(cellIndex)

    for (const groupId of groupIds) {
      const assignedCell = textGroups[groupId]?.cell

      if (assignedCell !== null && assignedCell !== undefined) {
        // Explicitly assigned to a cell
        if (assignedCell === cellIndex) {
          groups.push(groupId)
        }
      } else {
        // Auto assignment based on layout
        if (layout.splitType === 'none') {
          // Fullbleed: all groups on the single layer
          groups.push(groupId)
        } else {
          // Split layout: distribute based on image coverage
          const firstNonImageCell = getFirstNonImageCellIndex()
          const allCellsHaveImage = firstNonImageCell === -1

          if (allCellsHaveImage) {
            // All cells have image: put text on first image cell
            if (cellIndex === imageCells[0] && onImageLayer) {
              groups.push(groupId)
            }
          } else if (hasImage && onImageLayer) {
            // Cell has image: titleGroup and cta go on image
            if (groupId === 'titleGroup' || groupId === 'cta') {
              groups.push(groupId)
            }
          } else if (!hasImage && !onImageLayer && cellIndex === firstNonImageCell) {
            // First non-image cell gets remaining groups
            if (groupId === 'bodyGroup' || groupId === 'footnote') {
              groups.push(groupId)
            }
            // If no cells have image, first cell gets all
            if (imageCells.length === 0) {
              groups.push(groupId)
            }
          }
        }
      }
    }
    return groups
  }

  // Render title group (title + tagline)
  const renderTitleGroup = (withShadow = false) => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const shadowStyle = withShadow ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}
    const taglineShadow = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    return (
      <>
        {title.visible && title.content && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.05 * (title.size || 1)),
              fontWeight: 700,
              fontFamily: titleFont.family,
              color: getTextColor(title.color),
              margin: 0,
              lineHeight: 1.2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {title.content}
          </h1>
        )}
        {tagline.visible && tagline.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028 * (tagline.size || 1)),
              fontWeight: 500,
              fontFamily: bodyFont.family,
              color: getTextColor(tagline.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...taglineShadow,
            }}
          >
            {tagline.content}
          </p>
        )}
      </>
    )
  }

  // Render body group (body heading + body text)
  const renderBodyGroup = (withShadow = false) => {
    const bodyHeading = getTextLayer('bodyHeading')
    const bodyTextLayer = getTextLayer('bodyText')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    return (
      <>
        {bodyHeading.visible && bodyHeading.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.026 * (bodyHeading.size || 1)),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyHeading.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {bodyHeading.content}
          </p>
        )}
        {bodyTextLayer.visible && bodyTextLayer.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (bodyTextLayer.size || 1)),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyTextLayer.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {bodyTextLayer.content}
          </p>
        )}
      </>
    )
  }

  // Render CTA
  const renderCta = (withShadow = false) => {
    const cta = getTextLayer('cta')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    if (!cta.visible || !cta.content) return null
    return (
      <p
        style={{
          fontSize: Math.round(platform.width * 0.028 * (cta.size || 1)),
          fontWeight: 600,
          fontFamily: bodyFont.family,
          color: getTextColor(cta.color),
          margin: '0.8em 0 0 0',
          lineHeight: 1.3,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          ...shadowStyle,
        }}
      >
        {cta.content}
      </p>
    )
  }

  // Render footnote
  const renderFootnote = (withShadow = false) => {
    const footnote = getTextLayer('footnote')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    if (!footnote.visible || !footnote.content) return null
    return (
      <p
        style={{
          fontSize: Math.round(platform.width * 0.015 * (footnote.size || 1)),
          fontWeight: 400,
          fontFamily: bodyFont.family,
          color: getTextColor(footnote.color),
          margin: '1em 0 0 0',
          lineHeight: 1.3,
          opacity: 0.8,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          ...shadowStyle,
        }}
      >
        {footnote.content}
      </p>
    )
  }

  // Render text groups for a specific cell
  const renderTextGroupsForCell = (cellIndex, isImageCell) => {
    const groups = getGroupsForCell(cellIndex, isImageCell)
    const withShadow = isImageCell

    return (
      <div style={{ maxWidth: '90%', overflow: 'hidden' }}>
        {groups.includes('titleGroup') && renderTitleGroup(withShadow)}
        {groups.includes('bodyGroup') && renderBodyGroup(withShadow)}
        {groups.includes('cta') && renderCta(withShadow)}
        {groups.includes('footnote') && renderFootnote(withShadow)}
      </div>
    )
  }

  // Render all text content (for fullbleed - all groups)
  const renderAllText = () => {
    return (
      <div style={{ maxWidth: '90%', overflow: 'hidden' }}>
        {renderTitleGroup(true)}
        {renderBodyGroup(true)}
        {renderCta(true)}
        {renderFootnote(true)}
      </div>
    )
  }

  // Render fullbleed layout (no split)
  const renderFullbleed = () => (
    <>
      {renderImage({ position: 'absolute', inset: 0 })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: getJustifyContent(layout.textVerticalAlign),
          alignItems: getAlignItems(layout.textAlign),
          padding: '5%',
          textAlign: layout.textAlign,
        }}
      >
        {renderAllText()}
      </div>
    </>
  )

  // Calculate the bounding box for image cells (for spanning image across multiple cells)
  const getImageSpanBounds = () => {
    if (imageCells.length === 0) return null
    const { splitType, sections } = layout
    const isVertical = splitType === 'vertical'
    const cellSize = 100 / sections

    const minCell = Math.min(...imageCells)
    const maxCell = Math.max(...imageCells)

    if (isVertical) {
      // Columns: left/right positioning
      return {
        left: `${minCell * cellSize}%`,
        right: `${(sections - maxCell - 1) * cellSize}%`,
        top: 0,
        bottom: 0,
      }
    } else {
      // Rows: top/bottom positioning
      return {
        top: `${minCell * cellSize}%`,
        bottom: `${(sections - maxCell - 1) * cellSize}%`,
        left: 0,
        right: 0,
      }
    }
  }

  // Render the spanning image layer (positioned absolutely over image cells)
  const renderSpanningImage = () => {
    const bounds = getImageSpanBounds()
    if (!bounds) return null

    return (
      <div
        style={{
          position: 'absolute',
          ...bounds,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {state.image && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${state.image})`,
              backgroundSize: state.imageObjectFit,
              backgroundPosition: state.imagePosition,
              backgroundRepeat: 'no-repeat',
              filter: state.imageGrayscale ? 'grayscale(100%)' : 'none',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayStyle,
          }}
        />
      </div>
    )
  }

  // Render cell content for split layout (without image - image is rendered separately as spanning layer)
  const renderCellContentSplit = (cellIndex) => {
    const cellTextAlign = getCellTextAlign(cellIndex)
    const cellVerticalAlign = getCellVerticalAlign(cellIndex)
    const hasImage = cellHasImage(cellIndex)
    const textGroupsOnImage = hasImage ? getGroupsForCell(cellIndex, true) : []
    const textGroupsOnBackground = getGroupsForCell(cellIndex, false)

    return (
      <>
        {/* Background for non-image cells */}
        {!hasImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />
        )}

        {/* Text on image layer */}
        {hasImage && textGroupsOnImage.length > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: getJustifyContent(cellVerticalAlign),
              alignItems: getAlignItems(cellTextAlign),
              padding: '5%',
              textAlign: cellTextAlign,
              zIndex: 2,
            }}
          >
            {renderTextGroupsForCell(cellIndex, true)}
          </div>
        )}

        {/* Text on background (non-image cells) */}
        {!hasImage && textGroupsOnBackground.length > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: getJustifyContent(cellVerticalAlign),
              alignItems: getAlignItems(cellTextAlign),
              padding: '5%',
              textAlign: cellTextAlign,
            }}
          >
            {renderTextGroupsForCell(cellIndex, false)}
          </div>
        )}
      </>
    )
  }

  // Render split layout (vertical or horizontal)
  const renderSplitLayout = () => {
    const { splitType, sections } = layout
    const isVertical = splitType === 'vertical'
    const flexDirection = isVertical ? 'row' : 'column'

    // Equal sizing for all cells
    const cellSize = `${100 / sections}%`

    const sectionElements = []

    for (let i = 0; i < sections; i++) {
      const sizeStyle = {
        flex: `0 0 ${cellSize}`,
        position: 'relative',
        overflow: 'hidden',
      }

      sectionElements.push(
        <div key={i} style={sizeStyle}>
          {renderCellContentSplit(i)}
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {/* Background layer */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />

        {/* Spanning image layer */}
        {renderSpanningImage()}

        {/* Cell grid for text positioning */}
        <div style={{ position: 'relative', display: 'flex', flexDirection, height: '100%', width: '100%', zIndex: 2 }}>
          {sectionElements}
        </div>
      </div>
    )
  }

  // Main render logic
  const renderLayout = () => {
    if (layout.splitType === 'none') {
      return renderFullbleed()
    }
    return renderSplitLayout()
  }

  return (
    <div ref={ref} style={containerStyle}>
      {renderLayout()}
      {renderLogo()}
    </div>
  )
})

export default AdCanvas
