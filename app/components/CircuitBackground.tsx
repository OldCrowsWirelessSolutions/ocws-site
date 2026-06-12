'use client'

import { useEffect, useRef } from 'react'

// PCB circuit trace background — matches the mobile app aesthetic
// Draws horizontal/vertical traces, L-shaped branches, and nodes
// Animates a slow pulse cycling through segments over 3-4 seconds

interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  phase: number    // 0..1 offset into the pulse cycle
  baseAlpha: number
}

interface Node {
  x: number
  y: number
  phase: number
}

function buildCircuit(w: number, h: number): { segments: Segment[]; nodes: Node[] } {
  const segments: Segment[] = []
  const nodes: Node[] = []

  // Snap grid — traces live on a 40px grid
  const STEP = 40
  const cols = Math.ceil(w / STEP) + 1
  const rows = Math.ceil(h / STEP) + 1

  const rand = (min: number, max: number) => Math.random() * (max - min) + min
  const snapX = (i: number) => i * STEP
  const snapY = (j: number) => j * STEP

  // Pick ~20 horizontal traces at random grid rows
  const hRows = new Set<number>()
  while (hRows.size < Math.min(20, rows - 1)) hRows.add(Math.floor(rand(0, rows)))

  // Pick ~15 vertical traces at random grid columns
  const vCols = new Set<number>()
  while (vCols.size < Math.min(15, cols - 1)) vCols.add(Math.floor(rand(0, cols)))

  // Track intersections
  const intersections = new Set<string>()

  // Horizontal segments — full-width spans broken into individual grid cells
  hRows.forEach(row => {
    const y = snapY(row)
    const startCol = 0
    const endCol = cols - 1
    for (let c = startCol; c < endCol; c++) {
      // ~60% chance each cell continues the trace
      if (Math.random() < 0.6) {
        segments.push({
          x1: snapX(c), y1: y,
          x2: snapX(c + 1), y2: y,
          phase: rand(0, 1),
          baseAlpha: rand(0.05, 0.10),
        })
      }
    }
  })

  // Vertical segments
  vCols.forEach(col => {
    const x = snapX(col)
    for (let r = 0; r < rows - 1; r++) {
      if (Math.random() < 0.55) {
        segments.push({
          x1: x, y1: snapY(r),
          x2: x, y2: snapY(r + 1),
          phase: rand(0, 1),
          baseAlpha: rand(0.05, 0.10),
        })
      }
    }
  })

  // L-shaped branches connecting hRows↔vCols
  hRows.forEach(row => {
    vCols.forEach(col => {
      if (Math.random() < 0.18) {
        const x = snapX(col)
        const y = snapY(row)
        // Horizontal arm
        const branchLen = (Math.floor(rand(1, 4))) * STEP * (Math.random() < 0.5 ? 1 : -1)
        const ex = Math.max(0, Math.min(w, x + branchLen))
        segments.push({ x1: x, y1: y, x2: ex, y2: y, phase: rand(0, 1), baseAlpha: rand(0.04, 0.09) })
        // Vertical arm from end of horizontal arm
        const dropLen = (Math.floor(rand(1, 3))) * STEP
        segments.push({ x1: ex, y1: y, x2: ex, y2: Math.min(h, y + dropLen), phase: rand(0, 1), baseAlpha: rand(0.04, 0.09) })
        intersections.add(`${x},${y}`)
        intersections.add(`${ex},${y}`)
      }
    })
  })

  // Nodes at every h×v intersection
  hRows.forEach(row => {
    vCols.forEach(col => {
      const x = snapX(col)
      const y = snapY(row)
      intersections.add(`${x},${y}`)
    })
  })

  // Convert intersection set to node list
  intersections.forEach(key => {
    const [x, y] = key.split(',').map(Number)
    nodes.push({ x, y, phase: rand(0, 1) })
  })

  // Extra scattered small nodes
  for (let i = 0; i < 40; i++) {
    const col = Math.floor(rand(0, cols))
    const row = Math.floor(rand(0, rows))
    nodes.push({ x: snapX(col), y: snapY(row), phase: rand(0, 1) })
  }

  return { segments, nodes }
}

export default function CircuitBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const circuitRef = useRef<{ segments: Segment[]; nodes: Node[] } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0

    function resize() {
      if (!canvas) return
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
      circuitRef.current = buildCircuit(w, h)
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Pulse cycle: 3.5 seconds
    const CYCLE = 3500

    function draw(ts: number) {
      if (!ctx || !circuitRef.current) return
      ctx.clearRect(0, 0, w, h)

      const t = (ts % CYCLE) / CYCLE  // 0..1

      const { segments, nodes } = circuitRef.current

      // Draw segments
      ctx.lineWidth = 1
      segments.forEach(seg => {
        // Phase-shifted sine: each segment has its own offset
        const localT = (t + seg.phase) % 1
        const pulse = 0.5 + 0.5 * Math.sin(localT * Math.PI * 2)
        const alpha = seg.baseAlpha + pulse * 0.06
        ctx.strokeStyle = `rgba(34,214,220,${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach(node => {
        const localT = (t + node.phase) % 1
        const pulse = 0.5 + 0.5 * Math.sin(localT * Math.PI * 2)
        const alpha = 0.08 + pulse * 0.10
        const radius = 1.8 + pulse * 0.8
        ctx.fillStyle = `rgba(34,214,220,${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
