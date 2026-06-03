export type AddressingMode = 'dhcp' | 'static';

export type Ipv6Method = 'disabled' | 'auto' | 'static';

export type WifiSecurity = 'none' | 'wep' | 'wpa';

export type EnrollmentCredentialMode = 'token' | 'username_password';

export type MockNetworkInterface = {
  name: string;
  deviceType: string;
  mac: string;
  state: string;
};

export type CockpitOnsiteSetupValues = {
  /** True when the integrator reached Cockpit via the device temporary Wi‑Fi AP. */
  connectedViaDeviceAp: boolean;
  deviceCockpitUrl: string;
  hostname: string;
  networkInterface: string;
  vlanEnabled: boolean;
  vlanId: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  wifiSelectedBssid: string;
  addressingMode: AddressingMode;
  ipv4Address: string;
  ipv4SubnetMask: string;
  ipv4Gateway: string;
  ipv4AutoDns: boolean;
  ipv4PrimaryDns: string;
  ipv4SecondaryDns: string;
  ipv6Method: Ipv6Method;
  ipv6Address: string;
  ipv6Gateway: string;
  ntpAutoConfig: boolean;
  ntpServer: string;
  proxyEnabled: boolean;
  httpProxyHost: string;
  httpProxyPort: string;
  httpProxyUsername: string;
  httpProxyPassword: string;
  flightControlEnabled: boolean;
  flightControlEndpoint: string;
  enrollmentCredentialMode: EnrollmentCredentialMode;
  flightControlToken: string;
  flightControlUsername: string;
  flightControlPassword: string;
  insightsEnabled: boolean;
  insightsOrganizationId: string;
  insightsActivationKey: string;
  insightsDisableRemoteManagement: boolean;
};

export const defaultCockpitOnsiteSetupValues: CockpitOnsiteSetupValues = {
  connectedViaDeviceAp: true,
  deviceCockpitUrl: 'https://192.168.100.1:9090',
  hostname: '',
  networkInterface: '',
  vlanEnabled: false,
  vlanId: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'wpa',
  wifiSelectedBssid: '',
  addressingMode: 'dhcp',
  ipv4Address: '',
  ipv4SubnetMask: '255.255.255.0',
  ipv4Gateway: '',
  ipv4AutoDns: true,
  ipv4PrimaryDns: '',
  ipv4SecondaryDns: '',
  ipv6Method: 'disabled',
  ipv6Address: '',
  ipv6Gateway: '',
  ntpAutoConfig: true,
  ntpServer: '',
  proxyEnabled: false,
  httpProxyHost: '',
  httpProxyPort: '',
  httpProxyUsername: '',
  httpProxyPassword: '',
  flightControlEnabled: true,
  flightControlEndpoint: '',
  enrollmentCredentialMode: 'token',
  flightControlToken: '',
  flightControlUsername: '',
  flightControlPassword: '',
  insightsEnabled: false,
  insightsOrganizationId: '',
  insightsActivationKey: '',
  insightsDisableRemoteManagement: false,
};

export const MOCK_NETWORK_INTERFACES: MockNetworkInterface[] = [
  { name: 'eth0', deviceType: 'ethernet', mac: '52:54:00:12:34:56', state: 'Connected' },
  { name: 'eth1', deviceType: 'ethernet', mac: '52:54:00:12:34:57', state: 'Disconnected' },
  { name: 'wlan0', deviceType: '802-11-wireless', mac: '52:54:00:ab:cd:ef', state: 'Disconnected' },
];

export const isWifiInterface = (interfaceName: string): boolean =>
  MOCK_NETWORK_INTERFACES.find((iface) => iface.name === interfaceName)?.deviceType === '802-11-wireless';

/** Wi‑Fi scan is available when onboarding over wlan and not still on the device AP session. */
export const isWifiScanAvailable = (values: CockpitOnsiteSetupValues): boolean =>
  isWifiInterface(values.networkInterface) && !values.connectedViaDeviceAp;
