import { deleteAction, getAllActions, putAction } from './db';
import type { PhotoUploadAction, QueuedAction, StageUpdateAction } from './types';
import type { PhotoCategory, RepairStageStatus } from '../types';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Lets the pending-sync indicator react to queue changes without polling.
export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPendingActions(): Promise<QueuedAction[]> {
  return getAllActions();
}

export async function enqueueStageUpdate(input: { stageId: string; targetStatus: RepairStageStatus; label: string }): Promise<void> {
  const action: StageUpdateAction = {
    id: crypto.randomUUID(),
    type: 'STAGE_UPDATE',
    createdAt: Date.now(),
    syncStatus: 'PENDING',
    ...input,
  };
  await putAction(action);
  notify();
}

export async function enqueuePhotoUpload(input: {
  entryId: string;
  file: File;
  category: PhotoCategory;
  caption?: string;
  label: string;
}): Promise<void> {
  const action: PhotoUploadAction = {
    id: crypto.randomUUID(),
    type: 'PHOTO_UPLOAD',
    createdAt: Date.now(),
    syncStatus: 'PENDING',
    entryId: input.entryId,
    file: input.file,
    fileName: input.file.name,
    fileType: input.file.type,
    category: input.category,
    caption: input.caption,
    label: input.label,
  };
  await putAction(action);
  notify();
}

export async function markActionFailed(action: QueuedAction, errorMessage: string): Promise<void> {
  await putAction({ ...action, syncStatus: 'FAILED', errorMessage });
  notify();
}

export async function retryAction(action: QueuedAction): Promise<void> {
  await putAction({ ...action, syncStatus: 'PENDING', errorMessage: undefined });
  notify();
}

export async function removeAction(id: string): Promise<void> {
  await deleteAction(id);
  notify();
}
