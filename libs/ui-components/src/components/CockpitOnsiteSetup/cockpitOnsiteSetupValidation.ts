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

export const isNetworkStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

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
