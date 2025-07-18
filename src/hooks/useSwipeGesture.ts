import { useEffect, useRef } from 'react'

interface UseSwipeGestureProps {
  onSwipeDown?: () => void
  onSwipeUp?: () => void
  threshold?: number
  enabled?: boolean
}

export function useSwipeGesture({
  onSwipeDown,
  onSwipeUp,
  threshold = 50,
  enabled = true
}: UseSwipeGestureProps) {
  const startY = useRef<number | null>(null)
  const startX = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY
      startX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startY.current === null || startX.current === null) return

      const endY = e.changedTouches[0].clientY
      const endX = e.changedTouches[0].clientX
      
      const deltaY = endY - startY.current
      const deltaX = endX - startX.current

      // Solo procesar si el movimiento vertical es mayor que el horizontal
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp()
        }
      }

      startY.current = null
      startX.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeDown, onSwipeUp, threshold, enabled])
}
