export type NetworkConnectionType = 'ethernet' | 'wifi' | 'other';

export type EnrollmentCredentialMode = 'token' | 'username_password';

export type EnrollmentOutcome = 'idle' | 'running' | 'success' | 'failure';

export type CockpitOnsiteSetupValues = {
  serviceName: string;
  hostname: string;
  labels: string;
  description: string;
  networkConnectionType: NetworkConnectionType;
  ipv4Address: string;
  dnsServers: string;
  ipv4Gateway: string;
  ntpServer: string;
  httpProxies: string[];
  flightControlEnabled: boolean;
  flightControlEndpoint: string;
  enrollmentCredentialMode: EnrollmentCredentialMode;
  flightControlToken: string;
  flightControlUsername: string;
  flightControlPassword: string;
};

export const defaultCockpitOnsiteSetupValues: CockpitOnsiteSetupValues = {
  serviceName: 'Device Onboarding',
  hostname: 'localhost',
  labels: '',
  description: '',
  networkConnectionType: 'ethernet',
  ipv4Address: '192.168.1.50',
  dnsServers: '192.168.1.1',
  ipv4Gateway: '192.168.1.1',
  ntpServer: '',
  httpProxies: [''],
  flightControlEnabled: true,
  flightControlEndpoint: '',
  enrollmentCredentialMode: 'token',
  flightControlToken: '',
  flightControlUsername: '',
  flightControlPassword: '',
};
