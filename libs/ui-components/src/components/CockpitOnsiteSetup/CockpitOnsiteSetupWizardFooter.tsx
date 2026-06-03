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
import {
  COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER,
  COCKPIT_ONSITE_SETUP_PROGRESS_STEP,
} from './cockpitOnsiteSetupConstants';
import { CockpitOnsiteSetupValues } from './types';

const STEP_ORDER = COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER;

type CockpitOnsiteSetupWizardFooterProps = {
  values: CockpitOnsiteSetupValues;
  isStepValid: (stepId: string) => boolean;
  progressComplete: boolean;
  onApply: () => void;
  onFinish: () => void;
  onCancel: () => void;
};

const CockpitOnsiteSetupWizardFooter = ({
  values,
  isStepValid,
  progressComplete,
  onApply,
  onFinish,
  onCancel,
}: CockpitOnsiteSetupWizardFooterProps) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, goToStepById, activeStep } = useWizardContext();
  const stepId = String(activeStep.id);
  const stepIndex = STEP_ORDER.indexOf(stepId as (typeof STEP_ORDER)[number]);
  const isFirst = stepIndex === 0;
  const isReview = stepId === 'review';
  const isProgress = stepId === COCKPIT_ONSITE_SETUP_PROGRESS_STEP;
  const canAdvance = isDevMockApi() || isStepValid(stepId);

  const primaryLabel = isProgress
    ? t('Finish')
    : isReview
      ? values.flightControlEnabled || values.insightsEnabled
        ? t('Apply and enroll')
        : t('Apply')
      : t('Next');

  const onPrimary = () => {
    if (isProgress) {
      onFinish();
      return;
    }
    if (isReview) {
      onApply();
      goToStepById(COCKPIT_ONSITE_SETUP_PROGRESS_STEP);
      return;
    }
    goToNextStep();
  };

  const primaryDisabled = isProgress
    ? !isDevMockApi() && !progressComplete
    : !isReview && !canAdvance;

  return (
    <WizardFooterWrapper>
      <ActionList style={{ justifyContent: 'normal' }}>
        <ActionListGroup>
          <ActionListItem>
            <Button variant="secondary" onClick={goToPrevStep} isDisabled={isFirst || isProgress}>
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
            <Button variant="link" onClick={onCancel} isDisabled={isProgress && !progressComplete && !isDevMockApi()}>
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default CockpitOnsiteSetupWizardFooter;
