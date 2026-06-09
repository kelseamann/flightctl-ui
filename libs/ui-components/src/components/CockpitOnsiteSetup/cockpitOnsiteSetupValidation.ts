import { CockpitOnsiteSetupValues } from './types';

const isValidVlanId = (value: string): boolean => {
  if (!value.trim()) {
    return true;
  }
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= 4094;
};

export const isEntryStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export const isGeneralStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export const isNetworkStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (!isValidVlanId(values.vlanId)) {
    return false;
  }
  if (values.networkConnectionType === 'wifi' && !values.wifiSsid.trim()) {
    return false;
  }
  if (values.networkConnectionType === 'wifi' && values.wifiPassword.trim().length > 0) {
    const len = values.wifiPassword.trim().length;
    if (len < 8 || len > 63) {
      return false;
    }
  }
  if (values.ipv4Mode === 'static') {
    return !!values.ipv4Address.trim() && !!values.dnsServers.trim();
  }
  if (values.ipv6Mode === 'static') {
    return !!values.ipv6Address.trim();
  }
  return true;
};

export const isEnrollmentStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (values.enrollmentServiceMode === 'connectivity_only' || values.enrollmentServiceMode === 'skipped') {
    return true;
  }
  if (values.enrollmentCredentialMode === 'token') {
    return !!values.flightControlToken.trim();
  }
  return !!values.flightControlUsername.trim() && !!values.flightControlPassword.trim();
};

export const isReviewStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (values.singleNicSetup && !values.singleNicWarningAcknowledged) {
    return false;
  }
  return isGeneralStepValid(values) && isNetworkStepValid(values) && isEnrollmentStepValid(values);
};

export const isConfirmationStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;
