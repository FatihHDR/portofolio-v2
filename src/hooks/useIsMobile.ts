import { useEffect, useState } from 'react'

// Simple, robust mobile detection hook using matchMedia + resize fallback
export default function useIsMobile() {
  const get = () => {
    if (typeof window === 'undefined') return false
    try {
      // prefer pointer:coarse or small viewport width
      return (
        window.matchMedia &&
        (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 900px)').matches)
      ) || window.innerWidth <= 900
    } catch (e) {
      return window.innerWidth <= 900
    }
  }

  const [isMobile, setIsMobile] = useState<boolean>(get)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mmCoarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null
    const mmNarrow = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null

    const onChange = () => setIsMobile(get())

    try {
      mmCoarse && mmCoarse.addEventListener && mmCoarse.addEventListener('change', onChange)
    } catch (e) {
      // some browsers use addListener
      mmCoarse && mmCoarse.addListener && mmCoarse.addListener(onChange)
    }
    try {
      mmNarrow && mmNarrow.addEventListener && mmNarrow.addEventListener('change', onChange)
    } catch (e) {
      mmNarrow && mmNarrow.addListener && mmNarrow.addListener(onChange)
    }
    window.addEventListener('resize', onChange)

    return () => {
      try {
        mmCoarse && mmCoarse.removeEventListener && mmCoarse.removeEventListener('change', onChange)
      } catch (e) {
        mmCoarse && mmCoarse.removeListener && mmCoarse.removeListener(onChange)
      }
      try {
        mmNarrow && mmNarrow.removeEventListener && mmNarrow.removeEventListener('change', onChange)
      } catch (e) {
        mmNarrow && mmNarrow.removeListener && mmNarrow.removeListener(onChange)
      }
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return isMobile
}
