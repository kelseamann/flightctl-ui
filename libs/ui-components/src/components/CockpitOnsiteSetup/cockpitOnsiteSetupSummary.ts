import { TFunction } from 'i18next';

import { CockpitOnsiteSetupValues, isWifiInterface } from './types';

export const getIpv4Summary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  if (values.addressingMode === 'dhcp') {
    return t('Automatic (DHCP)');
  }
  const dns = values.ipv4AutoDns
    ? t('DNS automatic')
    : [values.ipv4PrimaryDns, values.ipv4SecondaryDns].filter(Boolean).join(', ') || '—';
  return `${values.ipv4Address}/${values.ipv4SubnetMask} · ${values.ipv4Gateway} · ${dns}`;
};

export const getIpv6Summary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  switch (values.ipv6Method) {
    case 'auto':
      return t('Automatic (DHCP)');
    case 'static':
      return values.ipv6Address ? `${values.ipv6Address}${values.ipv6Gateway ? ` · ${values.ipv6Gateway}` : ''}` : '—';
    default:
      return t('Disabled');
  }
};

export const getNetworkInterfaceSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const parts = [values.networkInterface || '—'];
  if (values.vlanEnabled && values.vlanId) {
    parts.push(`${t('VLAN')} ${values.vlanId}`);
  }
  if (isWifiInterface(values.networkInterface) && values.wifiSsid) {
    parts.push(values.wifiSsid);
  }
  return parts.join(' · ');
};

export const getServicesSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const ntp = values.ntpAutoConfig ? t('NTP automatic') : values.ntpServer || t('NTP manual');
  const proxy = values.proxyEnabled
    ? `${values.httpProxyHost}:${values.httpProxyPort}`
    : t('Proxy not configured');
  return `${ntp} · ${proxy}`;
};

export const getEnrollmentSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const parts: string[] = [];
  if (values.flightControlEnabled) {
    const auth =
      values.enrollmentCredentialMode === 'token'
        ? t('Setup token')
        : `${values.flightControlUsername} / ${t('password')}`;
    parts.push(`${t('Flight Control')}: ${values.flightControlEndpoint || '—'} (${auth})`);
  }
  if (values.insightsEnabled) {
    parts.push(`${t('Red Hat Insights')}: ${values.insightsOrganizationId || '—'}`);
  }
  if (parts.length === 0) {
    return t('Skip enrollment');
  }
  return parts.join(' · ');
};

export const maskSecret = (value: string): string => (value ? '••••••••' : '—');
