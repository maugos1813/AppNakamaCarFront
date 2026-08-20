import styles from './Skeleton.module.css';

export function Skeleton({ width, height, radius, className }: { width?: string | number; height?: string | number; radius?: string | number; className?: string }) {
  return (
    <span
      className={[styles.block, className].filter(Boolean).join(' ')}
      style={{ width: width ?? '100%', height: height ?? 16, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
