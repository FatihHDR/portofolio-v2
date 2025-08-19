import React, { VFC } from 'react'

export const Hero: VFC = () => {
  // request initial audio state so bars can reflect playing/muted
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('bg-audio-request-state'))
  }, [])

  // reflect state locally for animation
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)

  React.useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as { isPlaying: boolean; muted: boolean }
      setPlaying(!!d.isPlaying)
      setMuted(!!d.muted)
    }
    window.addEventListener('bg-audio-state', handler as EventListener)
    return () => window.removeEventListener('bg-audio-state', handler as EventListener)
  }, [])

  const toggleMute = () => {
    window.dispatchEvent(new CustomEvent('bg-audio-toggle-mute'))
  }

  return (
    <div className="overlay" aria-hidden>
      <header className="overlay__center">
  <h1 className="hero__title">FATAHILLAH AL-FATIH</h1>
        <p className="hero__subtitle">
          CREATIVE&nbsp;&nbsp;|&nbsp;&nbsp;TECHNOLOGIST&nbsp;&nbsp;|&nbsp;&nbsp;DEVELOPER
        </p>

        <div className="header-sound" onClick={toggleMute} role="button" aria-label={muted ? 'Unmute' : 'Mute'}>
          <div className={`footer-sound ${playing && !muted ? 'playing' : 'stopped'}`}>
            <span id="bar-1" className="sbar" />
            <span id="bar-2" className="sbar" />
            <span id="bar-3" className="sbar" />
            <span id="bar-4" className="sbar" />
          </div>
        </div>
      </header>

  <nav className="overlay__bottom" aria-label="Primary">
        <a href="#work" className="nav__link">WORK</a>
        <a href="#prototypes" className="nav__link">PROTOTYPES</a>
        <a href="#art" className="nav__link">ART</a>
        <a href="#press" className="nav__link">PRESS</a>
        <a href="#info" className="nav__link">INFO</a>
        <a href="#reel" className="nav__link">REEL</a>
      </nav>
    </div>
  )
}
