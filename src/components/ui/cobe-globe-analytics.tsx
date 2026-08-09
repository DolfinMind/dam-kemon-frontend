"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import createGlobe from "cobe"

interface PriceDropMarker {
  id: string
  location: [number, number]
  price: number
  drop: number
}

interface GlobeAnalyticsProps {
  markers?: PriceDropMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PriceDropMarker[] = [
  { id: "deal-1", location: [40.71, -74.01], price: 84990, drop: 12 },
  { id: "deal-2", location: [51.51, -0.13], price: 69990, drop: 8 },
  { id: "deal-3", location: [35.68, 139.65], price: 42990, drop: 15 },
  { id: "deal-4", location: [48.86, 2.35], price: 28990, drop: 6 },
  { id: "deal-5", location: [-33.87, 151.21], price: 17990, drop: 18 },
  { id: "deal-6", location: [52.52, 13.41], price: 12990, drop: 9 },
]

export function GlobeAnalytics({
  markers: initialMarkers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeAnalyticsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const [data, setData] = useState(initialMarkers)

  useEffect(() => setData(initialMarkers), [initialMarkers])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setData((previous) => previous.map((marker) => ({
        ...marker,
        price: Math.max(0, marker.price + Math.floor(Math.random() * 601) - 300),
        drop: Math.max(1, Math.min(25, marker.drop + Math.floor(Math.random() * 3) - 1)),
      })))
    }, 3000)
    return () => window.clearInterval(interval)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: event.clientX, y: event.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (event.clientX - pointerInteracting.current.x) / 300,
          theta: (event.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number | undefined
    let revealTimer: number | undefined
    let resizeObserver: ResizeObserver | undefined
    let phi = 0

    const init = () => {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      globe = createGlobe(canvas, {
        devicePixelRatio: pixelRatio,
        width: width * pixelRatio,
        height: width * pixelRatio,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [1, 1, 1],
        markerColor: [1, 0.27, 0.13],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: initialMarkers.map((marker) => ({ location: marker.location, size: 0.04, id: marker.id })),
        arcs: [],
        arcColor: [1, 0.27, 0.13],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      })

      resizeObserver = new ResizeObserver(([entry]) => {
        const nextWidth = Math.round(entry.contentRect.width)
        if (nextWidth) globe?.update({ width: nextWidth * pixelRatio, height: nextWidth * pixelRatio })
      })
      resizeObserver.observe(canvas)

      const animate = () => {
        if (!isPausedRef.current) phi += speed
        globe?.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      revealTimer = window.setTimeout(() => { canvas.style.opacity = "1" })
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const waitForWidth = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          waitForWidth.disconnect()
          init()
        }
      })
      waitForWidth.observe(canvas)
      resizeObserver = waitForWidth
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (revealTimer) window.clearTimeout(revealTimer)
      resizeObserver?.disconnect()
      globe?.destroy()
    }
  }, [initialMarkers, speed])

  return (
    <div className={className}>
      <div className="relative aspect-square w-full select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          style={{
            width: "100%",
            height: "100%",
            cursor: "grab",
            opacity: 0,
            transition: "opacity 1.2s ease",
            borderRadius: "50%",
            touchAction: "none",
          }}
        />
        {data.map((marker) => {
          const labelStyle: CSSProperties & { positionAnchor: string } = {
            position: "absolute",
            positionAnchor: `--cobe-${marker.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 6,
            alignItems: "baseline",
            gap: "0.35rem",
            padding: "0.3rem 0.5rem",
            background: "rgba(255,69,33,0.92)",
            borderRadius: 4,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            opacity: `var(--cobe-visible-${marker.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${marker.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }

          return (
            <div key={marker.id} data-globe-label className="hidden md:flex" style={labelStyle}>
              <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                ৳{marker.price.toLocaleString("en-IN")}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.02em", color: "#fff" }}>
                ↓ {marker.drop}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
