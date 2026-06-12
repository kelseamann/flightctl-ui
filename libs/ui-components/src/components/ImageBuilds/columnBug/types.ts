export type BuildStatus = 'Failed' | 'Queued' | 'Complete';

export type CatalogSyncStatus = 'none' | 'stale' | 'publishing' | 'published' | 'failed' | 'auto_pushing';

export type ExportStepDisplay = 'default' | 'skipped' | 'warning';

export const UX_EXPORT_STEP_LABEL = 'ux.export-step';

export type MockImageBuildRow = {
  name: string;
  baseImage: string;
  imageOutput: string;
  status: BuildStatus;
  pipelineStatus: BuildStatus;
  date: string;
  displayOrder: number;
  catalogSync?: CatalogSyncStatus;
  exportStageLabel?: string;
  pipelineSteps?: 2 | 3;
};
