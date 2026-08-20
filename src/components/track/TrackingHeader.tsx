import { StatusBadge } from '@/components/ui/StatusBadge';
import { entryStatusLabels, entryStatusTones } from '@/lib/labels';
import type { TrackingSummary } from '@/lib/types';
import styles from './TrackingHeader.module.css';

export function TrackingHeader({ vehicle, status }: Pick<TrackingSummary, 'vehicle' | 'status'>) {
  return (
    <div className={styles.wrap}>
      <div className={styles.plateRow}>
        <span className={styles.plate}>{vehicle.licensePlate}</span>
        <span className={styles.vehicle}>
          {vehicle.make} {vehicle.model}
        </span>
      </div>
      <div>
        <StatusBadge tone={entryStatusTones[status]} label={entryStatusLabels[status]} />
      </div>
    </div>
  );
}
