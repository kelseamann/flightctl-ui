import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { MOCK_FLIGHT_CONTROL_CONSOLE_URL } from './cockpitOnsiteSetupConstants';

type CockpitOnsiteSetupCompleteSplashProps = {
  flightControlUrl: string;
  onDismiss: () => void;
};

const CockpitOnsiteSetupCompleteSplash = ({
  flightControlUrl,
  onDismiss,
}: CockpitOnsiteSetupCompleteSplashProps) => {
  const { t } = useTranslation();
  const consoleUrl = flightControlUrl || MOCK_FLIGHT_CONTROL_CONSOLE_URL;

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateBody>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              {t('Device configuration complete')}
            </Title>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.p} className="pf-v6-u-color-200">
              {t(
                'Cockpit is finishing setup on this device. Return to Flight Control and locate your device on the Devices pending approval page once it boots and connects.',
              )}
            </Content>
          </StackItem>
          <StackItem>
            <Button
              component="a"
              variant="primary"
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
            >
              {t('Open Flight Control')}
            </Button>
          </StackItem>
          <StackItem>
            <Button variant="link" onClick={onDismiss}>
              {t('Close this wizard')}
            </Button>
          </StackItem>
        </Stack>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default CockpitOnsiteSetupCompleteSplash;
