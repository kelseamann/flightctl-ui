import { CockpitOnsiteSetupValues } from './types';

export const isEntryStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export const isGeneralStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export const isNetworkStepValid = (values: CockpitOnsiteSetupValues): boolean =>
  !!values.ipv4Address.trim() && !!values.dnsServers.trim() && !!values.ipv4Gateway.trim();

export const isEnrollmentStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (!values.flightControlEnabled) {
    return false;
  }
  if (values.enrollmentCredentialMode === 'token') {
    return !!values.flightControlToken.trim();
  }
  return !!values.flightControlUsername.trim() && !!values.flightControlPassword.trim();
};

export const isReviewStepValid = (values: CockpitOnsiteSetupValues): boolean =>
  isGeneralStepValid(values) && isNetworkStepValid(values) && isEnrollmentStepValid(values);

export const isConfirmationStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;
