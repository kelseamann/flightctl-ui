import { CockpitOnsiteSetupValues, LabelKeyValue, LabelMapping } from './types';

const isKeyValueRowComplete = (row: LabelKeyValue): boolean => {
  const hasKey = row.key.trim().length > 0;
  const hasValue = row.value.trim().length > 0;
  if (!hasKey && !hasValue) {
    return true;
  }
  return hasKey && hasValue;
};

const isMappingRowComplete = (row: LabelMapping): boolean => {
  const hasKey = row.key.trim().length > 0;
  const hasField = row.systemInfoField.trim().length > 0;
  if (!hasKey && !hasField) {
    return true;
  }
  return hasKey && hasField;
};

const hasRequiredValue = (value: string): boolean => value.trim().length > 0;

export const isNetworkStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (values.ipv4Mode === 'static') {
    if (
      !hasRequiredValue(values.ipv4Address) ||
      !hasRequiredValue(values.ipv4SubnetMask) ||
      !hasRequiredValue(values.ipv4Gateway)
    ) {
      return false;
    }
  }

  if (!values.ipv4AutoDns) {
    if (!hasRequiredValue(values.ipv4PrimaryDns) || !hasRequiredValue(values.ipv4SecondaryDns)) {
      return false;
    }
  }

  if (values.ipv6Mode === 'static') {
    if (!hasRequiredValue(values.ipv6Address) || !hasRequiredValue(values.ipv6Gateway)) {
      return false;
    }
  }

  if (values.ipv6Mode !== 'disabled' && !values.ipv6AutoDns) {
    if (!hasRequiredValue(values.ipv6PrimaryDns) || !hasRequiredValue(values.ipv6SecondaryDns)) {
      return false;
    }
  }

  return true;
};

export const isEnrollmentStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (!values.flightControlEnrollmentEnabled) {
    return true;
  }
  if (values.authenticationMethod === 'token') {
    return !!values.flightControlToken.trim();
  }
  return !!values.flightControlUsername.trim() && !!values.flightControlPassword.trim();
};

export const isLabelsStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (!values.hostname.trim()) {
    return false;
  }
  if (!values.customLabels.every(isKeyValueRowComplete)) {
    return false;
  }
  if (!values.labelMappings.every(isMappingRowComplete)) {
    return false;
  }
  return true;
};

export const isConfirmationStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;
