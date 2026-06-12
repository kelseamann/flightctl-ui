export type Ipv4Mode = 'dhcpv4' | 'static';

export type Ipv6Mode = 'dhcpv6' | 'static' | 'disabled';

export type ProxyProtocol = 'HTTP' | 'HTTPS';

export type EnrollmentCredentialsSource = 'existing' | 'new';

export type AuthenticationMethod = 'token' | 'username_password';

export type EnrollmentOutcome = 'idle' | 'running' | 'success' | 'failure';

export type EnrollmentFailureCode = 2 | 3 | 4;

export type LabelKeyValue = {
  key: string;
  value: string;
};

export type LabelMapping = {
  key: string;
  systemInfoField: string;
};

export type CockpitOnsiteSetupValues = {
  selectedNetworkInterface: string;
  vlanId: string;
  ipv4Mode: Ipv4Mode;
  ipv4AutoDns: boolean;
  ipv4Address: string;
  ipv4SubnetMask: string;
  ipv4Gateway: string;
  ipv4PrimaryDns: string;
  ipv4SecondaryDns: string;
  ipv6Mode: Ipv6Mode;
  ipv6AutoDns: boolean;
  ipv6Address: string;
  ipv6Gateway: string;
  ipv6PrimaryDns: string;
  ipv6SecondaryDns: string;
  ntpServerHostname: string;
  proxyProtocol: ProxyProtocol;
  proxyHostname: string;
  proxyPort: string;
  proxyUsername: string;
  proxyPassword: string;
  proxyNoProxy: string;
  flightControlEnrollmentEnabled: boolean;
  enrollmentCredentialsSource: EnrollmentCredentialsSource;
  serviceEndpoint: string;
  authenticationMethod: AuthenticationMethod;
  flightControlToken: string;
  flightControlUsername: string;
  flightControlPassword: string;
  hostname: string;
  deviceAlias: string;
  customLabels: LabelKeyValue[];
  labelMappings: LabelMapping[];
};

export const defaultCockpitOnsiteSetupValues: CockpitOnsiteSetupValues = {
  selectedNetworkInterface: 'eth0',
  vlanId: '',
  ipv4Mode: 'dhcpv4',
  ipv4AutoDns: true,
  ipv4Address: '',
  ipv4SubnetMask: '',
  ipv4Gateway: '',
  ipv4PrimaryDns: '',
  ipv4SecondaryDns: '',
  ipv6Mode: 'dhcpv6',
  ipv6AutoDns: true,
  ipv6Address: '',
  ipv6Gateway: '',
  ipv6PrimaryDns: '',
  ipv6SecondaryDns: '',
  ntpServerHostname: 'pool.ntp.org',
  proxyProtocol: 'HTTP',
  proxyHostname: '',
  proxyPort: '',
  proxyUsername: '',
  proxyPassword: '',
  proxyNoProxy: 'localhost,127.0.0.1,::1',
  flightControlEnrollmentEnabled: true,
  enrollmentCredentialsSource: 'existing',
  serviceEndpoint: '',
  authenticationMethod: 'token',
  flightControlToken: '',
  flightControlUsername: '',
  flightControlPassword: '',
  hostname: '',
  deviceAlias: '',
  customLabels: [{ key: '', value: '' }],
  labelMappings: [{ key: '', systemInfoField: '' }],
};
