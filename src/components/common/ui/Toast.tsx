import { DetailedError, ErrorType } from '@/types/errors'

interface ErrorToastProps {
  error: DetailedError
  onClose: () => void
}

export function ErrorToast({ error, onClose }: ErrorToastProps) {
  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.VALIDATION: return '⚠️'
      case ErrorType.UPLOAD: return '📤'
      case ErrorType.DATABASE: return '💾'
      case ErrorType.NETWORK: return '🌐'
      case ErrorType.PERMISSION: return '🔒'
      case ErrorType.FILE_SIZE: return '📏'
      case ErrorType.FILE_TYPE: return '📄'
      default: return '❌'
    }
  }

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.VALIDATION: return 'bg-yellow-600/95'
      case ErrorType.UPLOAD: return 'bg-orange-600/95'
      case ErrorType.DATABASE: return 'bg-red-600/95'
      case ErrorType.NETWORK: return 'bg-purple-600/95'
      case ErrorType.PERMISSION: return 'bg-red-700/95'
      case ErrorType.FILE_SIZE: return 'bg-orange-500/95'
      case ErrorType.FILE_TYPE: return 'bg-blue-600/95'
      default: return 'bg-red-600/95'
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md px-4 py-3 rounded-lg shadow-lg flex flex-col space-y-2 animate-fade-in ${getErrorColor(error.type)}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getErrorIcon(error.type)}</span>
          <div className="text-sm text-white">
            <p className="font-semibold">Error en {error.step}</p>
            {error.itemName && (
              <p className="text-xs opacity-90">Item: {error.itemName}</p>
            )}
            {error.fileName && (
              <p className="text-xs opacity-90">Archivo: {error.fileName}</p>
            )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Message */}
      <div className="text-sm text-white">
        <p>{error.userMessage}</p>
      </div>

      {/* Suggested Action */}
      {error.suggestedAction && (
        <div className="text-xs text-white/90 bg-black/20 rounded p-2">
          <strong>💡 Sugerencia:</strong> {error.suggestedAction}
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-white/70">
          <summary className="cursor-pointer">Detalles técnicos</summary>
          <pre className="mt-1 whitespace-pre-wrap break-words">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

interface SuccessToastProps {
  message: string
  onClose: () => void
}

export function SuccessToast({ message, onClose }: SuccessToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3 animate-fade-in bg-green-600/95">
      <span className="text-lg">✅</span>
      <div className="flex-1 text-sm text-white">
        <p className="font-semibold">Éxito</p>
        <p>{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  )
}