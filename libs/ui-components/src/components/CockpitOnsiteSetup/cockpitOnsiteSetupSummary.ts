import { TFunction } from 'i18next';

import { CockpitOnsiteSetupValues } from './types';

export const getDeviceInfoSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const parts = [values.hostname || t('example-endpoint-123')];
  if (values.deviceAlias.trim()) {
    parts.push(values.deviceAlias.trim());
  }
  return parts.join(' · ');
};

export const getNetworkSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const connection = `${values.selectedNetworkInterface} (${t('Ethernet')})`;
  const vlan = values.vlanId.trim() ? `${t('VLAN')}: ${values.vlanId}` : t('No VLAN');
  const ipv4 = values.ipv4Mode === 'dhcpv4' ? t('DHCPv4') : t('Static IP');
  const ipv6 =
    values.ipv6Mode === 'disabled' ? t('Disabled') : values.ipv6Mode === 'dhcpv6' ? t('DHCPv6') : t('Static IP');
  const ntp = values.ntpServerHostname.trim() || t('No NTP servers configured');
  const proxy = values.proxyHostname.trim()
    ? `${values.proxyProtocol}://${values.proxyHostname}:${values.proxyPort}`
    : t('No HTTP proxy configured');
  return [connection, vlan, ipv4, ipv6, ntp, proxy].join(' · ');
};

export const getEnrollmentConfigSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  if (!values.flightControlEnrollmentEnabled) {
    return t('Flight Control enrollment skipped');
  }
  const auth = values.authenticationMethod === 'token' ? t('Token') : t('Username and password');
  return `${t('Flight Control')}: ${values.serviceEndpoint || t('example-endpoint-123')} (${auth})`;
};

export const maskSecret = (value: string): string => (value ? '••••••••' : '—');

export const getEnrollmentFailureMessage = (
  _code: import('./types').EnrollmentFailureCode | undefined,
  t: TFunction,
): string => t('Return to the device Cockpit session to review flightctl-agent output and retry.');
