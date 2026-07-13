"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import * as THREE from "three"

interface WovenLightHeroProps {
  className?: string
}

export function WovenLightHero({ className = "" }: WovenLightHeroProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const particleCount = window.innerWidth < 640 ? 6000 : 18000
    const positions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const geometry = new THREE.BufferGeometry()
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32)
    const source = torusKnot.attributes.position
    const color = new THREE.Color()

    for (let i = 0; i < particleCount; i++) {
      const index = i * 3
      const sourceIndex = i % source.count
      const x = source.getX(sourceIndex)
      const y = source.getY(sourceIndex)
      const z = source.getZ(sourceIndex)
      positions[index] = originalPositions[index] = x
      positions[index + 1] = originalPositions[index + 1] = y
      positions[index + 2] = originalPositions[index + 2] = z
      color.setHSL(0.04 + Math.random() * 0.02, 0.12, 0.2 + Math.random() * 0.08)
      colors[index] = color.r
      colors[index + 1] = color.g
      colors[index + 2] = color.b
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: 0.8,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const mouse = new THREE.Vector2()
    const clock = new THREE.Clock()
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    const handleResize = () => {
      const { clientWidth: width, clientHeight: height } = mount
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    let frameId = 0
    const animate = () => {
      const mouseX = mouse.x * 3
      const mouseY = mouse.y * 3
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3
        const dx = positions[index] - mouseX
        const dy = positions[index + 1] - mouseY
        const dz = positions[index + 2]
        const distanceSquared = dx * dx + dy * dy + dz * dz
        if (distanceSquared < 2.25) {
          const distance = Math.sqrt(distanceSquared) || 1
          const force = ((1.5 - distance) / 1.5) * 0.012
          velocities[index] += (dx / distance) * force
          velocities[index + 1] += (dy / distance) * force
          velocities[index + 2] += (dz / distance) * force
        }
        velocities[index] = (velocities[index] + (originalPositions[index] - positions[index]) * 0.001) * 0.95
        velocities[index + 1] = (velocities[index + 1] + (originalPositions[index + 1] - positions[index + 1]) * 0.001) * 0.95
        velocities[index + 2] = (velocities[index + 2] + (originalPositions[index + 2] - positions[index + 2]) * 0.001) * 0.95
        positions[index] += velocities[index]
        positions[index + 1] += velocities[index + 1]
        positions[index + 2] += velocities[index + 2]
      }
      geometry.attributes.position.needsUpdate = true
      points.rotation.y = clock.getElapsedTime() * 0.05
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    handleResize()
    animate()
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      torusKnot.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <motion.div
      ref={mountRef}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className={`overflow-hidden ${className}`}
    />
  )
}
