import { TFunction } from 'i18next';

import { CockpitOnsiteSetupValues } from './types';

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

export const getNetworkSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  const connection =
    values.networkConnectionType === 'ethernet'
      ? t('Ethernet')
      : values.networkConnectionType === 'wifi'
        ? t('Wi-Fi')
        : t('Other');
  const ntp = values.ntpServer.trim() ? `${t('NTP')}: ${values.ntpServer}` : t('NTP not configured');
  const proxies = values.httpProxies.map((p) => p.trim()).filter(Boolean);
  const proxySummary =
    proxies.length > 0 ? `${t('HTTP proxy')}: ${proxies.join(', ')}` : t('No HTTP proxy configured');
  return `${connection} · ${values.ipv4Address} · ${t('DNS')}: ${values.dnsServers} · ${t('Gateway')}: ${values.ipv4Gateway} · ${ntp} · ${proxySummary}`;
};

export const getEnrollmentConfigSummary = (values: CockpitOnsiteSetupValues, t: TFunction): string => {
  if (!values.flightControlEnabled) {
    return '—';
  }
  const auth = values.enrollmentCredentialMode === 'token' ? t('Setup token') : t('Username and password');
  const endpoint = values.flightControlEndpoint.trim() || t('Default endpoint');
  return `${t('Flight Control')}: ${endpoint} (${auth})`;
};

export const maskSecret = (value: string): string => (value ? '••••••••' : '—');
