'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import GetCreditsClient from './GetCreditsClient'

export default function GetCreditsPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <GetCreditsClient />
    </Suspense>
  )
}

function LoadingShell() {
  return (
    <div
      style={{ background: '#0D1520', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", fontSize: 14 }}>
        Loading…
      </div>
    </div>
  )
}
