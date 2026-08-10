import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'ttf-theme'
export const THEME_EVENT = 'ttf-theme-change'

/**
 * Tracks whether dark mode is active. `null` until mounted (server HTML
 * carries no theme state), then live-updates on every toggle.
 */
export function useIsDark(): boolean | null {
  const [dark, setDark] = useState<boolean | null>(null)
  useEffect(() => {
    const update = () =>
      setDark(document.documentElement.classList.contains('dark'))
    update()
    window.addEventListener(THEME_EVENT, update)
    return () => window.removeEventListener(THEME_EVENT, update)
  }, [])
  return dark
}

/**
 * Inline script injected into <head> so the right theme class is on <html>
 * before first paint (no flash). Falls back to the OS preference.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;if(d){c.add('dark')}else{c.remove('dark')}}catch(e){}})()`

function toggleTheme() {
  const root = document.documentElement
  const dark = root.classList.toggle('dark')
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // storage unavailable (private mode) — theme still toggles for the session
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { dark } }))
}

/**
 * Sun/moon toggle. Both icons are always rendered and CSS decides which one
 * shows, so server HTML never mismatches the client theme; aria-pressed is
 * attached after mount (the prerendered HTML can't know the visitor's theme).
 */
export function ThemeToggle() {
  const dark = useIsDark()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Night sky theme"
      aria-pressed={dark ?? undefined}
      title="Day / night sky"
      className="btn-3d rounded-md border border-card-border bg-card p-2.5 text-ink transition hover:text-accent md:p-2"
    >
      {/* sun — shown in light mode */}
      <svg
        className="h-6 w-6 dark:hidden md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
      </svg>
      {/* moon + stars — shown in dark mode */}
      <svg
        className="hidden h-6 w-6 dark:block md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z" />
        <path d="M17 3.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
      </svg>
    </button>
  )
}
