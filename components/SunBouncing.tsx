'use client';
import { useEffect, useState, useCallback } from 'react';
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
  const { t } = useTranslation();

  useEffect(() => {
    FRAMES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleIteration = useCallback(() => {
    setFrame(prev => (prev + 1) % FRAMES.length);
  }, []);

  return (
    <div className="relative group inline-block">
      <img
        src={FRAMES[frame]}
        alt="Scroll indicator — bouncing sun"
        width={40}
        height={40}
        aria-describedby="sun-tooltip"
        className="w-10 h-10 animate-bounce select-none pointer-events-auto"
        onAnimationIteration={handleIteration}
      />

      {/* Tooltip visual sin flechita */}
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
    </div>
  );
}
