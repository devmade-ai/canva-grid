import { useCallback, useRef } from 'react'

export default function ImageUploader({ image, onImageChange, objectFit, onObjectFitChange, position, onPositionChange }) {
  const fileInputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageChange])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageChange])

  const handleRemove = useCallback(() => {
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageChange])

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Image</h3>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="space-y-2">
            <img
              src={image}
              alt="Preview"
              className="max-h-24 mx-auto rounded"
            />
            <p className="text-xs text-gray-500">Click or drop to replace</p>
          </div>
        ) : (
          <div className="py-4">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Drop image or click to upload</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {image && (
        <>
          <button
            onClick={handleRemove}
            className="w-full text-sm text-red-600 hover:text-red-700 py-1"
          >
            Remove Image
          </button>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Object Fit</label>
            <div className="flex gap-2">
              {['cover', 'contain'].map((fit) => (
                <button
                  key={fit}
                  onClick={() => onObjectFitChange(fit)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded capitalize ${
                    objectFit === fit
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {['top', 'center', 'bottom'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => onPositionChange(pos)}
                  className={`px-2 py-1.5 text-xs rounded capitalize ${
                    position === pos
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
