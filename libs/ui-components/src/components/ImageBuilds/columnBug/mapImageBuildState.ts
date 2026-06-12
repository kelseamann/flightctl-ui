import {
  ImageBuildConditionReason,
  ImageExportConditionReason,
  ImagePromotion,
  ImagePromotionConditionReason,
  ImagePromotionConditionType,
} from '@flightctl/types/imagebuilder';

import { ImageBuildWithExports } from '../../../types/extraTypes';
import {
  getImageBuildStatusReason,
  getImageExportStatusReason,
  isImageExportActiveReason,
} from '../../../utils/imageBuilds';
import type { BuildStatus, CatalogSyncStatus, ExportStepDisplay } from './types';
import { UX_EXPORT_STEP_LABEL } from './types';

const mapBuildStatus = (reason: ImageBuildConditionReason): BuildStatus => {
  if (reason === ImageBuildConditionReason.ImageBuildConditionReasonCompleted) {
    return 'Complete';
  }
  if (reason === ImageBuildConditionReason.ImageBuildConditionReasonFailed) {
    return 'Failed';
  }
  return 'Queued';
};

const mapPipelineStatus = (imageBuild: ImageBuildWithExports): BuildStatus => {
  const buildReason = getImageBuildStatusReason(imageBuild);
  if (buildReason !== ImageBuildConditionReason.ImageBuildConditionReasonCompleted) {
    return 'Queued';
  }

  const exports = imageBuild.imageExports.filter((imageExport): imageExport is NonNullable<typeof imageExport> =>
    Boolean(imageExport),
  );
  if (exports.length === 0) {
    return 'Complete';
  }

  if (
    exports.some(
      (imageExport) =>
        getImageExportStatusReason(imageExport) === ImageExportConditionReason.ImageExportConditionReasonFailed,
    )
  ) {
    return 'Failed';
  }

  if (exports.some((imageExport) => isImageExportActiveReason(getImageExportStatusReason(imageExport)))) {
    return 'Queued';
  }

  return 'Complete';
};

const mapCatalogSync = (latestPromotion?: ImagePromotion): CatalogSyncStatus => {
  if (!latestPromotion) {
    return 'none';
  }

  const readyCondition = latestPromotion.status?.conditions?.find(
    (condition) => condition.type === ImagePromotionConditionType.ImagePromotionConditionTypeReady,
  );
  const reason = readyCondition?.reason as ImagePromotionConditionReason | undefined;

  switch (reason) {
    case ImagePromotionConditionReason.ImagePromotionConditionReasonPublishing:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonWaitingForArtifacts:
      return 'publishing';
    case ImagePromotionConditionReason.ImagePromotionConditionReasonCompleted:
      return 'published';
    case ImagePromotionConditionReason.ImagePromotionConditionReasonFailed:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildFailed:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonAmendmentFailed:
      return 'failed';
    default:
      return 'none';
  }
};

const mapExportStepDisplay = (imageBuild: ImageBuildWithExports): ExportStepDisplay => {
  const label = imageBuild.metadata?.labels?.[UX_EXPORT_STEP_LABEL];
  if (label === 'skipped' || label === 'warning') {
    return label;
  }

  const buildStatus = mapBuildStatus(getImageBuildStatusReason(imageBuild));
  const exports = imageBuild.imageExports.filter((imageExport): imageExport is NonNullable<typeof imageExport> =>
    Boolean(imageExport),
  );
  if (exports.length === 0 && buildStatus === 'Complete') {
    return 'skipped';
  }

  return 'default';
};

export type ColumnBugRowState = {
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  exportStepDisplay: ExportStepDisplay;
  showCatalogStep: boolean;
};

export const mapImageBuildToColumnBugState = (
  imageBuild: ImageBuildWithExports,
  latestPromotion?: ImagePromotion,
  includeCatalogStep = true,
): ColumnBugRowState => ({
  buildStatus: mapBuildStatus(getImageBuildStatusReason(imageBuild)),
  pipelineStatus: mapPipelineStatus(imageBuild),
  catalogSync: mapCatalogSync(latestPromotion),
  exportStepDisplay: mapExportStepDisplay(imageBuild),
  showCatalogStep: includeCatalogStep,
});
