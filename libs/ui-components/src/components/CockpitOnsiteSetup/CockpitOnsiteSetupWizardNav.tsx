import * as React from 'react';
import { WizardNav, WizardNavItem, useWizardContext } from '@patternfly/react-core';

const CockpitOnsiteSetupWizardNav = () => {
  const { activeStep, steps, goToStepByIndex } = useWizardContext();

  return (
    <WizardNav>
      {steps.map((step) => (
        <WizardNavItem
          key={step.id}
          id={step.id}
          stepIndex={step.index}
          content={step.name}
          isCurrent={activeStep?.id === step.id}
          isDisabled={step.isDisabled}
          onClick={() => goToStepByIndex(step.index)}
        />
      ))}
    </WizardNav>
  );
};

export default CockpitOnsiteSetupWizardNav;
