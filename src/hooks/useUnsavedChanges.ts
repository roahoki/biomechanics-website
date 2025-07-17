import { useEffect, useState } from 'react'

export function useUnsavedChanges(currentData: any, originalData: any) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
        setHasUnsavedChanges(hasChanges)
    }, [currentData, originalData])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = '¿Estás seguro de que quieres salir? Tienes cambios sin guardar.'
                return e.returnValue
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    return { hasUnsavedChanges }
}
