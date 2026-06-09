import * as React from 'react';
import {
  Alert,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  MOCK_DEVICE_COCKPIT_URL,
  MOCK_SETUP_ETHERNET_CIDR,
  MOCK_SETUP_WIFI_SSID,
} from '../cockpitOnsiteSetupConstants';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupEntryStep = ({ values }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {values.serviceName}
        </Title>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t("Let's begin first-boot device onboarding")}
        </Title>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p} className="pf-v6-u-color-200">
          {t(
            'This wizard runs on the device through Cockpit. It applies hostname, labels, network, proxy, NTP, and Flight Control enrollment credentials before the agent submits an enrollment request.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Alert variant="info" isInline title={t('Connect to the device setup network first')}>
          {t(
            'Use the temporary setup network to open Cockpit from a phone or laptop browser. Onboarding may use HTTP on port 9090 until production network settings are applied.',
          )}
        </Alert>
      </StackItem>
      <StackItem>
        <Title headingLevel="h3" size="md">
          {t('Setup network access')}
        </Title>
        <DescriptionList isCompact className="pf-v6-u-mt-sm">
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Wi-Fi access point')}</DescriptionListTerm>
            <DescriptionListDescription>
              <span className="pf-v6-u-font-family-monospace">{MOCK_SETUP_WIFI_SSID}</span>
              <Content component={ContentVariants.small} className="pf-v6-u-color-200 pf-v6-u-mt-xs">
                {t(
                  'Connect to the flightctl-<suffix> SSID. The captive portal shows the device serial and MAC, then redirects to Cockpit.',
                )}
              </Content>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Wired setup interface')}</DescriptionListTerm>
            <DescriptionListDescription>
              <span className="pf-v6-u-font-family-monospace">{MOCK_SETUP_ETHERNET_CIDR}</span>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Cockpit URL')}</DescriptionListTerm>
            <DescriptionListDescription>
              <span className="pf-v6-u-font-family-monospace">{MOCK_DEVICE_COCKPIT_URL}</span>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p} className="pf-v6-u-color-200">
          {t(
            'If the browser connection drops during apply (single-NIC setups), reconnect to the setup network and reopen Cockpit — the wizard resumes where you left off.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Alert variant="warning" isInline title={t('Wi-Fi access point vs client mode')}>
          {t(
            'The setup Wi-Fi access point provides browser access to Cockpit. Production network configuration may use Ethernet or join a different Wi-Fi network as a client — SSID scanning is not available while the radio is in AP mode.',
          )}
        </Alert>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupEntryStep;
