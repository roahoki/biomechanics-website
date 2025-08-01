import { useEffect, useRef } from 'react'

interface UseSwipeGestureProps {
  onSwipeDown?: () => void
  onSwipeUp?: () => void
  threshold?: number
  enabled?: boolean
  targetRef?: React.RefObject<HTMLDivElement | HTMLElement | null> | null
}

export function useSwipeGesture({
  onSwipeDown,
  onSwipeUp,
  threshold = 50,
  enabled = true,
  targetRef = null
}: UseSwipeGestureProps) {
  const startY = useRef<number | null>(null)
  const startX = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      startY.current = touchEvent.touches[0].clientY;
      startX.current = touchEvent.touches[0].clientX;
    }

    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (startY.current === null || startX.current === null) return;

      const endY = touchEvent.changedTouches[0].clientY;
      const endX = touchEvent.changedTouches[0].clientX;
      
      const deltaY = endY - startY.current;
      const deltaX = endX - startX.current;

      // Solo procesar si el movimiento vertical es mayor que el horizontal
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }

      startY.current = null;
      startX.current = null;
    }

    // Determinar el elemento target para los eventos
    const target = targetRef?.current || document;
    
    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchend', handleTouchEnd);
    }
  }, [onSwipeDown, onSwipeUp, threshold, enabled, targetRef])
}
