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
  isLabelsStepValid,
  isNetworkStepValid,
} from './cockpitOnsiteSetupValidation';
import CockpitOnsiteSetupConfirmationStep from './steps/CockpitOnsiteSetupConfirmationStep';
import CockpitOnsiteSetupEnrollmentStep from './steps/CockpitOnsiteSetupEnrollmentStep';
import CockpitOnsiteSetupLabelsStep from './steps/CockpitOnsiteSetupLabelsStep';
import CockpitOnsiteSetupNetworkStep from './steps/CockpitOnsiteSetupNetworkStep';
import { CockpitOnsiteSetupValues, EnrollmentFailureCode, EnrollmentOutcome } from './types';

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
  const [enrollmentFailureCode, setEnrollmentFailureCode] = React.useState<EnrollmentFailureCode | undefined>();

  const updateValues = (patch: Partial<CockpitOnsiteSetupValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'network':
        return isNetworkStepValid(values);
      case 'enrollment':
        return isEnrollmentStepValid(values);
      case 'labels':
        return isLabelsStepValid(values);
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
      if (isStepValid(id)) {
        ids.push(id);
      } else {
        break;
      }
    }
    return ids;
    // isStepValid is derived from values; listing it would recreate each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const stepProps = { values, onChange: updateValues };

  const handleStartEnrollment = React.useCallback(() => {
    setEnrollmentOutcome('running');
    setDeviceConnected(false);
    setEnrollmentFailureCode(undefined);
  }, []);

  const handleEnrollmentComplete = React.useCallback(
    (success: boolean, connected: boolean, failureCode?: EnrollmentFailureCode) => {
      setEnrollmentOutcome(success ? 'success' : 'failure');
      setDeviceConnected(connected);
      setEnrollmentFailureCode(failureCode);
    },
    [],
  );

  const finishEnrollment = React.useCallback(() => {
    void onEnrollmentSuccess(values);
  }, [onEnrollmentSuccess, values]);

  return (
    <Wizard
      title={t('First-boot device onboarding')}
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
      <WizardStep name={t('Network')} id="network">
        <CockpitOnsiteSetupNetworkStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Enrollment')}
        id="enrollment"
        isDisabled={isWizardStepDisabled('enrollment', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupEnrollmentStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Device labels')}
        id="labels"
        isDisabled={isWizardStepDisabled('labels', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupLabelsStep {...stepProps} />
      </WizardStep>

      <WizardStep
        name={t('Apply and enroll')}
        id="confirmation"
        isDisabled={isWizardStepDisabled('confirmation', NAV_STEP_ORDER, validStepIds)}
      >
        <CockpitOnsiteSetupConfirmationStep
          {...stepProps}
          enrollmentOutcome={enrollmentOutcome}
          deviceConnected={deviceConnected}
          enrollmentFailureCode={enrollmentFailureCode}
          onEnrollmentComplete={handleEnrollmentComplete}
        />
      </WizardStep>
    </Wizard>
  );
};

export default CockpitOnsiteSetupWizard;
