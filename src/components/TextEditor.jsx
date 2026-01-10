const colorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

const textLayers = [
  { id: 'title', label: 'Title', placeholder: 'Enter title...' },
  { id: 'secondary', label: 'Subtitle', placeholder: 'Enter subtitle...' },
  { id: 'body', label: 'Body', placeholder: 'Enter body text...' },
]

export default function TextEditor({ text, onTextChange, theme }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Text</h3>

      {textLayers.map((layer) => (
        <div key={layer.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">{layer.label}</label>
            <button
              onClick={() => onTextChange(layer.id, { visible: !text[layer.id].visible })}
              className={`text-xs px-2 py-0.5 rounded ${
                text[layer.id].visible
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {text[layer.id].visible ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {layer.id === 'body' ? (
            <textarea
              value={text[layer.id].content}
              onChange={(e) => onTextChange(layer.id, { content: e.target.value })}
              placeholder={layer.placeholder}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              type="text"
              value={text[layer.id].content}
              onChange={(e) => onTextChange(layer.id, { content: e.target.value })}
              placeholder={layer.placeholder}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          <div className="flex gap-1">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => onTextChange(layer.id, { color: color.id })}
                title={color.name}
                className={`w-6 h-6 rounded border-2 ${
                  text[layer.id].color === color.id
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: theme[color.id] }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
