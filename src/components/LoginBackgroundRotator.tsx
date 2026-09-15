'use client';

import { useEffect, useRef, useState } from 'react';

type LoginBackground = {
  id: string;
  kind: 'image' | 'video';
  src: string;
};

const LOGIN_BACKGROUNDS: readonly LoginBackground[] = [
  {
    id: 'pixabay-sea-water-321023',
    kind: 'video',
    src: '/login-backgrounds/pixabay-sea-water-321023.mp4',
  },
  {
    id: 'pixabay-abstract-motion-14668',
    kind: 'video',
    src: '/login-backgrounds/pixabay-abstract-motion-14668.mp4',
  },
  {
    id: 'pixabay-cubes',
    kind: 'video',
    src: '/login-backgrounds/pixabay-cubes.mp4',
  },
  {
    id: 'ai-cyber-network',
    kind: 'image',
    src: '/login-backgrounds/ai-cyber-network.webp',
  },
  {
    id: 'ai-glass-cubes',
    kind: 'image',
    src: '/login-backgrounds/ai-glass-cubes.webp',
  },
];

const LAST_BACKGROUND_KEY = 'yz-login-last-background';

function readPreviousBackground() {
  try {
    return window.localStorage.getItem(LAST_BACKGROUND_KEY);
  } catch {
    return null;
  }
}

function rememberBackground(id: string) {
  try {
    window.localStorage.setItem(LAST_BACKGROUND_KEY, id);
  } catch {
    // La rotación sigue funcionando aunque el navegador bloquee el almacenamiento local.
  }
}

function chooseBackground(available: readonly LoginBackground[], previousId: string | null) {
  const candidates = available.filter((background) => background.id !== previousId);
  const pool = candidates.length > 0 ? candidates : available;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function LoginBackgroundRotator() {
  const [background, setBackground] = useState<LoginBackground | null>(null);
  const [ready, setReady] = useState(false);
  const selectionMadeRef = useRef(false);

  useEffect(() => {
    if (selectionMadeRef.current) return;
    selectionMadeRef.current = true;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const available = reduceMotion
      ? LOGIN_BACKGROUNDS.filter((item) => item.kind === 'image')
      : LOGIN_BACKGROUNDS;
    const previousId = readPreviousBackground();
    const selected = chooseBackground(available, previousId);

    setBackground(selected);
    rememberBackground(selected.id);
  }, []);

  const showNextBackground = () => {
    setReady(false);
    setBackground((current) => {
      const currentIndex = LOGIN_BACKGROUNDS.findIndex((item) => item.id === current?.id);
      const next = LOGIN_BACKGROUNDS[(currentIndex + 1) % LOGIN_BACKGROUNDS.length];
      rememberBackground(next.id);
      return next;
    });
  };

  return (
    <div className="login-background-rotator" aria-hidden="true">
      {background?.kind === 'video' ? (
        <video
          key={background.id}
          className={`login-background-media ${ready ? 'is-ready' : ''}`}
          src={background.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          onError={showNextBackground}
        />
      ) : background?.kind === 'image' ? (
        <img
          key={background.id}
          className={`login-background-media login-background-image ${ready ? 'is-ready' : ''}`}
          src={background.src}
          alt=""
          onLoad={() => setReady(true)}
          onError={showNextBackground}
        />
      ) : null}
    </div>
  );
}
