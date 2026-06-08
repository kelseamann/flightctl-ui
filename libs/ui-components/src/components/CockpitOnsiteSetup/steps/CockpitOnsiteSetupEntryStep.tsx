import * as React from 'react';
import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
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
          {t("Let's begin onboarding your device")}
        </Title>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p} className="pf-v6-u-color-200">
          {t(
            'This wizard runs on the device through Cockpit system onboarding. Connect from a phone or laptop browser at the device Cockpit URL, then complete hostname, network, and enrollment before the device appears in Flight Control.',
          )}
        </Content>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupEntryStep;
