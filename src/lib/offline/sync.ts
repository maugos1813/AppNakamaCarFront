import { updateStage, uploadPhoto } from '../api/jobs';
import { getPendingActions, markActionFailed, removeAction } from './queue';
import type { QueuedAction } from './types';

// Guards against two sync passes running at once (e.g. an 'online' event
// firing while a previous sync is still in flight) — the main defense
// against re-uploading the same queued photo twice.
let syncing = false;

async function runAction(token: string, action: QueuedAction) {
  if (action.type === 'STAGE_UPDATE') {
    return updateStage(token, action.stageId, action.targetStatus);
  }
  const file = new File([action.file], action.fileName, { type: action.fileType });
  return uploadPhoto(token, action.entryId, { file, category: action.category, caption: action.caption });
}

export async function syncQueue(token: string): Promise<void> {
  if (syncing) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  syncing = true;
  try {
    const actions = (await getPendingActions())
      .filter((action) => action.syncStatus === 'PENDING')
      .sort((a, b) => a.createdAt - b.createdAt);

    for (const action of actions) {
      const result = await runAction(token, action);
      if (result.ok) {
        // Removed before touching the next item — an action never sits in
        // "processed but still in the queue" state where a second sync pass
        // could pick it up again.
        await removeAction(action.id);
      } else if (result.status === 0) {
        // Network unreachable — we're still effectively offline, stop here
        // and leave the rest PENDING for the next sync attempt.
        break;
      } else {
        // A real rejection from the backend (e.g. an invalid stage
        // transition) — retrying the same payload won't succeed on its own,
        // so surface it instead of silently dropping the mechanic's work.
        await markActionFailed(action, result.message);
      }
    }
  } finally {
    syncing = false;
  }
}
