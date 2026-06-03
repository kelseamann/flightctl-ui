import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { MOCK_DEVICE_COCKPIT_URL } from '../cockpitOnsiteSetupConstants';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupWelcomeStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const cockpitUrl = values.deviceCockpitUrl || MOCK_DEVICE_COCKPIT_URL;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Device setup')}
        </Title>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p}>
          {t(
            'Steps 1–4 run on the device in Cockpit system onboarding. RHEM reports enrollment status starting at step 5 of the full journey.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-sm">
          {t('Before you start')}
        </Title>
        <Content component={ContentVariants.ol}>
          <Content component={ContentVariants.li}>
            {t('Power on the device and wait for the setup Wi‑Fi network (if enabled) or connect via Ethernet.')}
          </Content>
          <Content component={ContentVariants.li}>
            {t('Open Cockpit on the device in your browser and sign in as the temporary onboarding user.')}
          </Content>
          <Content component={ContentVariants.li}>
            {t('Complete this wizard on the device — keep that Cockpit session open while configuration applies.')}
          </Content>
        </Content>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Device Cockpit URL')} fieldId="onsite-cockpit-url">
          <TextInput
            id="onsite-cockpit-url"
            value={cockpitUrl}
            onChange={(_e, v) => onChange({ deviceCockpitUrl: v })}
            placeholder={MOCK_DEVICE_COCKPIT_URL}
          />
        </FormGroup>
        <Button
          component="a"
          variant="link"
          isInline
          href={cockpitUrl}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
          className="pf-v6-u-mt-sm"
        >
          {t('Open device Cockpit in a new tab')}
        </Button>
      </StackItem>
      <StackItem>
        <FormGroup label={t('How did you reach this wizard?')} fieldId="onsite-connection-path">
          <Radio
            id="onsite-via-ap"
            name="connection-path"
            label={t('Joined the device setup Wi‑Fi (access point mode)')}
            description={t('Wi‑Fi client scan may be unavailable until the access point is torn down after apply.')}
            isChecked={values.connectedViaDeviceAp}
            onChange={() => onChange({ connectedViaDeviceAp: true, wifiSelectedBssid: '', wifiSsid: '' })}
            className="pf-v6-u-mb-md"
          />
          <Radio
            id="onsite-via-ethernet"
            name="connection-path"
            label={t('Connected via Ethernet or management network')}
            description={t('Cockpit can scan for Wi‑Fi networks when configuring a wireless interface.')}
            isChecked={!values.connectedViaDeviceAp}
            onChange={() => onChange({ connectedViaDeviceAp: false })}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupWelcomeStep;
