import { useState } from 'react'

export function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false)

    const shortcuts = [
        { keys: 'Ctrl/⌘ + S', description: 'Guardar cambios' },
        { keys: 'Ctrl/⌘ + N', description: 'Agregar nuevo link' },
        { keys: 'Ctrl/⌘ + Shift + N', description: 'Agregar nuevo producto' },
        { keys: 'Ctrl/⌘ + P', description: 'Vista previa' },
        { keys: 'Escape', description: 'Cerrar modales' },
    ]

    return (
        <>
            {/* Botón de ayuda */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
                title="Atajos de teclado"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Modal de atajos */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Atajos de Teclado</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {shortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-700 rounded-md">
                                    <span className="text-gray-300">{shortcut.description}</span>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-200 rounded border border-gray-500">
                                        {shortcut.keys}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-900/30 rounded-md border border-blue-700">
                            <p className="text-sm text-blue-200">
                                💡 <strong>Consejo:</strong> Usa estos atajos para trabajar más rápido y ser más productivo.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
