import { TFunction } from 'i18next';

import { CockpitOnsiteSetupValues, EnrollmentFailureCode } from './types';

export const getDeviceInfoSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const parts = [values.hostname || t('localhost')];
  if (values.labels.trim()) {
    parts.push(values.labels.trim());
  }
  if (values.description.trim()) {
    parts.push(values.description.trim());
  }
  return parts.join(' · ');
};

const formatIpv4Mode = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  switch (values.ipv4Mode) {
    case 'auto':
      return t('IPv4 automatic (DHCP)');
    case 'disabled':
      return t('IPv4 disabled');
    default:
      return `${t('IPv4 static')}: ${values.ipv4Address}`;
  }
};

const formatIpv6Mode = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  switch (values.ipv6Mode) {
    case 'auto':
      return t('IPv6 automatic');
    case 'dhcp':
      return t('IPv6 DHCP');
    case 'disabled':
      return t('IPv6 disabled');
    default:
      return `${t('IPv6 static')}: ${values.ipv6Address}`;
  }
};

export const getNetworkSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const connection =
    values.networkConnectionType === 'ethernet'
      ? t('Ethernet')
      : values.networkConnectionType === 'wifi'
        ? `${t('Wi-Fi')} (${values.wifiSsid || t('SSID not set')})`
        : t('Other');
  const vlan = values.vlanId.trim() ? `${t('VLAN')}: ${values.vlanId}` : t('No VLAN');
  const ntp =
    values.ntpMode === 'automatic'
      ? t('NTP automatic')
      : values.ntpServer.trim()
        ? `${t('NTP')}: ${values.ntpServer}`
        : t('NTP not configured');
  const proxies = values.httpProxies.map((p) => p.trim()).filter(Boolean);
  const proxySummary =
    proxies.length > 0 ? `${t('HTTP proxy')}: ${proxies.join(', ')}` : t('No HTTP proxy configured');
  const gateway =
    values.ipv4Mode === 'static' && values.ipv4Gateway.trim()
      ? `${t('Gateway')}: ${values.ipv4Gateway}`
      : null;
  return [connection, vlan, formatIpv4Mode(values, t), formatIpv6Mode(values, t), gateway, `${t('DNS')}: ${values.dnsServers}`, ntp, proxySummary]
    .filter(Boolean)
    .join(' · ');
};

export const getEnrollmentConfigSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  if (values.enrollmentServiceMode === 'skipped') {
    return t('Flight Control: enrollment credentials already provisioned (skipped)');
  }
  if (values.enrollmentServiceMode === 'connectivity_only') {
    return t('Flight Control: verify connectivity only (device already enrolled)');
  }
  const auth = values.enrollmentCredentialMode === 'token' ? t('Auth token') : t('Username and password');
  const endpoint = values.flightControlEndpoint.trim() || t('Default endpoint from Cockpit config');
  return `${t('Flight Control')}: ${endpoint} (${auth})`;
};

export const maskSecret = (value: string): string => (value ? '••••••••' : '—');

export const getEnrollmentFailureMessage = (code: EnrollmentFailureCode | undefined, t: TFunction): string => {
  switch (code) {
    case 2:
      return t('flightctl-agent enroll rejected the credentials. Correct the auth token or username and password, then apply again.');
    case 3:
      return t('Flight Control server is unreachable. Verify the endpoint URL and network path, then try again.');
    case 4:
      return t('A network error occurred during enrollment. Network settings were rolled back so you can reconnect to Cockpit and retry.');
    default:
      return t('Return to the device Cockpit session to review flightctl-agent output and retry.');
  }
};
