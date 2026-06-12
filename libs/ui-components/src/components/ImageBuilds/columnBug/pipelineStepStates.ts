import type { BuildStatus, CatalogSyncStatus, ExportStepDisplay } from './types';

export type StepVariant = 'success' | 'info' | 'pending' | 'danger' | 'warning';

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

export function exportStepState(
  buildStatus: BuildStatus,
  pipelineStatus: BuildStatus,
  exportStepDisplay: ExportStepDisplay = 'default',
): StepState {
  if (exportStepDisplay === 'skipped') {
    if (buildStatus !== 'Complete') {
      return { variant: 'pending' };
    }
    return { variant: 'pending' };
  }

  if (exportStepDisplay === 'warning') {
    if (buildStatus !== 'Complete') {
      return { variant: 'pending' };
    }
    return { variant: 'warning', isCurrent: pipelineStatus === 'Queued' };
  }

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
  exportStepDisplay: ExportStepDisplay = 'default',
): StepState {
  if (buildStatus !== 'Complete') {
    return { variant: 'pending' };
  }

  const pipelineReady =
    exportStepDisplay === 'skipped' || exportStepDisplay === 'warning' || pipelineStatus === 'Complete';

  if (!pipelineReady) {
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
  exportStepDisplay: ExportStepDisplay = 'default',
) {
  return {
    build: buildStepState(buildStatus),
    export: exportStepState(buildStatus, pipelineStatus, exportStepDisplay),
    catalog: catalogStepState(buildStatus, pipelineStatus, catalogSync, canPublish, exportStepDisplay),
  };
}
