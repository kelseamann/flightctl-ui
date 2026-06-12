import type { CatalogSyncStatus, ExportStepDisplay } from './types';

export function isEligibleToPublish(
  status: string,
  pipelineStatus: string,
  catalogSync: CatalogSyncStatus,
  includeCatalogStep = true,
  exportStepDisplay: ExportStepDisplay = 'default',
): boolean {
  if (!includeCatalogStep) {
    return false;
  }
  const pipelineReady =
    pipelineStatus === 'Complete' ||
    (exportStepDisplay === 'warning' && status === 'Complete' && pipelineStatus === 'Failed');
  return (
    status === 'Complete' &&
    pipelineReady &&
    catalogSync !== 'published' &&
    catalogSync !== 'publishing' &&
    catalogSync !== 'auto_pushing'
  );
}

export function rowActionLabel(
  status: string,
  pipelineStatus: string,
  catalogSync: CatalogSyncStatus,
  canPublish: boolean,
  includeCatalogStep = true,
  exportStepDisplay: ExportStepDisplay = 'default',
): string | null {
  if (status === 'Queued') {
    return null;
  }
  if (status === 'Failed') {
    return 'See failure message';
  }
  if (pipelineStatus === 'Queued') {
    return null;
  }
  if (pipelineStatus === 'Failed' && exportStepDisplay !== 'warning') {
    return 'Retry export';
  }
  if (!includeCatalogStep) {
    return 'View logs';
  }
  if (catalogSync === 'failed') {
    return 'Retry push to Catalog';
  }
  if (catalogSync === 'publishing') {
    return null;
  }
  if (catalogSync === 'published' || catalogSync === 'auto_pushing') {
    return 'Open in Catalog';
  }
  if (canPublish || catalogSync === 'stale') {
    return 'Push to Catalog';
  }
  return 'View logs';
}

export function stageHelperText(
  status: string,
  pipelineStatus: string,
  catalogSync: CatalogSyncStatus,
  canPublish: boolean,
  exportStageLabel?: string,
  includeCatalogStep = true,
  exportStepDisplay: ExportStepDisplay = 'default',
): string | null {
  if (status === 'Queued') {
    return 'Building';
  }
  if (status === 'Failed') {
    return 'Build failed';
  }
  if (exportStepDisplay === 'skipped' && status === 'Complete') {
    if (canPublish) {
      return 'Ready to push to Catalog';
    }
    if (catalogSync === 'published') {
      return 'All artifacts in Catalog';
    }
    return 'Export skipped';
  }
  if (exportStepDisplay === 'warning' && status === 'Complete') {
    if (pipelineStatus === 'Queued') {
      return exportStageLabel ?? 'Exporting with warnings';
    }
    if (canPublish) {
      return 'Ready to push to Catalog';
    }
    if (pipelineStatus === 'Failed') {
      return 'Export failed';
    }
    return 'Export completed with warnings';
  }
  if (exportStepDisplay === 'default' && pipelineStatus === 'Queued') {
    return exportStageLabel ?? 'Exporting';
  }
  if (exportStepDisplay === 'default' && pipelineStatus === 'Failed') {
    return 'Export failed';
  }
  if (!includeCatalogStep) {
    if (status === 'Complete' && pipelineStatus === 'Complete') {
      return 'Export complete';
    }
    return 'Build complete';
  }
  if (catalogSync === 'failed') {
    return 'Pushing to Catalog failed';
  }
  if (catalogSync === 'publishing' || catalogSync === 'auto_pushing') {
    return 'Pushing to Catalog';
  }
  if (catalogSync === 'published') {
    return 'All artifacts in Catalog';
  }
  if (catalogSync === 'stale') {
    return 'New artifacts awaiting Catalog push';
  }
  if (canPublish) {
    return 'Ready to push to Catalog';
  }
  if (status === 'Complete' && pipelineStatus === 'Complete') {
    return 'Export complete';
  }
  return 'Build complete';
}
