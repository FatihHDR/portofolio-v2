import React, { VFC, useEffect, useRef, useState } from 'react'

export const BackgroundAudio: VFC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = true
    audio.volume = 0.2

    // First try to autoplay unmuted. If blocked, try muted autoplay so the page still "plays".
    const tryPlay = async (wantMuted = false) => {
      audio.muted = wantMuted
      try {
        await audio.play()
        setIsPlaying(true)
        setMuted(audio.muted)
        window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: true, muted: audio.muted } }))
        return true
      } catch {
        return false
      }
    }

    ;(async () => {
      const ok = await tryPlay(false)
      if (!ok) {
        // browsers often block audible autoplay, try muted autoplay
        await tryPlay(true)
      }
    })()

    // event handlers
    const onToggle = () => {
      if (!audio) return
      audio.muted = !audio.muted
      setMuted(audio.muted)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying, muted: audio.muted } }))
    }

    const onRequest = () => {
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying, muted: audio.muted } }))
    }

    window.addEventListener('bg-audio-toggle-mute', onToggle as EventListener)
    window.addEventListener('bg-audio-request-state', onRequest as EventListener)

    return () => {
      window.removeEventListener('bg-audio-toggle-mute', onToggle as EventListener)
      window.removeEventListener('bg-audio-request-state', onRequest as EventListener)
    }
  }, [])

  // no visible controls here — header UI handles mute toggle
  return <audio ref={audioRef} src="/web-backgroundmusic.mp3" preload="auto" />
}

export default BackgroundAudio
