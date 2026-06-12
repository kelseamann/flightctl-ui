import * as React from 'react';
import { ProgressStep, ProgressStepper, Tooltip } from '@patternfly/react-core';
import MinusIcon from '@patternfly/react-icons/dist/js/icons/minus-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import type { BuildStatus, CatalogSyncStatus, ExportStepDisplay } from './types';
import { getPipelineStepStates } from './pipelineStepStates';

type ImageBuildProgressStepperProps = {
  buildName: string;
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  canPublish: boolean;
  exportStepDisplay?: ExportStepDisplay;
};

const ImageBuildProgressStepper = ({
  buildName,
  buildStatus,
  pipelineStatus,
  catalogSync,
  canPublish,
  exportStepDisplay = 'default',
}: ImageBuildProgressStepperProps) => {
  const { t } = useTranslation();
  const {
    build,
    export: exportStep,
    catalog,
  } = getPipelineStepStates(buildStatus, pipelineStatus, catalogSync, canPublish, exportStepDisplay);
  const prefix = buildName.replace(/\./g, '-');
  const isExportSkipped = exportStepDisplay === 'skipped' && buildStatus === 'Complete';
  const exportIcon = isExportSkipped ? (
    <Tooltip content={t('Skipped export')}>
      <span className="rhem-export-step-skipped-trigger" tabIndex={0}>
        <MinusIcon aria-hidden />
      </span>
    </Tooltip>
  ) : undefined;

  return (
    <ProgressStepper isCompact aria-label={`Build progress for ${buildName}`} className="rhem-build-progress-stepper">
      <ProgressStep
        id={`${prefix}-step-build`}
        titleId={`${prefix}-step-build-title`}
        variant={build.variant}
        isCurrent={build.isCurrent}
        aria-label={`Build ${build.variant === 'success' ? 'complete' : buildStatus.toLowerCase()}`}
      />
      <ProgressStep
        id={`${prefix}-step-export`}
        titleId={`${prefix}-step-export-title`}
        variant={exportStep.variant}
        isCurrent={exportStep.isCurrent}
        icon={exportIcon}
        aria-label={
          exportStepDisplay === 'skipped'
            ? 'Export skipped'
            : exportStepDisplay === 'warning'
              ? 'Export warning'
              : `Export ${pipelineStatus.toLowerCase()}`
        }
      />
      <ProgressStep
        id={`${prefix}-step-catalog`}
        titleId={`${prefix}-step-catalog-title`}
        variant={catalog.variant}
        isCurrent={catalog.isCurrent}
        aria-label="Catalog sync"
      />
    </ProgressStepper>
  );
};

export default ImageBuildProgressStepper;
