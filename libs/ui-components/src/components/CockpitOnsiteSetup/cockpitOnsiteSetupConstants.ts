/** Default Cockpit URL when the device exposes a temporary setup access point. */
export const MOCK_DEVICE_COCKPIT_URL = 'https://192.168.100.1:9090';

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
    descriptionKey: 'Active — recommended when wireless is unavailable during Cockpit setup',
    state: 'active',
    recommended: true,
  },
  {
    id: 'wifi',
    labelKey: 'Wi-Fi',
    descriptionKey: 'Inactive — Cockpit can join a wireless network when the interface is not in access point mode',
    state: 'inactive',
  },
  {
    id: 'other',
    labelKey: 'Other',
    descriptionKey: 'Additional interfaces detected by NetworkManager on the device',
    state: 'inactive',
  },
];
