import { useEffect, useState } from 'react'

export type DemoSession = {
  token: string
  accessLevel: 'fledgling' | 'nest' | 'flock' | 'full'
  expiresAt: number
  allowPDF: boolean
  allowReckoning: boolean
  usesRemaining: number | 'unlimited'
}

export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('corvus_demo_session')
    if (!raw) return
    try {
      const parsed: DemoSession = JSON.parse(raw)
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem('corvus_demo_session')
        return
      }
      setSession(parsed)
      setIsDemo(true)
    } catch {
      sessionStorage.removeItem('corvus_demo_session')
    }
  }, [])

  function clearDemoSession() {
    sessionStorage.removeItem('corvus_demo_session')
    setSession(null)
    setIsDemo(false)
  }

  return {
    isDemo,
    session,
    isFledgling: session?.accessLevel === 'fledgling',
    canRunReckoning: session?.allowReckoning ?? false,
    canDownloadPDF: session?.allowPDF ?? false,
    clearDemoSession,
  }
}
