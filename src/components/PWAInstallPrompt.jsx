import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Prevent the default browser prompt
      e.preventDefault()
      // Save the event for later
      setInstallPrompt(e)
      // Show our custom prompt
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Hide if already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    // Show the browser's install prompt
    installPrompt.prompt()

    // Wait for user response
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't clear installPrompt - user might want to install later via browser menu
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
            <img src="/social-ad-creator/icon.svg" alt="" className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-ui-text">Install App</h3>
            <p className="text-xs text-ui-text-muted mt-0.5">Add to your home screen for quick access.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-ui-text-muted bg-zinc-100 dark:bg-dark-subtle hover:bg-zinc-200 dark:hover:bg-dark-elevated rounded-lg transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
