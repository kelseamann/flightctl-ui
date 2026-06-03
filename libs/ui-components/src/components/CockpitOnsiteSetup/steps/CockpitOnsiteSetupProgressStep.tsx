import * as React from 'react';
import {
  List,
  ListComponent,
  ListItem,
  Progress,
  ProgressSize,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { isDevMockApi } from '../../../utils/devMock';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

export type ProgressStepStatus = 'pending' | 'running' | 'success';

export type ProgressStepState = {
  id: string;
  label: string;
  status: ProgressStepStatus;
};

type CockpitOnsiteSetupProgressStepProps = CockpitOnsiteSetupStepProps & {
  onComplete: () => void;
};

const buildInitialSteps = (
  values: CockpitOnsiteSetupStepProps['values'],
  t: ReturnType<typeof useTranslation>['t'],
): ProgressStepState[] => {
  const steps: ProgressStepState[] = [
    { id: 'apply-config', label: t('Applying configuration changes'), status: 'pending' },
    { id: 'test-connectivity', label: t('Testing network connectivity'), status: 'pending' },
  ];
  if (values.flightControlEnabled) {
    steps.push({ id: 'enroll-flightctl', label: t('Enrolling into Flight Control'), status: 'pending' });
  }
  if (values.insightsEnabled) {
    steps.push({ id: 'enroll-insights', label: t('Enrolling into Red Hat Insights'), status: 'pending' });
  }
  steps.push({
    id: 'finalize',
    label:
      values.flightControlEnabled || values.insightsEnabled
        ? t('Finalizing enrollment')
        : t('Finalizing configuration'),
    status: 'pending',
  });
  return steps;
};

const CockpitOnsiteSetupProgressStep = ({ values, onComplete }: CockpitOnsiteSetupProgressStepProps) => {
  const { t } = useTranslation();
  const stepPlanRef = React.useRef(buildInitialSteps(values, t));
  const [steps, setSteps] = React.useState<ProgressStepState[]>(stepPlanRef.current);
  const stepDelayMs = isDevMockApi() ? 400 : 900;

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const plan = stepPlanRef.current;
      for (let index = 0; index < plan.length; index += 1) {
        if (cancelled) {
          return;
        }
        const stepId = plan[index].id;
        setSteps((current) =>
          current.map((step) => (step.id === stepId ? { ...step, status: 'running' } : step)),
        );
        await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
        if (cancelled) {
          return;
        }
        setSteps((current) =>
          current.map((step) => (step.id === stepId ? { ...step, status: 'success' } : step)),
        );
      }
      onComplete();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [onComplete, stepDelayMs]);

  const completedCount = steps.filter((step) => step.status === 'success').length;
  const progressValue = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Applying configuration')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'This runs on the device in Cockpit. Keep your device Cockpit session open until this completes — the setup access point may disconnect after apply.',
          )}
        </p>
      </StackItem>
      <StackItem>
        <Progress value={progressValue} title={t('Overall progress')} size={ProgressSize.sm} />
      </StackItem>
      <StackItem>
        <List component={ListComponent.ul}>
          {steps.map((step) => (
            <ListItem key={step.id}>
              <span className="pf-v6-l-flex pf-v6-u-gap-sm pf-v6-u-align-items-center">
                {step.status === 'success' && (
                  <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                )}
                {step.status === 'running' && <InProgressIcon />}
                {step.status === 'pending' && <span style={{ width: '1rem' }} />}
                {step.label}
                {step.status === 'running' && (
                  <span className="pf-v6-u-color-200 pf-v6-u-font-size-sm">{t('Running…')}</span>
                )}
              </span>
            </ListItem>
          ))}
        </List>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupProgressStep;
