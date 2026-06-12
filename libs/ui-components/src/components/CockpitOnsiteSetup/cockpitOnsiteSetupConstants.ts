/** Default Cockpit URL when the device exposes a temporary setup access point. */
export const MOCK_DEVICE_COCKPIT_URL = 'http://192.168.100.1:9090';

export const MOCK_SETUP_ETHERNET_CIDR = '192.168.100.1/24';

export const MOCK_SETUP_WIFI_SSID = 'flightctl-a1b2c3d4';

export const COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER = ['network', 'enrollment', 'labels', 'confirmation'] as const;

export const COCKPIT_ONSITE_SETUP_STEP_ORDER = COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER;

export type CockpitOnsiteSetupStepId = (typeof COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER)[number];

export type FigmaNetworkInterfaceRow = {
  device: string;
  macAddress: string;
  speed: string;
  driver: string;
  type: string;
};

export const FIGMA_NETWORK_INTERFACES: FigmaNetworkInterfaceRow[] = [
  {
    device: 'eth0',
    macAddress: '00:00:00:00:00:00',
    speed: '1000 Mb/s',
    driver: 'igc',
    type: 'Ethernet',
  },
  {
    device: 'eth1',
    macAddress: '00:11:22:33:44:55',
    speed: '100 Mb/s',
    driver: 'e1000',
    type: 'Ethernet',
  },
  {
    device: 'eth2',
    macAddress: '00:AA:BB:CC:DD:EE',
    speed: '1000 Mb/s',
    driver: 'igc',
    type: 'Ethernet',
  },
];
