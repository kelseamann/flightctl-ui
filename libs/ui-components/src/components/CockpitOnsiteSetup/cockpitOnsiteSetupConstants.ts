/** Default Cockpit URL when the device exposes a temporary setup access point. */
export const MOCK_DEVICE_COCKPIT_URL = 'https://192.168.100.1:9090';

export const COCKPIT_ONSITE_SETUP_STEP_ORDER = [
  'welcome',
  'hostname',
  'interface',
  'addressing',
  'services',
  'enrollment',
  'review',
] as const;

export const COCKPIT_ONSITE_SETUP_PROGRESS_STEP = 'progress' as const;

export const COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER = [
  ...COCKPIT_ONSITE_SETUP_STEP_ORDER,
  COCKPIT_ONSITE_SETUP_PROGRESS_STEP,
] as const;

export type CockpitOnsiteSetupStepId = (typeof COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER)[number];

export type MockWifiNetwork = {
  bssid: string;
  ssid: string;
  strength: number;
  security: string;
  channel: number;
};

export const MOCK_WIFI_NETWORKS: MockWifiNetwork[] = [
  { bssid: 'aa:bb:cc:01', ssid: 'office-wifi', strength: 88, security: 'WPA2', channel: 36 },
  { bssid: 'aa:bb:cc:02', ssid: 'plant-floor', strength: 72, security: 'WPA2', channel: 11 },
  { bssid: 'aa:bb:cc:03', ssid: 'guest-network', strength: 45, security: 'None', channel: 6 },
];
