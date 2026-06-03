import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import {
  getEnrollmentSummary,
  getIpv4Summary,
  getIpv6Summary,
  getNetworkInterfaceSummary,
  getServicesSummary,
  maskSecret,
} from '../cockpitOnsiteSetupSummary';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

type ReviewSectionProps = {
  title: string;
  stepId: string;
  children: React.ReactNode;
};

const ReviewSection = ({ title, stepId, children }: ReviewSectionProps) => {
  const { t } = useTranslation();
  const { goToStepById } = useWizardContext();

  return (
    <Card isPlain className="pf-v6-u-mb-md">
      <CardTitle>
        <Stack hasGutter>
          <StackItem>
            <div className="pf-v6-l-flex pf-v6-u-justify-content-space-between pf-v6-u-align-items-center">
              <span>{title}</span>
              <Button
                variant="link"
                isInline
                icon={<PencilAltIcon />}
                onClick={() => goToStepById(stepId)}
                aria-label={t('Edit {{section}}', { section: title })}
              >
                {t('Edit')}
              </Button>
            </div>
          </StackItem>
        </Stack>
      </CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const CockpitOnsiteSetupReviewStep = ({ values }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Check your setup')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {values.flightControlEnabled
            ? t('Review settings below, then apply configuration and enroll with Flight Control.')
            : t('Review settings below, then apply configuration to the device.')}
        </p>
      </StackItem>

      <StackItem>
        <ReviewSection title={t('Device summary')} stepId="hostname">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Hostname')}</DescriptionListTerm>
              <DescriptionListDescription>{values.hostname || '—'}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Network summary')} stepId="interface">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Interface')}</DescriptionListTerm>
              <DescriptionListDescription>{getNetworkInterfaceSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('IPv4')}</DescriptionListTerm>
              <DescriptionListDescription>{getIpv4Summary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('IPv6')}</DescriptionListTerm>
              <DescriptionListDescription>{getIpv6Summary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Service summary')} stepId="services">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Services')}</DescriptionListTerm>
              <DescriptionListDescription>{getServicesSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Management summary')} stepId="enrollment">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Enrollment')}</DescriptionListTerm>
              <DescriptionListDescription>{getEnrollmentSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            {values.flightControlEnabled && (
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {values.enrollmentCredentialMode === 'token' ? t('Flight Control token') : t('Flight Control credentials')}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {values.enrollmentCredentialMode === 'token'
                    ? maskSecret(values.flightControlToken)
                    : `${values.flightControlUsername} · ${maskSecret(values.flightControlPassword)}`}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {values.insightsEnabled && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Insights activation key')}</DescriptionListTerm>
                <DescriptionListDescription>{maskSecret(values.insightsActivationKey)}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </ReviewSection>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupReviewStep;
