import type { BuildStatus, CatalogSyncStatus } from './types';

export type StepVariant = 'success' | 'info' | 'pending' | 'danger';

export type StepState = {
  variant: StepVariant;
  isCurrent?: boolean;
};

export function buildStepState(status: BuildStatus): StepState {
  if (status === 'Failed') {
    return { variant: 'danger', isCurrent: true };
  }
  if (status === 'Queued') {
    return { variant: 'info', isCurrent: true };
  }
  return { variant: 'success' };
}

export function exportStepState(buildStatus: BuildStatus, pipelineStatus: BuildStatus): StepState {
  if (buildStatus !== 'Complete') {
    return { variant: 'pending' };
  }
  if (pipelineStatus === 'Failed') {
    return { variant: 'danger', isCurrent: true };
  }
  if (pipelineStatus === 'Queued') {
    return { variant: 'info', isCurrent: true };
  }
  return { variant: 'success' };
}

export function catalogStepState(
  buildStatus: BuildStatus,
  pipelineStatus: BuildStatus,
  catalogSync: CatalogSyncStatus,
  canPublish: boolean,
): StepState {
  if (buildStatus !== 'Complete') {
    return { variant: 'pending' };
  }
  if (pipelineStatus !== 'Complete') {
    return { variant: 'pending' };
  }
  if (catalogSync === 'stale') {
    return { variant: 'info', isCurrent: true };
  }
  if (catalogSync === 'failed') {
    return { variant: 'danger', isCurrent: true };
  }
  if (catalogSync === 'publishing' || catalogSync === 'auto_pushing') {
    return { variant: 'info', isCurrent: true };
  }
  if (catalogSync === 'published') {
    return { variant: 'success' };
  }
  if (canPublish) {
    return { variant: 'info', isCurrent: true };
  }
  return { variant: 'pending', isCurrent: true };
}

export function getPipelineStepStates(
  buildStatus: BuildStatus,
  pipelineStatus: BuildStatus,
  catalogSync: CatalogSyncStatus,
  canPublish: boolean,
) {
  return {
    build: buildStepState(buildStatus),
    export: exportStepState(buildStatus, pipelineStatus),
    catalog: catalogStepState(buildStatus, pipelineStatus, catalogSync, canPublish),
  };
}
