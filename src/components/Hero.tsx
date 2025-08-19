import React, { VFC } from 'react'

export const Hero: VFC = () => {
  return (
    <div className="overlay" aria-hidden>
      <header className="overlay__center">
  <h1 className="hero__title">FATAHILLAH AL-FATIH</h1>
        <p className="hero__subtitle">
          CREATIVE\u00A0\u00A0|\u00A0\u00A0TECHNOLOGIST\u00A0\u00A0|\u00A0\u00A0DEVELOPER
        </p>
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
