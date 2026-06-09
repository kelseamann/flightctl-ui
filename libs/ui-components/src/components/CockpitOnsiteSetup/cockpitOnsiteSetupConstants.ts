/** Default Cockpit URL when the device exposes a temporary setup access point. */
export const MOCK_DEVICE_COCKPIT_URL = 'http://192.168.100.1:9090';

export const MOCK_SETUP_ETHERNET_CIDR = '192.168.100.1/24';

export const MOCK_SETUP_WIFI_SSID = 'flightctl-a1b2c3d4';

export const MOCK_WIFI_SCAN_RESULTS = ['Corp-WiFi-5G', 'GuestNetwork', 'Warehouse-IoT'] as const;

export const MOCK_FLIGHT_CONTROL_CONSOLE_URL = 'https://flightctl.example.com';

export const COCKPIT_ONSITE_SETUP_STEP_ORDER = [
  'entry',
  'general',
  'network',
  'enrollment',
  'review',
  'confirmation',
] as const;

export const COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER = [...COCKPIT_ONSITE_SETUP_STEP_ORDER] as const;

export type CockpitOnsiteSetupStepId = (typeof COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER)[number];

export type DetectedNetworkOption = {
  id: NetworkConnectionTypeId;
  labelKey: string;
  descriptionKey: string;
  state: 'active' | 'inactive';
  recommended?: boolean;
};

type NetworkConnectionTypeId = 'ethernet' | 'wifi' | 'other';

export const DETECTED_NETWORK_OPTIONS: DetectedNetworkOption[] = [
  {
    id: 'ethernet',
    labelKey: 'Ethernet',
    descriptionKey:
      'Active — recommended for production configuration when a wired interface is available on the setup network',
    state: 'active',
    recommended: true,
  },
  {
    id: 'wifi',
    labelKey: 'Wi-Fi',
    descriptionKey:
      'Join a wireless network for production. SSID scanning is unavailable while the device Wi-Fi radio is in access point mode',
    state: 'inactive',
  },
  {
    id: 'other',
    labelKey: 'Other',
    descriptionKey: 'Additional interfaces detected by NetworkManager, including VLAN parent interfaces',
    state: 'inactive',
  },
];
