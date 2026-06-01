import * as React from 'react';
import { ProgressStep, ProgressStepper } from '@patternfly/react-core';

import type { BuildStatus, CatalogSyncStatus } from './types';
import { getPipelineStepStates } from './pipelineStepStates';

type ImageBuildProgressStepperProps = {
  buildName: string;
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  canPublish: boolean;
  pipelineSteps?: 2 | 3;
};

const ImageBuildProgressStepper = ({
  buildName,
  buildStatus,
  pipelineStatus,
  catalogSync,
  canPublish,
  pipelineSteps = 3,
}: ImageBuildProgressStepperProps) => {
  const {
    build,
    export: exportStep,
    catalog,
  } = getPipelineStepStates(buildStatus, pipelineStatus, catalogSync, canPublish);
  const prefix = buildName.replace(/\./g, '-');

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
        aria-label={`Export ${pipelineStatus.toLowerCase()}`}
      />
      {pipelineSteps === 3 && (
        <ProgressStep
          id={`${prefix}-step-catalog`}
          titleId={`${prefix}-step-catalog-title`}
          variant={catalog.variant}
          isCurrent={catalog.isCurrent}
          aria-label="Catalog sync"
        />
      )}
    </ProgressStepper>
  );
};

export default ImageBuildProgressStepper;
