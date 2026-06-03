import * as React from 'react';

import { Device, EnrollmentRequest } from '@flightctl/types';

import {
  FirstBootCustomizationStatus as FirstBootCustomizationStatusType,
  getDeviceFirstBootCustomizationStatus,
  getEnrollmentFirstBootCustomizationStatus,
} from '../../utils/firstBootCustomization';
import { getFirstBootCustomizationStatusItems } from '../../utils/status/firstBootCustomization';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from './StatusDisplay';

type FirstBootCustomizationStatusProps = {
  enrollmentRequest?: EnrollmentRequest;
  device?: Device;
};

const FirstBootCustomizationStatus = ({ enrollmentRequest, device }: FirstBootCustomizationStatusProps) => {
  const { t } = useTranslation();
  const statusItems = getFirstBootCustomizationStatusItems(t);

  const status = React.useMemo(() => {
    if (device) {
      return getDeviceFirstBootCustomizationStatus(device);
    }
    if (enrollmentRequest) {
      return getEnrollmentFirstBootCustomizationStatus(enrollmentRequest);
    }
    return FirstBootCustomizationStatusType.NotApplicable;
  }, [device, enrollmentRequest]);

  const item = statusItems.find((statusItem) => statusItem.id === status);
  return <StatusDisplay item={item} />;
};

export default FirstBootCustomizationStatus;
