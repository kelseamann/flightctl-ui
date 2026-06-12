import * as React from 'react';
import { Alert, AlertActionLink, Button, Stack, StackItem, Title } from '@patternfly/react-core';
import { ExpandableRowContent, OnSelect, Tbody, Td, Tr } from '@patternfly/react-table';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ImageBuild, ImageBuildConditionReason, ImagePromotion } from '@flightctl/types/imagebuilder';
import { ImageBuildWithExports } from '../../types/extraTypes';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { getImageBuildImage, getImageBuildStatusReason, isImageBuildCancelable } from '../../utils/imageBuilds';
import { getDateDisplay } from '../../utils/dates';
import ResourceLink from '../common/ResourceLink';
import ImageBuildExportsGallery from './ImageBuildDetails/ImageBuildExportsGallery';
import ImageBuildStatusCell from './columnBug/ImageBuildStatusCell';
import ImageBuildRowKebab from './columnBug/ImageBuildRowKebab';
import { mapImageBuildToColumnBugState } from './columnBug/mapImageBuildState';

type ImageBuildRowProps = {
  imageBuild: ImageBuildWithExports;
  rowIndex: number;
  onRowSelect: (imageBuild: ImageBuild) => OnSelect;
  isRowSelected: (imageBuild: ImageBuild) => boolean;
  onDeleteClick: VoidFunction;
  canDelete: boolean;
  onCancelClick: VoidFunction;
  canCancel: boolean;
  onNewVersionClick: VoidFunction;
  canNewVersion: boolean;
  onAddToCatalog: VoidFunction;
  canAddToCatalog: boolean;
  refetch: VoidFunction;
  latestPromotion?: ImagePromotion;
};

const ImageBuildRow = ({
  imageBuild,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onDeleteClick,
  canDelete,
  onCancelClick,
  canCancel,
  onNewVersionClick,
  canNewVersion,
  refetch,
  onAddToCatalog,
  canAddToCatalog,
  latestPromotion,
}: ImageBuildRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const imageBuildName = imageBuild.metadata.name || '';
  const buildReason = getImageBuildStatusReason(imageBuild);
  const { buildStatus, pipelineStatus, catalogSync, exportStepDisplay, showCatalogStep } =
    mapImageBuildToColumnBugState(imageBuild, latestPromotion, canAddToCatalog);

  const sourceImage = getImageBuildImage(imageBuild.spec.source);
  const destinationImage = getImageBuildImage(imageBuild.spec.destination);
  const handleSeeDetails = React.useCallback(() => {
    setIsExpanded((expanded) => !expanded);
  }, []);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr isContentExpanded={isExpanded}>
        <Td
          select={{
            rowIndex,
            onSelect: onRowSelect(imageBuild),
            isSelected: isRowSelected(imageBuild),
          }}
        />
        <Td
          expand={{
            rowIndex,
            isExpanded,
            onToggle: () => setIsExpanded(!isExpanded),
          }}
        />
        <Td dataLabel={t('Name')}>
          <ResourceLink id={imageBuildName} routeLink={ROUTE.IMAGE_BUILD_DETAILS} />
        </Td>
        <Td dataLabel={t('Base image')}>{sourceImage}</Td>
        <Td dataLabel={t('Image output')}>{destinationImage}</Td>
        <Td dataLabel={t('Status')} className="rhem-col-status">
          <ImageBuildStatusCell
            buildName={imageBuildName}
            buildStatus={buildStatus}
            pipelineStatus={pipelineStatus}
            catalogSync={catalogSync}
            exportStepDisplay={exportStepDisplay}
            showCatalogStep={showCatalogStep}
            variant="status"
          />
        </Td>
        <Td dataLabel={t('Actions')} className="rhem-col-actions">
          <ImageBuildStatusCell
            buildName={imageBuildName}
            buildStatus={buildStatus}
            pipelineStatus={pipelineStatus}
            catalogSync={catalogSync}
            exportStepDisplay={exportStepDisplay}
            showCatalogStep={showCatalogStep}
            variant="actions"
            onSeeDetails={handleSeeDetails}
            onRetry={canNewVersion ? onNewVersionClick : undefined}
            onPushToCatalog={canAddToCatalog ? onAddToCatalog : undefined}
            onOpenCatalog={() => navigate(ROUTE.CATALOG)}
          />
        </Td>
        <Td dataLabel={t('Last updated')}>{getDateDisplay(imageBuild.metadata.creationTimestamp)}</Td>
        <Td>
          <ImageBuildRowKebab
            buildName={imageBuildName}
            onViewDetails={() => navigate({ route: ROUTE.IMAGE_BUILD_DETAILS, postfix: imageBuildName })}
            onRetryBuild={canNewVersion ? onNewVersionClick : undefined}
            onNewPushToCatalog={canAddToCatalog ? onAddToCatalog : undefined}
            onCancel={canCancel && isImageBuildCancelable(buildReason) ? onCancelClick : undefined}
            onDelete={canDelete && !isImageBuildCancelable(buildReason) ? onDeleteClick : undefined}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={9}>
          <ExpandableRowContent>
            <Stack hasGutter>
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 0 }}>
                      {t('Build information')}
                    </Title>
                  </StackItem>
                  {buildReason === ImageBuildConditionReason.ImageBuildConditionReasonFailed && (
                    <StackItem>
                      <Alert
                        isInline
                        variant="danger"
                        title={t('Build failed')}
                        customIcon={<ExclamationCircleIcon />}
                        actionLinks={
                          canNewVersion ? (
                            <AlertActionLink onClick={onNewVersionClick}>{t('Retry build')}</AlertActionLink>
                          ) : undefined
                        }
                      >
                        {t(
                          'This is a long error message placeholder for the image build failure state. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. The message continues so reviewers can validate truncation, scrolling, and layout when real backend errors are verbose.',
                        )}
                      </Alert>
                    </StackItem>
                  )}
                  <StackItem>
                    <Button
                      variant="link"
                      onClick={() => navigate({ route: ROUTE.IMAGE_BUILD_DETAILS, postfix: imageBuildName })}
                    >
                      {t('View more')}
                    </Button>
                  </StackItem>
                </Stack>
              </StackItem>
              <StackItem>
                <ImageBuildExportsGallery imageBuild={imageBuild} refetch={refetch} />
              </StackItem>
            </Stack>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default ImageBuildRow;
