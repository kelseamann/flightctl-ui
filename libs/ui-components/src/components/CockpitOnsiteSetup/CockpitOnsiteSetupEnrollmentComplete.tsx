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
        {t('Enrollment complete')}
      </Title>
      <EmptyStateBody>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.p} className="pf-v6-u-color-200">
              {t(
                'Your device is enrolling and will appear on the Devices pending approval screen. Use the button below to return to Edge Manager and find your device.',
              )}
            </Content>
          </StackItem>
        </Stack>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default CockpitOnsiteSetupEnrollmentComplete;
