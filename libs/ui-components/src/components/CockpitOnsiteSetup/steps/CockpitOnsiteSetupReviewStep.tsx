import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
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

const CockpitOnsiteSetupReviewStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
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
            'Confirm device, network, and enrollment settings before apply. Cockpit applies configuration on the device, then runs flightctl-agent enroll. Credentials and passwords are masked below.',
          )}
        </p>
      </StackItem>

      {values.singleNicSetup && (
        <StackItem>
          <Alert variant="warning" isInline title={t('Browser connection will be severed')} className="pf-v6-u-mb-0">
            {t(
              'Production network uses the same interface as your browser session. Applying network settings will disconnect this Cockpit session. Configuration continues in the background; reconnect to the setup network if enrollment fails.',
            )}
            <Checkbox
              id="single-nic-ack"
              className="pf-v6-u-mt-md"
              label={t('I understand my browser connection may drop during apply')}
              isChecked={values.singleNicWarningAcknowledged}
              onChange={(_e, checked) => onChange({ singleNicWarningAcknowledged: checked })}
            />
          </Alert>
        </StackItem>
      )}

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
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Network')} stepId="network">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Configuration')}</DescriptionListTerm>
              <DescriptionListDescription>{getNetworkSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            {configuredProxies.length > 0 && values.proxyUsername.trim() && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Proxy authentication')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {values.proxyUsername} / {maskSecret(values.proxyPassword)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </ReviewSection>

        <ReviewSection title={t('Enrollment config')} stepId="enrollment">
          <DescriptionList isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Services')}</DescriptionListTerm>
              <DescriptionListDescription>{getEnrollmentConfigSummary(values, t)}</DescriptionListDescription>
            </DescriptionListGroup>
            {values.enrollmentServiceMode === 'provision' && values.enrollmentCredentialMode === 'token' && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Auth token')}</DescriptionListTerm>
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
