import { Skeleton } from './Skeleton';

export function FullPageLoading() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Skeleton width={40} height={40} radius="50%" />
    </div>
  );
}
