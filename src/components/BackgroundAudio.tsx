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

    // try autoplay unmuted; if blocked, try muted autoplay; if still blocked, wait for user gesture
    const tryPlay = async (wantMuted = false) => {
      audio.muted = wantMuted
      try {
        await audio.play()
        // audio.play succeeded
        setIsPlaying(!audio.paused)
        setMuted(audio.muted)
        window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
        return true
      } catch {
        return false
      }
    }

    ;(async () => {
      const ok = await tryPlay(false)
      if (!ok) {
        // audible autoplay blocked -> try muted autoplay
        const okMuted = await tryPlay(true)
        if (!okMuted) {
          // still blocked; attach a one-time gesture listener to start audio on first user interaction
          const onFirstGesture = async () => {
            try {
              audio.muted = false
              await audio.play()
            } catch {
              // if still fails, at least try muted
              try {
                audio.muted = true
                await audio.play()
              } catch {
                // give up for now
              }
            }
            setIsPlaying(!audio.paused)
            setMuted(audio.muted)
            window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
            window.removeEventListener('click', onFirstGesture)
            window.removeEventListener('keydown', onFirstGesture)
            window.removeEventListener('touchstart', onFirstGesture)
          }

          window.addEventListener('click', onFirstGesture, { once: true })
          window.addEventListener('keydown', onFirstGesture, { once: true })
          window.addEventListener('touchstart', onFirstGesture, { once: true })
        }
      }
    })()

    // sync state on audio events
    const onPlay = () => {
      setIsPlaying(true)
      setMuted(audio.muted)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: true, muted: audio.muted } }))
    }
    const onPause = () => {
      setIsPlaying(false)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: false, muted: audio.muted } }))
    }
    const onVolume = () => {
      setMuted(audio.muted)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('volumechange', onVolume)

    // external commands
    const onToggle = () => {
      if (!audio) return
      audio.muted = !audio.muted
      // if unmuting and not playing, try to play
      if (!audio.muted && audio.paused) {
        audio.play().catch(() => {})
      }
      setMuted(audio.muted)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
    }

    const onRequest = () => {
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
    }

    const onUserGesture = async () => {
      // user interacted via loading screen - try to unmute and play
      try {
        audio.muted = false
        await audio.play()
      } catch {
        try {
          audio.muted = true
          await audio.play()
        } catch {
          // ignore
        }
      }
      setIsPlaying(!audio.paused)
      setMuted(audio.muted)
      window.dispatchEvent(new CustomEvent('bg-audio-state', { detail: { isPlaying: !audio.paused, muted: audio.muted } }))
    }

  window.addEventListener('bg-audio-toggle-mute', onToggle as EventListener)
  window.addEventListener('bg-audio-request-state', onRequest as EventListener)
  window.addEventListener('bg-audio-user-gesture', onUserGesture as EventListener)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('volumechange', onVolume)
  window.removeEventListener('bg-audio-toggle-mute', onToggle as EventListener)
  window.removeEventListener('bg-audio-request-state', onRequest as EventListener)
  window.removeEventListener('bg-audio-user-gesture', onUserGesture as EventListener)
    }
  }, [])

  // no visible controls here — header UI handles mute toggle
  return <audio ref={audioRef} src="/web-backgroundmusic.mp3" preload="auto" />
}

export default BackgroundAudio
