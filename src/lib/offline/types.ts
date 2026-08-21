import type { PhotoCategory, RepairStageStatus } from '../types';

interface BaseAction {
  id: string;
  createdAt: number;
  // Human-readable summary shown in the pending-sync indicator, e.g. "Diagnóstico — FL123GH".
  label: string;
  syncStatus: 'PENDING' | 'FAILED';
  errorMessage?: string;
}

export interface StageUpdateAction extends BaseAction {
  type: 'STAGE_UPDATE';
  stageId: string;
  targetStatus: RepairStageStatus;
}

export interface PhotoUploadAction extends BaseAction {
  type: 'PHOTO_UPLOAD';
  entryId: string;
  file: Blob;
  fileName: string;
  fileType: string;
  category: PhotoCategory;
  caption?: string;
}

export type QueuedAction = StageUpdateAction | PhotoUploadAction;
