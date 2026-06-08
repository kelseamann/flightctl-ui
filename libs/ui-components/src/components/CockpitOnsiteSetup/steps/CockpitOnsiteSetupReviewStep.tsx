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
  getEnrollmentConfigSummary,
  getNetworkSummary,
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
      </CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const CockpitOnsiteSetupReviewStep = ({ values }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const configuredProxies = values.httpProxies.map((p) => p.trim()).filter(Boolean);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Review and enroll')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'Confirm device, network, and enrollment settings. Cockpit will apply configuration on the device, then run enrollment scripts.',
          )}
        </p>
      </StackItem>
      <StackItem>
        <ReviewSection title={t('Device info')} stepId="general">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Host name')}</DescriptionListTerm>
              <DescriptionListDescription>{values.hostname || t('localhost')}</DescriptionListDescription>
            </DescriptionListGroup>
            {values.labels.trim() && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Labels')}</DescriptionListTerm>
                <DescriptionListDescription>{values.labels}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {values.description.trim() && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                <DescriptionListDescription>{values.description}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Network')} stepId="network">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Configuration')}</DescriptionListTerm>
              <DescriptionListDescription>{getNetworkSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            {configuredProxies.length > 0 && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('HTTP proxies')}</DescriptionListTerm>
                <DescriptionListDescription>{configuredProxies.join(', ')}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </ReviewSection>

        {values.ntpServer.trim() && (
          <ReviewSection title={t('Services')} stepId="network">
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('NTP')}</DescriptionListTerm>
                <DescriptionListDescription>{values.ntpServer}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ReviewSection>
        )}

        <ReviewSection title={t('Enrollment config')} stepId="enrollment">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Services')}</DescriptionListTerm>
              <DescriptionListDescription>{getEnrollmentConfigSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            {values.flightControlEnabled && values.enrollmentCredentialMode === 'token' && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Token')}</DescriptionListTerm>
                <DescriptionListDescription>{maskSecret(values.flightControlToken)}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </ReviewSection>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupReviewStep;
