import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './PlaceholderPage.module.css';

export function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <div className={styles.title}>{title}</div>
      <Card>
        <EmptyState title="Sección en construcción" description={`Esta pantalla se completará en la ${phase}.`} />
      </Card>
    </div>
  );
}
