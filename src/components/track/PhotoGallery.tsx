'use client';

import { useEffect, useMemo, useState } from 'react';
import { photoCategoryLabels, photoCategoryOrder } from '@/lib/labels';
import type { PhotoCategory, TrackingPhoto } from '@/lib/types';
import styles from './PhotoGallery.module.css';

interface PhotoGalleryProps {
  photos: TrackingPhoto[];
  categoryLabels?: Record<PhotoCategory, string>;
  openPhotoLabel?: string;
  photoFallbackLabel?: string;
  closeLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export function PhotoGallery({
  photos,
  categoryLabels = photoCategoryLabels,
  openPhotoLabel = 'Apri foto',
  photoFallbackLabel = 'Foto',
  closeLabel = 'Chiudi',
  previousLabel = 'Foto precedente',
  nextLabel = 'Foto successiva',
}: PhotoGalleryProps) {
  const groups = useMemo(() => {
    return photoCategoryOrder
      .map((category) => ({ category, items: photos.filter((p) => p.category === category) }))
      .filter((group) => group.items.length > 0);
  }, [photos]);

  const [active, setActive] = useState<{ category: PhotoCategory; index: number } | null>(null);

  const activeGroup = active ? groups.find((g) => g.category === active.category) : undefined;
  const activePhoto = activeGroup && active ? activeGroup.items[active.index] : undefined;

  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function step(delta: number) {
    if (!active || !activeGroup) return;
    const nextIndex = (active.index + delta + activeGroup.items.length) % activeGroup.items.length;
    setActive({ category: active.category, index: nextIndex });
  }

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <div className={styles.section} key={group.category}>
          <span className={styles.sectionTitle}>{categoryLabels[group.category]}</span>
          <div className={styles.grid}>
            {group.items.map((photo, index) => (
              <button
                key={photo.url}
                type="button"
                className={styles.thumbButton}
                onClick={() => setActive({ category: group.category, index })}
                aria-label={`${openPhotoLabel}: ${photo.caption ?? categoryLabels[group.category]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? `${photoFallbackLabel} — ${categoryLabels[group.category]}`}
                  className={styles.thumb}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      ))}

      {active && activePhoto && (
        <div className={styles.lightbox} onClick={() => setActive(null)} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setActive(null)}
            aria-label={closeLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          {activeGroup && activeGroup.items.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label={previousLabel}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label={nextLabel}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.url}
            alt={activePhoto.caption ?? categoryLabels[active.category]}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          {activePhoto.caption && <div className={styles.lightboxCaption}>{activePhoto.caption}</div>}
        </div>
      )}
    </>
  );
}
