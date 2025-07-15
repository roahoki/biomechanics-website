interface DeleteModalProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function DeleteModal({ isOpen, onConfirm, onCancel }: DeleteModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ¿Eliminar link?
                </h3>
                <p className="text-gray-600 mb-6">
                    ¿Estás seguro que quieres eliminar este link? Esta acción no se puede deshacer.
                </p>
                <div className="flex space-x-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
