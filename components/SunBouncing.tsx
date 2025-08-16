'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from '@/lib/i18n'

type Props = {
  size?: number
  className?: string
}

const FRAMES = ['/sun/sol6.png'] // añade más frames si quieres variar al botar

export default function SunBouncing({ size = 40, className }: Props) {
  const [frame, setFrame] = useState(0)
  const [isEasterEgg, setIsEasterEgg] = useState(false)
  const { t } = useTranslation()

  const sunRef = useRef<HTMLImageElement | null>(null)
  const hitboxRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const pos = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const rotation = useRef(0)
  const rotationSpeed = useRef(3)
  const origin = useRef({ x: 0, y: 0 })
  const sizeRef = useRef(size)

  const popRef = useRef<HTMLAudioElement | null>(null)

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  useEffect(() => {
    FRAMES.forEach((src) => {
      const img = new Image()
      img.src = src
    })
    popRef.current = new Audio('/sounds/pop.mp3')
    if (popRef.current) {
      popRef.current.volume = 0.4
      popRef.current.preload = 'auto'
    }
  }, [])

  const playPop = () => {
    if (!popRef.current) return
    try {
      popRef.current.currentTime = 0
      popRef.current.play().catch(() => {})
    } catch {}
  }

  // cambia de frame en cada ciclo de animación del bote (si hay varios frames)
  const handleIteration = useCallback(() => {
    if (!isEasterEgg) setFrame((p) => (p + 1) % FRAMES.length)
  }, [isEasterEgg])

  const updateHitbox = () => {
    const box = hitboxRef.current
    if (!box) return
    box.style.left = `${pos.current.x - 30}px`
    box.style.top = `${pos.current.y - 30}px`
  }

  const returnToOrigin = (fromX: number, fromY: number, fromRot: number) => {
    const el = sunRef.current
    const box = hitboxRef.current
    if (!el || !box) return

    const toX = origin.current.x
    const toY = origin.current.y
    const duration = 700
    const start = performance.now()

    const animateBack = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = easeOut(t)
      const x = fromX + (toX - fromX) * e
      const y = fromY + (toY - fromY) * e
      const rot = fromRot + (0 - fromRot) * e

      pos.current = { x, y }
      updateHitbox()

      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.transform = `rotate(${rot}deg)`

      if (t < 1) {
        requestAnimationFrame(animateBack)
      } else {
        // reset a flujo normal
        el.style.position = ''
        el.style.left = ''
        el.style.top = ''
        el.style.transform = ''
        el.style.zIndex = ''

        box.style.display = 'none'
        box.style.left = ''
        box.style.top = ''

        setIsEasterEgg(false) // vuelve el bote CSS
      }
    }

    requestAnimationFrame(animateBack)
  }

  const changeFrameOnBounce = () => {
    setFrame((p) => (p + 1) % FRAMES.length)
  }

  const startBouncing = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!sunRef.current || !hitboxRef.current) return

    // si ya está rebotando: clic = volver al origen
    if (isEasterEgg) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      returnToOrigin(pos.current.x, pos.current.y, rotation.current)
      return
    }

    setIsEasterEgg(true)

    // origen
    const rect = sunRef.current.getBoundingClientRect()
    origin.current = { x: rect.left, y: rect.top }
    pos.current = { x: rect.left, y: rect.top }
    sizeRef.current = Math.max(sunRef.current.offsetWidth || size, size)

    // velocidad inicial + giro
    const angle = Math.random() * Math.PI * 2
    const speed = 7
    vel.current = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
    rotation.current = 0
    rotationSpeed.current = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3)

    // elevar a capa fija
    const el = sunRef.current
    const box = hitboxRef.current

    el.style.position = 'fixed'
    el.style.left = `${pos.current.x}px`
    el.style.top = `${pos.current.y}px`
    el.style.zIndex = '9999'

    box.style.display = 'block'
    box.style.position = 'fixed'
    box.style.width = '100px'
    box.style.height = '100px'
    box.style.cursor = 'pointer'
    box.style.background = 'transparent'
    box.style.zIndex = '10000'
    updateHitbox()

    const step = () => {
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      const s = sizeRef.current

      // física
      pos.current.x += vel.current.x
      pos.current.y += vel.current.y
      rotation.current += rotationSpeed.current

      let bounced = false

      // colisiones
      if (pos.current.x <= 0) {
        pos.current.x = 0
        vel.current.x = Math.abs(vel.current.x)
        bounced = true
      } else if (pos.current.x + s >= screenW) {
        pos.current.x = screenW - s
        vel.current.x = -Math.abs(vel.current.x)
        bounced = true
      }
      if (pos.current.y <= 0) {
        pos.current.y = 0
        vel.current.y = Math.abs(vel.current.y)
        bounced = true
      } else if (pos.current.y + s >= screenH) {
        pos.current.y = screenH - s
        vel.current.y = -Math.abs(vel.current.y)
        bounced = true
      }

      if (bounced) {
        playPop()
        changeFrameOnBounce()
        vel.current.x *= 0.94
        vel.current.y *= 0.94
      }

      // aplicar
      el.style.left = `${pos.current.x}px`
      el.style.top = `${pos.current.y}px`
      el.style.transform = `rotate(${rotation.current}deg)`
      updateHitbox()

      // retorno natural
      const dx = pos.current.x - origin.current.x
      const dy = pos.current.y - origin.current.y
      const dist = Math.hypot(dx, dy)
      const speedMag = Math.hypot(vel.current.x, vel.current.y)

      if (dist < 60 && speedMag < 2) {
        const fx = pos.current.x, fy = pos.current.y, fr = rotation.current
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        returnToOrigin(fx, fy, fr)
        return
      }

      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)
  }

  // 🟢 BOTE CLÁSICO EN REPOSO (no giro). En modo easter egg, desactivamos CSS.
  const restClass = !isEasterEgg ? 'animate-bounce' : ''

  return (
    <div className={`relative group inline-block select-none ${className ?? ''}`}>
      {/* Hitbox invisible durante el rebote */}
      <div ref={hitboxRef} onClick={startBouncing} style={{ display: 'none' }} />

      {/* Sol: bote en reposo / control JS en rebote */}
      <img
        ref={sunRef}
        src={FRAMES[frame]}
        alt="Scroll indicator — sun"
        width={size}
        height={size}
        className={restClass}
        onAnimationIteration={handleIteration}
        draggable={false}
        onClick={startBouncing}
        style={{ cursor: 'pointer' }}
      />

      {/* Tooltip solo en reposo */}
      {!isEasterEgg && (
        <div
          id="sun-tooltip"
          role="tooltip"
          className="
            pointer-events-none
            absolute bottom-full left-1/2 -translate-x-1/2 mb-4
            px-3 py-1 rounded-xl
            bg-gradient-to-r from-[#5D8C87] to-[#262425]
            text-white text-xs font-semibold shadow-xl
            opacity-0 transition-opacity duration-200
            group-hover:opacity-100
          "
        >
          {t('footer.scrollHint')}
        </div>
      )}
    </div>
  )
}
