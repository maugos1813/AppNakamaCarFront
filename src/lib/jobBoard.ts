import { stageOrder } from './labels';
import type { JobEntry, RepairStageDetail, RepairStageStatus } from './types';

// Which stage represents this entry's card on the Kanban: the one actively
// being worked on, or — if nothing has been started yet — the next one
// queued up. An entry with every stage DONE/SKIPPED has nothing to place
// (it belongs on a "ready for delivery" list, not this board).
export function currentStageFor(entry: JobEntry): RepairStageDetail | null {
  const inProgress = entry.stages.find((s) => s.status === 'IN_PROGRESS');
  if (inProgress) return inProgress;

  const byName = new Map(entry.stages.map((s) => [s.stage, s]));
  for (const name of stageOrder) {
    const stage = byName.get(name);
    if (stage?.status === 'PENDING') return stage;
  }
  return null;
}

// Every stage but DIAGNOSIS waits for the client's estimate sign-off.
export function isStageGated(entry: JobEntry, stage: RepairStageDetail): boolean {
  return stage.stage !== 'DIAGNOSIS' && entry.estimateStatus !== 'APPROVED';
}

export function nextStageAfter(entry: JobEntry, stage: RepairStageDetail): RepairStageDetail | null {
  const index = stageOrder.indexOf(stage.stage);
  if (index === -1 || index === stageOrder.length - 1) return null;
  return entry.stages.find((s) => s.stage === stageOrder[index + 1]) ?? null;
}

export interface StageAction {
  label: string;
  targetStatus: RepairStageStatus;
  variant: 'primary' | 'secondary';
}

// Mirrors the backend's ALLOWED_TRANSITIONS exactly (repairs.service.ts) —
// only offer actions the API will actually accept.
export function actionsFor(status: RepairStageStatus): StageAction[] {
  switch (status) {
    case 'PENDING':
      return [
        { label: 'Iniciar', targetStatus: 'IN_PROGRESS', variant: 'primary' },
        { label: 'Omitir', targetStatus: 'SKIPPED', variant: 'secondary' },
      ];
    case 'IN_PROGRESS':
      return [
        { label: 'Completar', targetStatus: 'DONE', variant: 'primary' },
        { label: 'Omitir', targetStatus: 'SKIPPED', variant: 'secondary' },
      ];
    case 'DONE':
      return [{ label: 'Reabrir', targetStatus: 'IN_PROGRESS', variant: 'secondary' }];
    case 'SKIPPED':
      return [
        { label: 'Iniciar', targetStatus: 'IN_PROGRESS', variant: 'primary' },
        { label: 'Restablecer', targetStatus: 'PENDING', variant: 'secondary' },
      ];
  }
}
