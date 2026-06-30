import { useEffect, useRef, useState } from 'react';

export function AutoPlayVideo({ className, src, preload = 'metadata', eager = false }) {
  const videoRef = useRef(null);
  const [active, setActive] = useState(() => eager || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || eager || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '180px 0px', threshold: 0.15 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
      return;
    }
    video.pause();
  }, [active, src]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={active ? src : undefined}
      autoPlay={active}
      muted
      loop
      playsInline
      preload={active ? preload : 'none'}
    />
  );
}
