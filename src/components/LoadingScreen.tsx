import React, { VFC, useEffect, useRef, useState } from 'react'

export const LoadingScreen: VFC = () => {
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const onLoad = () => {
      // show "Tap to continue" after resources loaded
      setReady(true)
    }
    const onAppReady = () => setReady(true)

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }

    // allow app to dispatch 'app-assets-ready' when its internal assets are loaded
    window.addEventListener('app-assets-ready', onAppReady as EventListener)

    return () => {
      window.removeEventListener('load', onLoad as any)
      window.removeEventListener('app-assets-ready', onAppReady as EventListener)
    }
  }, [])

  const loaderRef = useRef<HTMLDivElement | null>(null)

  // ensure animation is truly stopped on ready by clearing inline animation
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    if (ready) {
      // clear CSS animation to force-stop across browsers
      el.style.animation = 'none'
      // set final background sizes/positions similar to final keyframe
      el.style.backgroundSize = '8px 100%,8px 4px,8px 4px,8px 100%,8px 4px,8px 4px,8px 100%,8px 4px,8px 4px'
      el.style.backgroundPosition = '0 50%,0 calc(0% - 2px),0 calc(100% + 2px),50% 50%,50% calc(0% - 2px),50% calc(100% + 2px),100% 50%,100% calc(0% - 2px),100% calc(100% + 2px)'
    }
  }, [ready])

  const handleContinue = () => {
    // notify audio to try unmute/play on user gesture
    window.dispatchEvent(new CustomEvent('bg-audio-user-gesture'))
    // play exit animation then unmount
    setExiting(true)
    // match CSS transition duration (360ms)
    setTimeout(() => setVisible(false), 420)
  }

  if (!visible) return null

  return (
    <div
      className={`loading-overlay ${ready ? 'loading--ready' : ''} ${exiting ? 'loading--exiting' : ''}`}
      onClick={ready ? handleContinue : undefined}
      role="button"
    >
      <div ref={loaderRef} className={`loader ${ready ? 'loader--ready' : ''}`}>
        <span className="lbar" />
        <span className="lbar" />
        <span className="lbar" />
      </div>
      {ready && <div className="loader-cta">Tap to continue</div>}
    </div>
  )
}

export default LoadingScreen
