interface UnsavedChangesIndicatorProps {
    hasUnsavedChanges: boolean
    isSubmitting: boolean
}

export function UnsavedChangesIndicator({ hasUnsavedChanges, isSubmitting }: UnsavedChangesIndicatorProps) {
    if (!hasUnsavedChanges && !isSubmitting) return null

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`
                px-4 py-2 rounded-lg shadow-lg border-l-4 backdrop-blur-sm
                ${hasUnsavedChanges && !isSubmitting 
                    ? 'bg-yellow-900/90 border-yellow-500 text-yellow-200' 
                    : 'bg-green-900/90 border-green-500 text-green-200'
                }
                transition-all duration-300 transform
            `}>
                <div className="flex items-center space-x-2">
                    {isSubmitting ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm font-medium">Guardando cambios...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-sm font-medium">Cambios sin guardar</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
