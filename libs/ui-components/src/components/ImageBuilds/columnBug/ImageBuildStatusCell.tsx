import * as React from 'react';

import { useTranslation } from '../../../hooks/useTranslation';
import type { BuildStatus, CatalogSyncStatus, ExportStepDisplay } from './types';
import { isEligibleToPublish, rowActionLabel, stageHelperText } from './imageBuildStatus';
import ImageBuildProgressStepper from './ImageBuildProgressStepper';
import ImageBuildRowActions from './ImageBuildRowActions';

export type ImageBuildStatusCellProps = {
  buildName: string;
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  exportStageLabel?: string;
  exportStepDisplay?: ExportStepDisplay;
  showCatalogStep?: boolean;
  onPushToCatalog?: () => void;
  onOpenCatalog?: () => void;
  onRetry?: () => void;
  onSeeDetails?: () => void;
  variant?: 'status' | 'actions';
};

const ImageBuildStatusCell = ({
  buildName,
  buildStatus,
  pipelineStatus,
  catalogSync,
  exportStageLabel,
  exportStepDisplay = 'default',
  showCatalogStep = true,
  onPushToCatalog,
  onOpenCatalog,
  onRetry,
  onSeeDetails,
  variant = 'status',
}: ImageBuildStatusCellProps) => {
  const { t } = useTranslation();
  const canPublish = isEligibleToPublish(
    buildStatus,
    pipelineStatus,
    catalogSync,
    showCatalogStep,
    exportStepDisplay,
  );
  const rawActionLabel = rowActionLabel(
    buildStatus,
    pipelineStatus,
    catalogSync,
    canPublish,
    showCatalogStep,
    exportStepDisplay,
  );
  const actionLabel =
    rawActionLabel === 'See failure message' ? t('See failure message') : rawActionLabel;
  const statusNote = stageHelperText(
    buildStatus,
    pipelineStatus,
    catalogSync,
    canPublish,
    exportStageLabel,
    showCatalogStep,
    exportStepDisplay,
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
            exportStepDisplay={exportStepDisplay}
          />
          {statusNote && <span className="rhem-status-note">{statusNote}</span>}
        </>
      )}
      {showActions && actionLabel ? (
        <ImageBuildRowActions
          buildName={buildName}
          actionLabel={actionLabel}
          onAction={
            buildStatus === 'Failed'
              ? onSeeDetails
              : actionLabel.startsWith('Retry')
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
