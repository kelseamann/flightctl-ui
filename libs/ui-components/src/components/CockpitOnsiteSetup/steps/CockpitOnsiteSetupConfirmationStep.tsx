import * as React from 'react';
import { Bullseye, Button, Spinner, Stack, StackItem, Title, useWizardContext } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { isDevMockApi } from '../../../utils/devMock';
import type { EnrollmentOutcome } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

type CockpitOnsiteSetupConfirmationStepProps = CockpitOnsiteSetupStepProps & {
  enrollmentOutcome: EnrollmentOutcome;
  deviceConnected: boolean;
  onEnrollmentComplete: (success: boolean, connected: boolean) => void;
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
    const delay = isDevMockApi() ? 800 : 1500;
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
              {t('Enrolling device…')}
            </Title>
            <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
              {t('Cockpit is applying network settings and running enrollment scripts on the device.')}
            </p>
          </StackItem>
        </Stack>
      </Bullseye>
    );
  }

  const success = enrollmentOutcome === 'success';

  return (
    <Stack hasGutter>
      <StackItem className="pf-v6-u-text-align-center">
        {success ? (
          <CheckCircleIcon
            style={{ width: '3rem', height: '3rem', color: 'var(--pf-t--global--icon--color--status--success--default)' }}
          />
        ) : (
          <TimesCircleIcon
            style={{ width: '3rem', height: '3rem', color: 'var(--pf-t--global--icon--color--status--danger--default)' }}
          />
        )}
      </StackItem>
      <StackItem className="pf-v6-u-text-align-center">
        <Title headingLevel="h1" size="2xl">
          {success ? t('Enrollment succeeded') : t('Enrollment failed')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {deviceConnected
            ? t('Device is connected and reachable.')
            : t('Device is not connected — check network settings on the device.')}
        </p>
        {!success && (
          <>
            <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
              {t('Return to the device Cockpit session to review enrollment script output and retry.')}
            </p>
            <Button variant="link" onClick={() => goToStepById('review')} className="pf-v6-u-mt-md">
              {t('Back to review')}
            </Button>
          </>
        )}
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupConfirmationStep;
