import * as React from 'react';
import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

type ImageBuildRowActionsProps = {
  buildName: string;
  actionLabel: string;
  onAction?: () => void;
  showExternalLinkIcon?: boolean;
};

const ImageBuildRowActions = ({
  buildName,
  actionLabel,
  onAction,
  showExternalLinkIcon = false,
}: ImageBuildRowActionsProps) => (
  <div className="rhem-row-action-cell">
    <Button
      variant="link"
      size="sm"
      className="rhem-row-action-link"
      aria-label={`${actionLabel} for ${buildName}`}
      onClick={onAction}
      icon={showExternalLinkIcon ? <ExternalLinkAltIcon /> : undefined}
      iconPosition="end"
    >
      {actionLabel}
    </Button>
  </div>
);

export default ImageBuildRowActions;
