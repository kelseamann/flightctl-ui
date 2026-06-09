import * as React from 'react';
import { Wizard, WizardStep } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { isDevMockApi } from '../../utils/devMock';
import { isWizardStepDisabled } from '../../utils/wizards';
import CockpitOnsiteSetupWizardFooter from './CockpitOnsiteSetupWizardFooter';
import { getCockpitOnsiteSetupInitialValues } from './cockpitOnsiteSetupInitialValues';
import { COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER } from './cockpitOnsiteSetupConstants';
import {
  isConfirmationStepValid,
  isEnrollmentStepValid,
  isEntryStepValid,
  isGeneralStepValid,
  isNetworkStepValid,
  isReviewStepValid,
} from './cockpitOnsiteSetupValidation';
import CockpitOnsiteSetupConfirmationStep from './steps/CockpitOnsiteSetupConfirmationStep';
import CockpitOnsiteSetupEnrollmentStep from './steps/CockpitOnsiteSetupEnrollmentStep';
import CockpitOnsiteSetupEntryStep from './steps/CockpitOnsiteSetupEntryStep';
import CockpitOnsiteSetupGeneralStep from './steps/CockpitOnsiteSetupGeneralStep';
import CockpitOnsiteSetupNetworkStep from './steps/CockpitOnsiteSetupNetworkStep';
import CockpitOnsiteSetupReviewStep from './steps/CockpitOnsiteSetupReviewStep';
import { CockpitOnsiteSetupValues, EnrollmentOutcome } from './types';

const NAV_STEP_ORDER = [...COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER];

type CockpitOnsiteSetupWizardProps = {
  onCancel: () => void;
  onEnrollmentSuccess: (values: CockpitOnsiteSetupValues) => void | Promise<void>;
};

const CockpitOnsiteSetupWizard = ({ onCancel, onEnrollmentSuccess }: CockpitOnsiteSetupWizardProps) => {
  const { t } = useTranslation();
  const [values, setValues] = React.useState<CockpitOnsiteSetupValues>(() => getCockpitOnsiteSetupInitialValues());
  const [enrollmentOutcome, setEnrollmentOutcome] = React.useState<EnrollmentOutcome>('idle');
  const [deviceConnected, setDeviceConnected] = React.useState(false);
  const [hasStartedEnrollment, setHasStartedEnrollment] = React.useState(false);

  const updateValues = (patch: Partial<CockpitOnsiteSetupValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'entry':
        return isEntryStepValid(values);
      case 'general':
        return isGeneralStepValid(values);
      case 'network':
        return isNetworkStepValid(values);
      case 'enrollment':
        return isEnrollmentStepValid(values);
      case 'review':
        return isReviewStepValid(values);
      case 'confirmation':
        return isConfirmationStepValid(values);
      default:
        return true;
    }
  };

  const validStepIds = React.useMemo(() => {
    if (isDevMockApi()) {
      return [...NAV_STEP_ORDER];
    }
    const ids: string[] = [];
    for (const id of NAV_STEP_ORDER) {
      if (id === 'confirmation') {
        if (hasStartedEnrollment) {
          ids.push(id);
        }
        break;
      }
      if (isStepValid(id)) {
        ids.push(id);
      } else {
        break;
      }
    }
    return ids;
  }, [values, hasStartedEnrollment]);

  const stepProps = { values, onChange: updateValues };

  const handleStartEnrollment = React.useCallback(() => {
    setHasStartedEnrollment(true);
    setEnrollmentOutcome('running');
    setDeviceConnected(false);
  }, []);

  const handleEnrollmentComplete = React.useCallback((success: boolean, connected: boolean) => {
    setEnrollmentOutcome(success ? 'success' : 'failure');
    setDeviceConnected(connected);
  }, []);

  const finishEnrollment = React.useCallback(() => {
    void onEnrollmentSuccess(values);
  }, [onEnrollmentSuccess, values]);

  return (
    <Wizard
      title={t('System onboarding')}
      onClose={onCancel}
      footer={
        <CockpitOnsiteSetupWizardFooter
          isStepValid={isStepValid}
          enrollmentOutcome={enrollmentOutcome}
          onStartEnrollment={handleStartEnrollment}
          onFinishEnrollment={finishEnrollment}
          onCancel={onCancel}
        />
      }
    >
      <WizardStep name={t('Onboarding')} id="entry">
        <CockpitOnsiteSetupEntryStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('General information')}
        id="general"
        isDisabled={isWizardStepDisabled('general', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupGeneralStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Network configurations')}
        id="network"
        isDisabled={isWizardStepDisabled('network', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupNetworkStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Service enrollment')}
        id="enrollment"
        isDisabled={isWizardStepDisabled('enrollment', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupEnrollmentStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Review and enroll')}
        id="review"
        isDisabled={isWizardStepDisabled('review', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupReviewStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Confirmation')}
        id="confirmation"
        isDisabled={isWizardStepDisabled('confirmation', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupConfirmationStep
          {...stepProps}
          enrollmentOutcome={enrollmentOutcome}
          deviceConnected={deviceConnected}
          onEnrollmentComplete={handleEnrollmentComplete}
        />
      </WizardStep>
    </Wizard>
  );
};

export default CockpitOnsiteSetupWizard;
