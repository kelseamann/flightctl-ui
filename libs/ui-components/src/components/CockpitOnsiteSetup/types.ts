export type NetworkConnectionType = 'ethernet' | 'wifi' | 'other';

export type Ipv4Mode = 'auto' | 'static' | 'disabled';

export type Ipv6Mode = 'auto' | 'dhcp' | 'static' | 'disabled';

export type NtpMode = 'automatic' | 'manual';

export type EnrollmentCredentialMode = 'token' | 'username_password';

export type EnrollmentServiceMode = 'provision' | 'connectivity_only' | 'skipped';

export type EnrollmentOutcome = 'idle' | 'running' | 'success' | 'failure';

export type EnrollmentFailureCode = 2 | 3 | 4;

export type CockpitOnsiteSetupValues = {
  serviceName: string;
  hostname: string;
  labels: string;
  description: string;
  networkConnectionType: NetworkConnectionType;
  ipv4Mode: Ipv4Mode;
  ipv4Address: string;
  dnsServers: string;
  ipv4Gateway: string;
  ipv6Mode: Ipv6Mode;
  ipv6Address: string;
  ipv6Dns: string;
  vlanId: string;
  wifiSsid: string;
  wifiPassword: string;
  ntpMode: NtpMode;
  ntpServer: string;
  httpProxies: string[];
  proxyUsername: string;
  proxyPassword: string;
  flightControlEndpoint: string;
  enrollmentServiceMode: EnrollmentServiceMode;
  enrollmentCredentialMode: EnrollmentCredentialMode;
  flightControlToken: string;
  flightControlUsername: string;
  flightControlPassword: string;
  /** True when production network uses the same NIC as the operator browser session. */
  singleNicSetup: boolean;
  singleNicWarningAcknowledged: boolean;
};

export const defaultCockpitOnsiteSetupValues: CockpitOnsiteSetupValues = {
  serviceName: 'Flight Control',
  hostname: 'localhost',
  labels: '',
  description: '',
  networkConnectionType: 'ethernet',
  ipv4Mode: 'static',
  ipv4Address: '192.168.1.50',
  dnsServers: '192.168.1.1',
  ipv4Gateway: '192.168.1.1',
  ipv6Mode: 'auto',
  ipv6Address: '',
  ipv6Dns: '',
  vlanId: '',
  wifiSsid: '',
  wifiPassword: '',
  ntpMode: 'automatic',
  ntpServer: '',
  httpProxies: [''],
  proxyUsername: '',
  proxyPassword: '',
  flightControlEndpoint: '',
  enrollmentServiceMode: 'provision',
  enrollmentCredentialMode: 'token',
  flightControlToken: '',
  flightControlUsername: '',
  flightControlPassword: '',
  singleNicSetup: false,
  singleNicWarningAcknowledged: false,
};
