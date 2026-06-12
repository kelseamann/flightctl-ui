import * as React from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  // eslint-disable-next-line no-restricted-imports
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { isDevMockApi } from '../../utils/devMock';
import { COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER } from './cockpitOnsiteSetupConstants';
import type { EnrollmentOutcome } from './types';

const NAV_STEP_ORDER = COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER;

type CockpitOnsiteSetupWizardFooterProps = {
  isStepValid: (stepId: string) => boolean;
  enrollmentOutcome: EnrollmentOutcome;
  onStartEnrollment: () => void;
  onFinishEnrollment: () => void;
  onCancel: () => void;
};

const CockpitOnsiteSetupWizardFooter = ({
  isStepValid,
  enrollmentOutcome,
  onStartEnrollment,
  onFinishEnrollment,
  onCancel,
}: CockpitOnsiteSetupWizardFooterProps) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, goToStepById, activeStep } = useWizardContext();
  const stepId = String(activeStep.id);
  const stepIndex = NAV_STEP_ORDER.indexOf(stepId as (typeof NAV_STEP_ORDER)[number]);
  const isFirst = stepIndex === 0;
  const isLabels = stepId === 'labels';
  const isConfirmation = stepId === 'confirmation';
  const canAdvance = isDevMockApi() || isStepValid(stepId);

  if (isConfirmation && enrollmentOutcome === 'success') {
    return (
      <WizardFooterWrapper>
        <ActionList style={{ justifyContent: 'normal' }}>
          <ActionListGroup>
            <ActionListItem>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon />}
                iconPosition="end"
                onClick={onFinishEnrollment}
                data-testid="wizard-return-to-devices-button"
              >
                {t('Go to Devices pending approval')}
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      </WizardFooterWrapper>
    );
  }

  if (isConfirmation) {
    return null;
  }

  const primaryLabel = t('Next step');

  const onPrimary = () => {
    if (isLabels) {
      onStartEnrollment();
      goToStepById('confirmation');
      return;
    }
    goToNextStep();
  };

  const primaryDisabled = !canAdvance;

  return (
    <WizardFooterWrapper>
      <ActionList style={{ justifyContent: 'normal' }}>
        <ActionListGroup>
          <ActionListItem>
            <Button variant="secondary" onClick={goToPrevStep} isDisabled={isFirst}>
              {t('Back')}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button variant="primary" onClick={onPrimary} isDisabled={primaryDisabled} data-testid="wizard-next-button">
              {primaryLabel}
            </Button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default CockpitOnsiteSetupWizardFooter;
