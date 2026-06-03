import * as React from 'react';
import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { isDevMockApi } from '../../utils/devMock';
import { isWizardStepDisabled } from '../../utils/wizards';
import CockpitOnsiteSetupCompletionView from './CockpitOnsiteSetupCompletionView';
import CockpitOnsiteSetupWizardFooter from './CockpitOnsiteSetupWizardFooter';
import { getCockpitOnsiteSetupInitialValues } from './cockpitOnsiteSetupInitialValues';
import {
  COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER,
  COCKPIT_ONSITE_SETUP_PROGRESS_STEP,
  COCKPIT_ONSITE_SETUP_STEP_ORDER,
} from './cockpitOnsiteSetupConstants';
import {
  isEnrollmentStepValid,
  isHostnameStepValid,
  isNetworkAddressStepValid,
  isNetworkInterfaceStepValid,
  isNetworkServicesStepValid,
  isProgressStepValid,
  isReviewStepValid,
  isWelcomeStepValid,
} from './cockpitOnsiteSetupValidation';
import CockpitOnsiteSetupAddressingStep from './steps/CockpitOnsiteSetupAddressingStep';
import CockpitOnsiteSetupEnrollmentStep from './steps/CockpitOnsiteSetupEnrollmentStep';
import CockpitOnsiteSetupHostnameStep from './steps/CockpitOnsiteSetupHostnameStep';
import CockpitOnsiteSetupInterfaceStep from './steps/CockpitOnsiteSetupInterfaceStep';
import CockpitOnsiteSetupProgressStep from './steps/CockpitOnsiteSetupProgressStep';
import CockpitOnsiteSetupReviewStep from './steps/CockpitOnsiteSetupReviewStep';
import CockpitOnsiteSetupServicesStep from './steps/CockpitOnsiteSetupServicesStep';
import CockpitOnsiteSetupWelcomeStep from './steps/CockpitOnsiteSetupWelcomeStep';
import { CockpitOnsiteSetupValues } from './types';

const FORM_STEP_ORDER = [...COCKPIT_ONSITE_SETUP_STEP_ORDER];
const NAV_STEP_ORDER = [...COCKPIT_ONSITE_SETUP_NAV_STEP_ORDER];

type CockpitOnsiteSetupWizardProps = {
  onComplete: () => void;
};

const CockpitOnsiteSetupWizard = ({ onComplete }: CockpitOnsiteSetupWizardProps) => {
  const { t } = useTranslation();
  const [values, setValues] = React.useState<CockpitOnsiteSetupValues>(() => getCockpitOnsiteSetupInitialValues());
  const [hasApplied, setHasApplied] = React.useState(false);
  const [progressComplete, setProgressComplete] = React.useState(false);
  const [showCompletion, setShowCompletion] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<WizardStepType | undefined>();

  const updateValues = (patch: Partial<CockpitOnsiteSetupValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'welcome':
        return isWelcomeStepValid(values);
      case 'hostname':
        return isHostnameStepValid(values);
      case 'interface':
        return isNetworkInterfaceStepValid(values);
      case 'addressing':
        return isNetworkAddressStepValid(values);
      case 'services':
        return isNetworkServicesStepValid(values);
      case 'enrollment':
        return isEnrollmentStepValid(values);
      case 'review':
        return isReviewStepValid(values);
      case COCKPIT_ONSITE_SETUP_PROGRESS_STEP:
        return isProgressStepValid(values);
      default:
        return true;
    }
  };

  const validStepIds = React.useMemo(() => {
    if (isDevMockApi()) {
      return [...NAV_STEP_ORDER];
    }
    const ids: string[] = [];
    for (const id of FORM_STEP_ORDER) {
      if (isStepValid(id)) {
        ids.push(id);
      } else {
        break;
      }
    }
    if (hasApplied && ids.includes('review')) {
      ids.push(COCKPIT_ONSITE_SETUP_PROGRESS_STEP);
    }
    return ids;
  }, [values, hasApplied]);

  const stepProps = { values, onChange: updateValues };

  const renderStep = (stepId: string, content: React.ReactNode) => {
    if (!currentStep || currentStep.id === stepId) {
      return content;
    }
    return null;
  };

  const handleProgressComplete = React.useCallback(() => {
    setProgressComplete(true);
  }, []);

  if (showCompletion) {
    return <CockpitOnsiteSetupCompletionView values={values} onDismiss={onComplete} />;
  }

  return (
    <Wizard
      title={t('System onboarding')}
      onClose={onComplete}
      onStepChange={(_event, step) => setCurrentStep(step)}
      footer={
        <CockpitOnsiteSetupWizardFooter
          values={values}
          isStepValid={isStepValid}
          progressComplete={progressComplete}
          onApply={() => setHasApplied(true)}
          onFinish={() => setShowCompletion(true)}
          onCancel={onComplete}
        />
      }
    >
      <WizardStep name={t('Welcome')} id="welcome">
        {renderStep('welcome', <CockpitOnsiteSetupWelcomeStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Name this device')}
        id="hostname"
        isDisabled={isWizardStepDisabled('hostname', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('hostname', <CockpitOnsiteSetupHostnameStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Network interface')}
        id="interface"
        isDisabled={isWizardStepDisabled('interface', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('interface', <CockpitOnsiteSetupInterfaceStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Network addressing')}
        id="addressing"
        isDisabled={isWizardStepDisabled('addressing', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('addressing', <CockpitOnsiteSetupAddressingStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Network services')}
        id="services"
        isDisabled={isWizardStepDisabled('services', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('services', <CockpitOnsiteSetupServicesStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Enrollment')}
        id="enrollment"
        isDisabled={isWizardStepDisabled('enrollment', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('enrollment', <CockpitOnsiteSetupEnrollmentStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Review')}
        id="review"
        isDisabled={isWizardStepDisabled('review', NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep('review', <CockpitOnsiteSetupReviewStep {...stepProps} />)}
      </WizardStep>

      <WizardStep
        name={t('Apply')}
        id={COCKPIT_ONSITE_SETUP_PROGRESS_STEP}
        isDisabled={isWizardStepDisabled(COCKPIT_ONSITE_SETUP_PROGRESS_STEP, NAV_STEP_ORDER, validStepIds)}
      >
        {renderStep(
          COCKPIT_ONSITE_SETUP_PROGRESS_STEP,
          <CockpitOnsiteSetupProgressStep {...stepProps} onComplete={handleProgressComplete} />,
        )}
      </WizardStep>
    </Wizard>
  );
};

export default CockpitOnsiteSetupWizard;
