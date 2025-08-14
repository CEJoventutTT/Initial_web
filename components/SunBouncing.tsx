'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';


const FRAMES = [
  '/sun/sol6.png',
  '/sun/sol3.png',
  '/sun/sol2.png',
  '/sun/sol5.png',
  'sun/sol4.png',
];

export default function SunBouncing() {
  const [frame, setFrame] = useState(0);
  const { t } = useTranslation(); // tu hook de traducción

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
    <img
      src={FRAMES[frame]}
      alt="Scroll indicator — bouncing sun"
      title={t('footer.scrollHint')} // tooltip dinámico según idioma activo
      width={40}
      height={40}
      className="w-10 h-10 animate-bounce select-none pointer-events-auto"
      onAnimationIteration={handleIteration}
    />
  );
}
