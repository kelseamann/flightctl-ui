import { Device, EnrollmentRequest } from '@flightctl/types';

export const FIRST_BOOT_CUSTOMIZATION_LABEL = 'flightctl.io/first-boot-customization';
export const PROVISIONING_SOURCE_LABEL = 'flightctl.io/provisioning';

export type ProvisioningSource = 'cockpit' | 'unknown';

const readProvisioningSource = (labels?: Record<string, string>): ProvisioningSource => {
  const raw = labels?.[PROVISIONING_SOURCE_LABEL]?.trim().toLowerCase();
  if (raw === 'cockpit') {
    return 'cockpit';
  }
  return 'unknown';
};

export const getProvisioningSourceFromLabels = (labels?: Record<string, string>): ProvisioningSource =>
  readProvisioningSource(labels);

export const getEnrollmentProvisioningSource = (enrollmentRequest: EnrollmentRequest): ProvisioningSource => {
  const fromSpec = readProvisioningSource(enrollmentRequest.spec?.labels);
  if (fromSpec !== 'unknown') {
    return fromSpec;
  }
  return readProvisioningSource(enrollmentRequest.metadata?.labels);
};

export const getDeviceProvisioningSource = (device: Device): ProvisioningSource =>
  readProvisioningSource(device.metadata?.labels);

export enum FirstBootCustomizationStatus {
  NotApplicable = 'not-applicable',
  Awaiting = 'awaiting',
  InProgress = 'in-progress',
  Complete = 'complete',
  Skipped = 'skipped',
}

const LABEL_TO_STATUS: Record<string, FirstBootCustomizationStatus> = {
  awaiting: FirstBootCustomizationStatus.Awaiting,
  'in-progress': FirstBootCustomizationStatus.InProgress,
  complete: FirstBootCustomizationStatus.Complete,
  skipped: FirstBootCustomizationStatus.Skipped,
};

const readLabelValue = (labels?: Record<string, string>): FirstBootCustomizationStatus => {
  const raw = labels?.[FIRST_BOOT_CUSTOMIZATION_LABEL]?.trim().toLowerCase();
  if (!raw) {
    return FirstBootCustomizationStatus.NotApplicable;
  }
  return LABEL_TO_STATUS[raw] ?? FirstBootCustomizationStatus.NotApplicable;
};

export const getEnrollmentFirstBootCustomizationStatus = (
  enrollmentRequest: EnrollmentRequest,
): FirstBootCustomizationStatus => {
  const fromSpec = readLabelValue(enrollmentRequest.spec?.labels);
  if (fromSpec !== FirstBootCustomizationStatus.NotApplicable) {
    return fromSpec;
  }
  return readLabelValue(enrollmentRequest.metadata?.labels);
};

export const getDeviceFirstBootCustomizationStatus = (device: Device): FirstBootCustomizationStatus =>
  readLabelValue(device.metadata?.labels);
