import * as React from 'react';
import { Label } from '@patternfly/react-core';
import { DesktopIcon } from '@patternfly/react-icons/dist/js/icons/desktop-icon';

import { getProvisioningSourceLabel } from '../../utils/onboardingJourney';
import { useTranslation } from '../../hooks/useTranslation';

const ProvisioningSourceLabel = () => {
  const { t } = useTranslation();

  return (
    <Label variant="outline" icon={<DesktopIcon />}>
      {getProvisioningSourceLabel(t)}
    </Label>
  );
};

export default ProvisioningSourceLabel;
