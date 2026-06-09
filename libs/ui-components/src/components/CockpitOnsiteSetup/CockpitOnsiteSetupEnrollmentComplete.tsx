import * as React from 'react';
import {
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

const CockpitOnsiteSetupEnrollmentComplete = () => {
  const { t } = useTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <Title headingLevel="h1" size="2xl">
        {t('Onboarding complete')}
      </Title>
      <EmptyStateBody>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.p} className="pf-v6-u-color-200">
              {t(
                'Configuration was applied and Flight Control enrollment credentials were provisioned on this device. The flightctl-agent service will submit an enrollment request to Flight Control.',
              )}
            </Content>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.p} className="pf-v6-u-color-200">
              {t(
                'A Flight Control operator must approve the device under Devices pending approval before it appears as an enrolled device. Use the button below to open Flight Control and find your device.',
              )}
            </Content>
          </StackItem>
        </Stack>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default CockpitOnsiteSetupEnrollmentComplete;
