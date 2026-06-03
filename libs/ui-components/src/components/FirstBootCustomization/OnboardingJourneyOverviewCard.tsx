import * as React from 'react';
import {
  Button,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  List,
  ListComponent,
  ListItem,
  OrderType,
} from '@patternfly/react-core';
import { EnrollmentRequest } from '@flightctl/types';

import DetailsPageCard from '../DetailsPage/DetailsPageCard';
import FirstBootCustomizationStatus from '../Status/FirstBootCustomizationStatus';
import ProvisioningSourceLabel from './ProvisioningSourceLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import {
  FirstBootCustomizationStatus as FirstBootCustomizationStatusType,
  getEnrollmentFirstBootCustomizationStatus,
} from '../../utils/firstBootCustomization';
import {
  getActiveJourneyStepIndex,
  getJourneyStepHelperText,
  getOnboardingJourneySteps,
  RHEM_REPORTING_START_STEP,
} from '../../utils/onboardingJourney';

type OnboardingJourneyOverviewCardProps = {
  enrollmentRequest: EnrollmentRequest;
};

const OnboardingJourneyOverviewCard = ({ enrollmentRequest }: OnboardingJourneyOverviewCardProps) => {
  const { t } = useTranslation();
  const customizationStatus = getEnrollmentFirstBootCustomizationStatus(enrollmentRequest);
  const steps = getOnboardingJourneySteps(t);
  const activeStepIndex = getActiveJourneyStepIndex(enrollmentRequest);
  const helperText = getJourneyStepHelperText(t, activeStepIndex, activeStepIndex);

  const offConsoleSteps = steps.filter((step) => step.phase === 'off-console');
  const rhemSteps = steps.filter((step) => step.phase === 'in-rhem');

  const renderStepList = (stepSlice: typeof steps, indexOffset: number) => (
    <List component={ListComponent.ol} type={OrderType.number} className="pf-v6-u-mb-md">
      {stepSlice.map((step, index) => {
        const stepNumber = indexOffset + index + 1;
        const isActive = stepNumber === activeStepIndex;
        return (
          <ListItem key={step.id} className={isActive ? 'pf-v6-u-font-weight-bold' : undefined}>
            {step.label}
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <DetailsPageCard>
      <CardTitle>{t('Device onboarding journey')}</CardTitle>
      <CardBody>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
          {t(
            'Steps 1–4 are completed in the Cockpit system onboarding wizard on the device. RHEM reports state after the agent submits an enrollment request.',
          )}
        </Content>
        <div className="pf-v6-u-mb-md">
          <Content component={ContentVariants.small} className="pf-v6-u-color-200 pf-v6-u-mb-xs">
            {t('Provisioning method')}
          </Content>
          <ProvisioningSourceLabel />
        </div>
        <Button
          variant="secondary"
          component={(props) => <Link to={ROUTE.ONSITE_SETUP} {...props} />}
          className="pf-v6-u-mb-lg"
        >
          {t('Open onsite setup wizard')}
        </Button>
        <Content component={ContentVariants.h4}>{t('Before the device appears in RHEM')}</Content>
        {renderStepList(offConsoleSteps, 0)}
        <Divider className="pf-v6-u-my-md" />
        <Content component={ContentVariants.h4}>{t('In RHEM (reporter)')}</Content>
        {renderStepList(rhemSteps, RHEM_REPORTING_START_STEP - 1)}
        <div className="pf-v6-u-mt-md">
          <Content component={ContentVariants.small} className="pf-v6-u-color-200 pf-v6-u-mb-xs">
            {t('Onsite customization')}
          </Content>
          <FirstBootCustomizationStatus enrollmentRequest={enrollmentRequest} />
        </div>
        {helperText && <p className="pf-v6-u-mt-sm pf-v6-u-color-200">{helperText}</p>}
        {customizationStatus === FirstBootCustomizationStatusType.Awaiting && activeStepIndex === 6 && (
          <p className="pf-v6-u-mt-sm pf-v6-u-color-200">
            {t(
              'Waiting for the integrator to finish Cockpit system onboarding on the device. This step can be skipped when DHCP and automated enrollment are sufficient.',
            )}
          </p>
        )}
      </CardBody>
    </DetailsPageCard>
  );
};

export default OnboardingJourneyOverviewCard;
