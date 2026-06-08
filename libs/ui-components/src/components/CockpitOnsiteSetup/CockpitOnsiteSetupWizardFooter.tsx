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

import { useTranslation } from '../../hooks/useTranslation';
import { isDevMockApi } from '../../utils/devMock';
import { COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER } from './cockpitOnsiteSetupConstants';

const STEP_ORDER = COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER;

type CockpitOnsiteSetupWizardFooterProps = {
  isStepValid: (stepId: string) => boolean;
  onStartEnrollment: () => void;
  onCancel: () => void;
};

const CockpitOnsiteSetupWizardFooter = ({
  isStepValid,
  onStartEnrollment,
  onCancel,
}: CockpitOnsiteSetupWizardFooterProps) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, goToStepById, activeStep } = useWizardContext();
  const stepId = String(activeStep.id);
  const stepIndex = STEP_ORDER.indexOf(stepId as (typeof STEP_ORDER)[number]);
  const isFirst = stepIndex === 0;
  const isReview = stepId === 'review';
  const isConfirmation = stepId === 'confirmation';
  const canAdvance = isDevMockApi() || isStepValid(stepId);

  if (isConfirmation) {
    return null;
  }

  const primaryLabel = isReview ? t('Start Enrollment') : t('Next step');

  const onPrimary = () => {
    if (isReview) {
      onStartEnrollment();
      goToStepById('confirmation');
      return;
    }
    goToNextStep();
  };

  const primaryDisabled = !isReview && !canAdvance;

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
