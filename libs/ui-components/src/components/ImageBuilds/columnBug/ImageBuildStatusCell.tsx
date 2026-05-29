import * as React from 'react';

import type { BuildStatus, CatalogSyncStatus } from './types';
import { isEligibleToPublish, rowActionLabel, stageHelperText } from './imageBuildStatus';
import ImageBuildProgressStepper from './ImageBuildProgressStepper';
import ImageBuildRowActions from './ImageBuildRowActions';

export type ImageBuildStatusCellProps = {
  buildName: string;
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  exportStageLabel?: string;
  pipelineSteps?: 2 | 3;
  onPushToCatalog?: () => void;
  onOpenCatalog?: () => void;
  onRetry?: () => void;
  variant?: 'status' | 'actions';
};

const ImageBuildStatusCell = ({
  buildName,
  buildStatus,
  pipelineStatus,
  catalogSync,
  exportStageLabel,
  pipelineSteps = 3,
  onPushToCatalog,
  onOpenCatalog,
  onRetry,
  variant = 'status',
}: ImageBuildStatusCellProps) => {
  const includeCatalogStep = pipelineSteps === 3;
  const canPublish = isEligibleToPublish(
    buildStatus,
    pipelineStatus,
    catalogSync,
    includeCatalogStep,
  );
  const actionLabel = rowActionLabel(
    buildStatus,
    pipelineStatus,
    catalogSync,
    canPublish,
    includeCatalogStep,
  );
  const statusNote = stageHelperText(
    buildStatus,
    pipelineStatus,
    catalogSync,
    canPublish,
    exportStageLabel,
    includeCatalogStep,
  );
  const showStepper = variant === 'status';
  const showActions = variant === 'actions';

  const content = (
    <>
      {showStepper && (
        <>
          <ImageBuildProgressStepper
            buildName={buildName}
            buildStatus={buildStatus}
            pipelineStatus={pipelineStatus}
            catalogSync={catalogSync}
            canPublish={canPublish}
            pipelineSteps={pipelineSteps}
          />
          {statusNote && <span className="rhem-status-note">{statusNote}</span>}
        </>
      )}
      {showActions && actionLabel ? (
        <ImageBuildRowActions
          buildName={buildName}
          actionLabel={actionLabel}
          onAction={
            actionLabel.startsWith('Retry')
              ? onRetry
              : canPublish
                ? onPushToCatalog
                : catalogSync === 'published' || catalogSync === 'auto_pushing'
                  ? onOpenCatalog
                  : undefined
          }
          showExternalLinkIcon={catalogSync === 'published' || catalogSync === 'auto_pushing'}
        />
      ) : null}
    </>
  );

  if (variant === 'actions') {
    return <>{content}</>;
  }

  return <div className="rhem-status-cell">{content}</div>;
};

export default ImageBuildStatusCell;
