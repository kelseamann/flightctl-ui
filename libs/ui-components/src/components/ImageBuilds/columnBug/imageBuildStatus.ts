import type { CatalogSyncStatus } from './types';

export function isEligibleToPublish(
  status: string,
  pipelineStatus: string,
  catalogSync: CatalogSyncStatus,
  includeCatalogStep = true,
): boolean {
  if (!includeCatalogStep) {
    return false;
  }
  return (
    status === 'Complete' &&
    pipelineStatus === 'Complete' &&
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
): string | null {
  if (status === 'Queued') {
    return null;
  }
  if (status === 'Failed') {
    return 'Retry build';
  }
  if (pipelineStatus === 'Queued') {
    return null;
  }
  if (pipelineStatus === 'Failed') {
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
): string | null {
  if (status === 'Queued') {
    return 'Building';
  }
  if (status === 'Failed') {
    return 'Build failed';
  }
  if (pipelineStatus === 'Queued') {
    return exportStageLabel ?? 'Exporting';
  }
  if (pipelineStatus === 'Failed') {
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
