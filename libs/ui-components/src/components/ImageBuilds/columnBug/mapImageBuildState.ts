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
import type { BuildStatus, CatalogSyncStatus } from './types';

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

export type ColumnBugRowState = {
  buildStatus: BuildStatus;
  pipelineStatus: BuildStatus;
  catalogSync: CatalogSyncStatus;
  pipelineSteps: 2 | 3;
};

export const mapImageBuildToColumnBugState = (
  imageBuild: ImageBuildWithExports,
  latestPromotion?: ImagePromotion,
  includeCatalogStep = true,
): ColumnBugRowState => ({
  buildStatus: mapBuildStatus(getImageBuildStatusReason(imageBuild)),
  pipelineStatus: mapPipelineStatus(imageBuild),
  catalogSync: mapCatalogSync(latestPromotion),
  pipelineSteps: includeCatalogStep ? 3 : 2,
});
