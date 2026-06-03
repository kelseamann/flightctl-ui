import * as React from 'react';
import { Button, Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { useUxBranch } from '../../hooks/useUxBranch';
import { MOCK_DEVICE_COCKPIT_URL } from './cockpitOnsiteSetupConstants';
import { CockpitOnsiteSetupValues } from './types';

type CockpitOnsiteSetupCompletionViewProps = {
  values: CockpitOnsiteSetupValues;
  onDismiss: () => void;
};

const CockpitOnsiteSetupCompletionView = ({ values, onDismiss }: CockpitOnsiteSetupCompletionViewProps) => {
  const { t } = useTranslation();
  const { branch } = useUxBranch();
  const cockpitUrl = values.deviceCockpitUrl || MOCK_DEVICE_COCKPIT_URL;
  const branchQuery = `branch=${branch}`;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Onboarding complete on device')}
        </Title>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p}>
          {t(
            'Configuration was applied on the device. Temporary Cockpit onboarding access is removed. Track the device in RHEM when the enrollment request appears.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('On the device')}
        </Title>
        <Content component={ContentVariants.p} className="pf-v6-u-color-200">
          {t(
            'If apply or enrollment is still running, return to the device Cockpit tab you opened earlier. Do not close it until the device Cockpit wizard shows success.',
          )}
        </Content>
        <Button
          component="a"
          variant="secondary"
          href={cockpitUrl}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
          className="pf-v6-u-mt-sm"
        >
          {t('Return to device Cockpit')}
        </Button>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('In RHEM')}
        </Title>
        <Content component={ContentVariants.p} className="pf-v6-u-color-200">
          {t('After the device connects, review the enrollment request and approve the device.')}
        </Content>
        <Stack hasGutter className="pf-v6-u-mt-sm">
          <StackItem>
            <Link to={ROUTE.ENROLLMENT_REQUESTS} query={branchQuery}>
              {t('View enrollment requests in RHEM')}
            </Link>
          </StackItem>
          <StackItem>
            <Link to={ROUTE.DEVICES} query={branchQuery}>
              {t('View devices in RHEM')}
            </Link>
          </StackItem>
        </Stack>
      </StackItem>
      <StackItem>
        <Button variant="link" onClick={onDismiss}>
          {t('Close')}
        </Button>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupCompletionView;
