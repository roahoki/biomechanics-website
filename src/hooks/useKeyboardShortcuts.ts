import { useEffect } from 'react'

interface KeyboardShortcuts {
    onSave?: () => void
    onAddLink?: () => void
    onAddProduct?: () => void
    onPreview?: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + S para guardar
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault()
                shortcuts.onSave?.()
                return
            }

            // Ctrl/Cmd + N para nuevo link
            if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !event.shiftKey) {
                event.preventDefault()
                shortcuts.onAddLink?.()
                return
            }

            // Ctrl/Cmd + Shift + N para nuevo producto
            if ((event.ctrlKey || event.metaKey) && event.key === 'N' && event.shiftKey) {
                event.preventDefault()
                shortcuts.onAddProduct?.()
                return
            }

            // Ctrl/Cmd + P para preview
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault()
                shortcuts.onPreview?.()
                return
            }
        }

        document.addEventListener('keydown', handleKeydown)
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [shortcuts])
}
