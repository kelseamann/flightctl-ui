import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  FormGroup,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupEnrollmentStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Enrollment')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'Select management services configured in Cockpit system-onboarding. Each service uses credentials defined in the plugin config.',
          )}
        </p>
      </StackItem>

      <StackItem>
        <Card isPlain>
          <CardTitle>
            <Checkbox
              id="onsite-fc-enable"
              label={t('Flight Control')}
              description={t('Enroll this device into Flight Control fleet management')}
              isChecked={values.flightControlEnabled}
              onChange={(_e, checked) => onChange({ flightControlEnabled: checked })}
            />
          </CardTitle>
          {values.flightControlEnabled && (
            <CardBody>
              <FormGroup label={t('Service URL')} isRequired fieldId="onsite-fc-url">
                <TextInput
                  id="onsite-fc-url"
                  value={values.flightControlEndpoint}
                  onChange={(_e, v) => onChange({ flightControlEndpoint: v })}
                  placeholder="https://flightctl.example.com"
                />
              </FormGroup>

              <FormGroup label={t('Authentication')} fieldId="onsite-fc-auth" className="pf-v6-u-mt-md">
                <Radio
                  id="onsite-fc-token"
                  name="fc-auth"
                  label={t('Setup token')}
                  description={t('Paste a token from Flight Control enrollment settings')}
                  isChecked={values.enrollmentCredentialMode === 'token'}
                  onChange={() => onChange({ enrollmentCredentialMode: 'token' })}
                  className="pf-v6-u-mb-md"
                />
                <Radio
                  id="onsite-fc-userpass"
                  name="fc-auth"
                  label={t('Username and password')}
                  isChecked={values.enrollmentCredentialMode === 'username_password'}
                  onChange={() => onChange({ enrollmentCredentialMode: 'username_password' })}
                />
              </FormGroup>

              {values.enrollmentCredentialMode === 'token' ? (
                <FormGroup label={t('Setup token')} isRequired fieldId="onsite-fc-token-input" className="pf-v6-u-mt-md">
                  <TextInput
                    id="onsite-fc-token-input"
                    type="password"
                    value={values.flightControlToken}
                    onChange={(_e, v) => onChange({ flightControlToken: v })}
                    placeholder={t('Paste your setup token here')}
                  />
                  <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
                    {t('In Flight Control: Settings → Devices → generate an enrollment token for this device.')}
                  </p>
                </FormGroup>
              ) : (
                <Stack hasGutter className="pf-v6-u-mt-md">
                  <StackItem>
                    <FormGroup label={t('Username')} isRequired fieldId="onsite-fc-user">
                      <TextInput
                        id="onsite-fc-user"
                        value={values.flightControlUsername}
                        onChange={(_e, v) => onChange({ flightControlUsername: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup label={t('Password')} isRequired fieldId="onsite-fc-pass">
                      <TextInput
                        id="onsite-fc-pass"
                        type="password"
                        value={values.flightControlPassword}
                        onChange={(_e, v) => onChange({ flightControlPassword: v })}
                      />
                    </FormGroup>
                  </StackItem>
                </Stack>
              )}
            </CardBody>
          )}
        </Card>
      </StackItem>

      <StackItem>
        <Card isPlain>
          <CardTitle>
            <Checkbox
              id="onsite-insights-enable"
              label={t('Red Hat Insights')}
              description={t('Register this system with Red Hat Insights for monitoring and management')}
              isChecked={values.insightsEnabled}
              onChange={(_e, checked) => onChange({ insightsEnabled: checked })}
            />
          </CardTitle>
          {values.insightsEnabled && (
            <CardBody>
              <FormGroup label={t('Organization ID')} isRequired fieldId="onsite-insights-org">
                <TextInput
                  id="onsite-insights-org"
                  value={values.insightsOrganizationId}
                  onChange={(_e, v) => onChange({ insightsOrganizationId: v })}
                />
              </FormGroup>
              <FormGroup label={t('Activation key')} isRequired fieldId="onsite-insights-key" className="pf-v6-u-mt-md">
                <TextInput
                  id="onsite-insights-key"
                  type="password"
                  value={values.insightsActivationKey}
                  onChange={(_e, v) => onChange({ insightsActivationKey: v })}
                />
              </FormGroup>
              <FormGroup fieldId="onsite-insights-remote" className="pf-v6-u-mt-md">
                <Checkbox
                  id="onsite-insights-remote"
                  label={t('Disable remote management in Insights')}
                  description={t('Use when Flight Control manages the device remotely')}
                  isChecked={values.insightsDisableRemoteManagement}
                  onChange={(_e, checked) => onChange({ insightsDisableRemoteManagement: checked })}
                />
              </FormGroup>
            </CardBody>
          )}
        </Card>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupEnrollmentStep;
