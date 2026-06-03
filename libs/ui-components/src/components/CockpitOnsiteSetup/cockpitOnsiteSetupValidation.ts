import { CockpitOnsiteSetupValues, isWifiInterface, isWifiScanAvailable } from './types';

const HOSTNAME_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?)*$/;

export const isWelcomeStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export const isHostnameStepValid = (values: CockpitOnsiteSetupValues): boolean =>
  !!values.hostname.trim() && HOSTNAME_PATTERN.test(values.hostname.trim());

export const isNetworkInterfaceStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (!values.networkInterface) {
    return false;
  }
  if (values.vlanEnabled && !values.vlanId.trim()) {
    return false;
  }
  if (isWifiInterface(values.networkInterface)) {
    return !!values.wifiSsid.trim();
  }
  return true;
};

export const isNetworkAddressStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (values.addressingMode === 'dhcp') {
    if (values.ipv6Method === 'static') {
      return !!values.ipv6Address.trim();
    }
    return true;
  }
  const ipv4Valid = !!values.ipv4Address.trim() && !!values.ipv4Gateway.trim();
  if (values.ipv6Method === 'static') {
    return ipv4Valid && !!values.ipv6Address.trim();
  }
  return ipv4Valid;
};

export const isNetworkServicesStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  if (values.proxyEnabled) {
    return !!values.httpProxyHost.trim() && !!values.httpProxyPort.trim();
  }
  return true;
};

export const isEnrollmentStepValid = (values: CockpitOnsiteSetupValues): boolean => {
  const flightControlValid = (() => {
    if (!values.flightControlEnabled) {
      return true;
    }
    if (!values.flightControlEndpoint.trim()) {
      return false;
    }
    if (values.enrollmentCredentialMode === 'token') {
      return !!values.flightControlToken.trim();
    }
    return !!values.flightControlUsername.trim() && !!values.flightControlPassword.trim();
  })();

  const insightsValid = (() => {
    if (!values.insightsEnabled) {
      return true;
    }
    return !!values.insightsOrganizationId.trim() && !!values.insightsActivationKey.trim();
  })();

  return flightControlValid && insightsValid;
};

export const isReviewStepValid = (values: CockpitOnsiteSetupValues): boolean =>
  isHostnameStepValid(values) &&
  isNetworkInterfaceStepValid(values) &&
  isNetworkAddressStepValid(values) &&
  isNetworkServicesStepValid(values) &&
  isEnrollmentStepValid(values);

export const isProgressStepValid = (_values: CockpitOnsiteSetupValues): boolean => true;

export { isWifiScanAvailable };
