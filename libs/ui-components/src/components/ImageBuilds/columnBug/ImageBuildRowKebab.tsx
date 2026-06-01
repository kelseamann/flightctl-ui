import * as React from 'react';
import { Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/js/icons/ellipsis-v-icon';

import { useTranslation } from '../../../hooks/useTranslation';

export const VIEW_DETAILS_ACTION = 'view-details';
export const RETRY_BUILD_ACTION = 'retry-build';
export const NEW_PUSH_TO_CATALOG_ACTION = 'new-push-to-catalog';
export const DELETE_IMAGE_BUILD_ACTION = 'delete-image-build';
export const CANCEL_IMAGE_BUILD_ACTION = 'cancel-image-build';

type ImageBuildRowKebabProps = {
  buildName: string;
  onViewDetails: () => void;
  onRetryBuild?: () => void;
  onNewPushToCatalog?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

const ImageBuildRowKebab = ({
  buildName,
  onViewDetails,
  onRetryBuild,
  onNewPushToCatalog,
  onCancel,
  onDelete,
}: ImageBuildRowKebabProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const menuActions = React.useMemo(
    () =>
      [
        { id: VIEW_DETAILS_ACTION, label: t('View details'), onClick: onViewDetails },
        onRetryBuild ? { id: RETRY_BUILD_ACTION, label: t('Retry build'), onClick: onRetryBuild } : undefined,
        onNewPushToCatalog
          ? {
              id: NEW_PUSH_TO_CATALOG_ACTION,
              label: t('New push to catalog'),
              onClick: onNewPushToCatalog,
            }
          : undefined,
        onCancel ? { id: CANCEL_IMAGE_BUILD_ACTION, label: t('Cancel image build'), onClick: onCancel } : undefined,
        onDelete ? { id: DELETE_IMAGE_BUILD_ACTION, label: t('Delete image build'), onClick: onDelete } : undefined,
      ].filter((action): action is NonNullable<typeof action> => Boolean(action)),
    [onCancel, onDelete, onNewPushToCatalog, onRetryBuild, onViewDetails, t],
  );

  const onSelect = (_event: unknown, value?: string | number) => {
    setIsOpen(false);
    const action = menuActions.find((item) => item.id === value);
    action?.onClick();
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          aria-label={t('More actions for {{buildName}}', { buildName })}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        {menuActions.map((action) => (
          <DropdownItem key={action.id} value={action.id}>
            {action.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default ImageBuildRowKebab;
