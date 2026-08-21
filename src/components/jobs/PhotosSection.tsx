'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { PhotoGallery } from '@/components/track/PhotoGallery';
import { listPhotos, uploadPhoto } from '@/lib/api/jobs';
import { enqueuePhotoUpload } from '@/lib/offline/queue';
import { photoCategoryLabels } from '@/lib/staffLabels';
import type { PhotoCategory, StaffPhoto } from '@/lib/types';
import styles from './PhotosSection.module.css';

const categoryOptions = (Object.entries(photoCategoryLabels) as [PhotoCategory, string][]).map(([value, label]) => ({
  value,
  label,
}));

export function PhotosSection({ token, entryId }: { token: string; entryId: string }) {
  const [photos, setPhotos] = useState<StaffPhoto[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<PhotoCategory>('PROGRESS');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listPhotos(token, entryId).then((result) => {
      if (result.ok) setPhotos(result.data);
    });
  }, [token, entryId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setQueued(false);

    function resetForm() {
      setFile(null);
      setCaption('');
      if (inputRef.current) inputRef.current.value = '';
    }

    async function queueOffline() {
      if (!file) return;
      await enqueuePhotoUpload({
        entryId,
        file,
        category,
        caption: caption || undefined,
        label: `Foto (${photoCategoryLabels[category]})`,
      });
      setQueued(true);
      resetForm();
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await queueOffline();
      setSubmitting(false);
      return;
    }

    const result = await uploadPhoto(token, entryId, { file, category, caption: caption || undefined });
    setSubmitting(false);
    if (result.ok) {
      setPhotos((current) => [result.data, ...(current ?? [])]);
      resetForm();
    } else if (result.status === 0) {
      await queueOffline();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.section}>
      <span className={styles.title}>Foto</span>

      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <label className={styles.fileButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 8h3l2-3h6l2 3h3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z"
            />
            <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          {file ? file.name : 'Tomar o elegir una foto'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className={styles.hiddenInput}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className={styles.formRow}>
          <Select
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
            options={categoryOptions}
          />
          <Input label="Descripción (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>

        {error && <span className={styles.error}>{error}</span>}
        {queued && <span className={styles.queuedHint}>Sin conexión — la foto se subirá cuando haya conexión.</span>}

        <div className={styles.formActions}>
          <Button type="submit" variant="primary" loading={submitting} disabled={!file}>
            Subir foto
          </Button>
        </div>
      </form>

      {photos === null && <Skeleton height={80} radius={12} />}
      {photos !== null && (
        <PhotoGallery
          photos={photos}
          categoryLabels={photoCategoryLabels}
          openPhotoLabel="Abrir foto"
          photoFallbackLabel="Foto"
          closeLabel="Cerrar"
          previousLabel="Foto anterior"
          nextLabel="Foto siguiente"
        />
      )}
    </div>
  );
}
