'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';

const FRAMES = [
  '/sun/sol6.png',
  '/sun/sol3.png',
  '/sun/sol2.png',
  '/sun/sol5.png',
  '/sun/sol4.png',
];

export default function SunBouncing() {
  const [frame, setFrame] = useState(0);
  const [isEasterEgg, setIsEasterEgg] = useState(false);
  const { t } = useTranslation();

  const sunRef = useRef<HTMLImageElement | null>(null);
  const clickAreaRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const rotation = useRef(0);
  const rotationSpeed = useRef(3);
  const origin = useRef({ x: 0, y: 0 });
  const sizeRef = useRef(40);

  const popRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    FRAMES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    popRef.current = new Audio('/sounds/pop.mp3');
    if (popRef.current) {
      popRef.current.volume = 0.4;
      popRef.current.preload = 'auto';
    }
  }, []);

  const handleIteration = useCallback(() => {
    if (!isEasterEgg) setFrame(prev => (prev + 1) % FRAMES.length);
  }, [isEasterEgg]);

  const playPop = () => {
    if (!popRef.current) return;
    try {
      popRef.current.currentTime = 0;
      popRef.current.play().catch(() => {});
    } catch {}
  };

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const updateClickArea = () => {
    if (!clickAreaRef.current) return;
    clickAreaRef.current.style.left = `${pos.current.x - 20}px`; // extra margen
    clickAreaRef.current.style.top = `${pos.current.y - 20}px`;
  };

  const returnToOrigin = (fromX: number, fromY: number, fromRot: number) => {
    const el = sunRef.current;
    if (!el) return;

    const toX = origin.current.x;
    const toY = origin.current.y;
    const duration = 700;
    const start = performance.now();

    const animateBack = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeOut(t);
      const x = fromX + (toX - fromX) * e;
      const y = fromY + (toY - fromY) * e;
      const rot = fromRot + (0 - fromRot) * e;

      pos.current = { x, y };
      updateClickArea();

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${rot}deg)`;

      if (t < 1) {
        requestAnimationFrame(animateBack);
      } else {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.transform = '';
        setIsEasterEgg(false);
      }
    };

    requestAnimationFrame(animateBack);
  };

  const changeFrameOnBounce = () => {
    setFrame(prev => (prev + 1) % FRAMES.length);
  };

  const startBouncing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!sunRef.current) return;

    if (isEasterEgg) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      returnToOrigin(pos.current.x, pos.current.y, rotation.current);
      return;
    }

    setIsEasterEgg(true);

    const rect = sunRef.current.getBoundingClientRect();
    origin.current = { x: rect.left, y: rect.top };
    pos.current = { x: rect.left, y: rect.top };
    sizeRef.current = Math.max(sunRef.current.offsetWidth, 40);

    const angle = Math.random() * Math.PI * 2;
    const speed = 7;
    vel.current = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    rotation.current = 0;
    rotationSpeed.current = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3);

    const el = sunRef.current;
    el.style.position = 'fixed';
    el.style.left = `${pos.current.x}px`;
    el.style.top = `${pos.current.y}px`;
    el.style.zIndex = '9999';

    updateClickArea();

    const step = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const size = sizeRef.current;

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      rotation.current += rotationSpeed.current;

      let bounced = false;

      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.x = Math.abs(vel.current.x);
        bounced = true;
      } else if (pos.current.x + size >= screenW) {
        pos.current.x = screenW - size;
        vel.current.x = -Math.abs(vel.current.x);
        bounced = true;
      }
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.y = Math.abs(vel.current.y);
        bounced = true;
      } else if (pos.current.y + size >= screenH) {
        pos.current.y = screenH - size;
        vel.current.y = -Math.abs(vel.current.y);
        bounced = true;
      }

      if (bounced) {
        playPop();
        changeFrameOnBounce();
        vel.current.x *= 0.94;
        vel.current.y *= 0.94;
      }

      updateClickArea();

      el.style.left = `${pos.current.x}px`;
      el.style.top = `${pos.current.y}px`;
      el.style.transform = `rotate(${rotation.current}deg)`;

      const dx = pos.current.x - origin.current.x;
      const dy = pos.current.y - origin.current.y;
      const dist = Math.hypot(dx, dy);
      const speedMag = Math.hypot(vel.current.x, vel.current.y);

      if (dist < 60 && speedMag < 2) {
        const fx = pos.current.x;
        const fy = pos.current.y;
        const fr = rotation.current;
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        returnToOrigin(fx, fy, fr);
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
  };

  return (
    <>
      <div
        ref={clickAreaRef}
        onClick={startBouncing}
        style={{
          position: 'fixed',
          width: 80, // área clicable más grande
          height: 80,
          cursor: 'pointer',
          zIndex: 10000,
          background: 'transparent', // invisible
        }}
      />
      <img
        ref={sunRef}
        src={FRAMES[frame]}
        alt="Scroll indicator — bouncing sun"
        width={40}
        height={40}
        className={`${!isEasterEgg ? 'animate-bounce' : ''}`}
        onAnimationIteration={handleIteration}
        draggable={false}
      />
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
            opacity-0 scale-95
            transition-all duration-200
            group-hover:opacity-100 group-hover:scale-100
            backdrop-blur-sm
          "
        >
          {t('footer.scrollHint')}
        </div>
      )}
    </>
  );
}
