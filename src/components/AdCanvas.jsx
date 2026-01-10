import { forwardRef, useMemo } from 'react'
import { layouts, overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = layouts.find((l) => l.id === state.layout) || layouts[0]
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

  const containerStyle = {
    width: platform.width,
    height: platform.height,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: themeColors.primary,
  }

  const renderBackgroundLayout = () => (
    <>
      {state.image && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${state.image})`,
            backgroundSize: state.imageObjectFit,
            backgroundPosition: state.imagePosition,
            backgroundRepeat: 'no-repeat',
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: layout.textVerticalAlign,
          alignItems: layout.textAlign === 'center' ? 'center' : layout.textAlign === 'right' ? 'flex-end' : 'flex-start',
          padding: '5%',
          textAlign: layout.textAlign,
        }}
      >
        {renderTextContent()}
      </div>
    </>
  )

  const renderVerticalLayout = () => {
    const imageWidth = `${layout.imageProportion}%`
    const textWidth = `${100 - layout.imageProportion}%`
    const isImageLeft = layout.imagePosition === 'left'

    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        {isImageLeft && (
          <div
            style={{
              width: imageWidth,
              height: '100%',
              position: 'relative',
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
                }}
              />
            )}
          </div>
        )}
        <div
          style={{
            width: textWidth,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '5%',
            backgroundColor: themeColors.primary,
          }}
        >
          {renderTextContent()}
        </div>
        {!isImageLeft && (
          <div
            style={{
              width: imageWidth,
              height: '100%',
              position: 'relative',
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
                }}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const renderHorizontalLayout = () => {
    if (layout.splitThirds) {
      return renderSplitThirds()
    }

    const imageHeight = layout.bannerStyle ? `${layout.imageProportion}%` : `${layout.imageProportion}%`
    const textHeight = `${100 - layout.imageProportion}%`
    const isImageTop = layout.imagePosition === 'top'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {isImageTop && (
          <div
            style={{
              height: imageHeight,
              width: '100%',
              position: 'relative',
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
                }}
              />
            )}
          </div>
        )}
        <div
          style={{
            height: textHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: layout.textAlign === 'center' ? 'center' : 'flex-start',
            padding: layout.bannerStyle ? '2%' : '5%',
            backgroundColor: themeColors.primary,
            textAlign: layout.textAlign,
          }}
        >
          {renderTextContent()}
        </div>
        {!isImageTop && (
          <div
            style={{
              height: imageHeight,
              width: '100%',
              position: 'relative',
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
                }}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const renderSplitThirds = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div
        style={{
          height: '33.33%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3%',
          backgroundColor: themeColors.primary,
        }}
      >
        {state.text.title.visible && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.04),
              fontWeight: 700,
              fontFamily: titleFont.family,
              color: getTextColor(state.text.title.color),
              margin: 0,
              textAlign: 'center',
            }}
          >
            {state.text.title.content}
          </h1>
        )}
      </div>
      <div
        style={{
          height: '33.33%',
          width: '100%',
          position: 'relative',
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
            }}
          />
        )}
      </div>
      <div
        style={{
          height: '33.33%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3%',
          backgroundColor: themeColors.primary,
        }}
      >
        {state.text.secondary.visible && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.025),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(state.text.secondary.color),
              margin: 0,
              textAlign: 'center',
            }}
          >
            {state.text.secondary.content}
          </p>
        )}
        {state.text.body.visible && state.text.body.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.02),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(state.text.body.color),
              margin: '0.5em 0 0 0',
              textAlign: 'center',
            }}
          >
            {state.text.body.content}
          </p>
        )}
      </div>
    </div>
  )

  const renderTextContent = () => (
    <div style={{ maxWidth: '90%' }}>
      {state.text.title.visible && (
        <h1
          style={{
            fontSize: Math.round(platform.width * 0.05),
            fontWeight: 700,
            fontFamily: titleFont.family,
            color: getTextColor(state.text.title.color),
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {state.text.title.content}
        </h1>
      )}
      {state.text.secondary.visible && (
        <p
          style={{
            fontSize: Math.round(platform.width * 0.03),
            fontWeight: 600,
            fontFamily: bodyFont.family,
            color: getTextColor(state.text.secondary.color),
            margin: '0.5em 0 0 0',
            lineHeight: 1.4,
          }}
        >
          {state.text.secondary.content}
        </p>
      )}
      {state.text.body.visible && state.text.body.content && (
        <p
          style={{
            fontSize: Math.round(platform.width * 0.022),
            fontWeight: 400,
            fontFamily: bodyFont.family,
            color: getTextColor(state.text.body.color),
            margin: '0.75em 0 0 0',
            lineHeight: 1.5,
          }}
        >
          {state.text.body.content}
        </p>
      )}
    </div>
  )

  const renderLayout = () => {
    switch (layout.category) {
      case 'background':
        return renderBackgroundLayout()
      case 'vertical':
        return renderVerticalLayout()
      case 'horizontal':
        return renderHorizontalLayout()
      default:
        return renderBackgroundLayout()
    }
  }

  return (
    <div ref={ref} style={containerStyle}>
      {renderLayout()}
    </div>
  )
})

export default AdCanvas
