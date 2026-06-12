import * as React from 'react';
import { Bullseye, Button, Spinner, Stack, StackItem, Title, useWizardContext } from '@patternfly/react-core';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { isDevMockApi } from '../../../utils/devMock';
import CockpitOnsiteSetupEnrollmentComplete from '../CockpitOnsiteSetupEnrollmentComplete';
import type { EnrollmentFailureCode } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

type CockpitOnsiteSetupConfirmationStepProps = CockpitOnsiteSetupStepProps & {
  enrollmentOutcome: import('../types').EnrollmentOutcome;
  deviceConnected: boolean;
  enrollmentFailureCode?: EnrollmentFailureCode;
  onEnrollmentComplete: (success: boolean, connected: boolean, failureCode?: EnrollmentFailureCode) => void;
};

const CockpitOnsiteSetupConfirmationStep = ({
  enrollmentOutcome,
  deviceConnected,
  onEnrollmentComplete,
}: CockpitOnsiteSetupConfirmationStepProps) => {
  const { t } = useTranslation();
  const { goToStepById } = useWizardContext();

  React.useEffect(() => {
    if (enrollmentOutcome !== 'running') {
      return;
    }
    const slowCapture =
      typeof window !== 'undefined' &&
      Boolean((window as Window & { __FIGMA_CAPTURE_SLOW_ENROLLMENT?: boolean }).__FIGMA_CAPTURE_SLOW_ENROLLMENT);
    const delay = isDevMockApi() ? (slowCapture ? 10000 : 800) : 1500;
    const timer = window.setTimeout(() => {
      onEnrollmentComplete(true, true);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [enrollmentOutcome, onEnrollmentComplete]);

  if (enrollmentOutcome === 'idle' || enrollmentOutcome === 'running') {
    return (
      <Bullseye>
        <Stack hasGutter>
          <StackItem className="pf-v6-u-text-align-center">
            <Spinner size="xl" />
          </StackItem>
          <StackItem className="pf-v6-u-text-align-center">
            <Title headingLevel="h1" size="2xl">
              {t('Applying configuration…')}
            </Title>
          </StackItem>
        </Stack>
      </Bullseye>
    );
  }

  const success = enrollmentOutcome === 'success';

  if (success) {
    return <CockpitOnsiteSetupEnrollmentComplete />;
  }

  return (
    <Stack hasGutter>
      <StackItem className="pf-v6-u-text-align-center">
        <TimesCircleIcon
          style={{ width: '3rem', height: '3rem', color: 'var(--pf-t--global--icon--color--status--danger--default)' }}
        />
      </StackItem>
      <StackItem className="pf-v6-u-text-align-center">
        <Title headingLevel="h1" size="2xl">
          {t('Enrollment failed')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {deviceConnected
            ? t('Device is connected and reachable.')
            : t('Device is not connected — check network settings on the device.')}
        </p>
        <Button variant="link" onClick={() => goToStepById('labels')} className="pf-v6-u-mt-md">
          {t('Back to device labels')}
        </Button>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupConfirmationStep;
