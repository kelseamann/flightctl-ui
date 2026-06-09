import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import { isDevMockApi } from '../../../utils/devMock';
import type { EnrollmentServiceMode } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const DemoEnrollmentModeSelector = ({
  value,
  onChange,
}: {
  value: EnrollmentServiceMode;
  onChange: (mode: EnrollmentServiceMode) => void;
}) => {
  const { t } = useTranslation();
  if (!isDevMockApi()) {
    return null;
  }
  return (
    <StackItem>
      <FormGroup label={t('Enrollment scenario (demo)')} fieldId="onsite-enrollment-mode">
        <FormSelect
          id="onsite-enrollment-mode"
          value={value}
          onChange={(_e, v) => onChange(v as EnrollmentServiceMode)}
        >
          <FormSelectOption value="provision" label={t('Provision credentials (flightctl-agent enroll)')} />
          <FormSelectOption
            value="connectivity_only"
            label={t('Verify connectivity only (device already enrolled)')}
          />
          <FormSelectOption value="skipped" label={t('Skip — credentials already provisioned')} />
        </FormSelect>
      </FormGroup>
    </StackItem>
  );
};

const CockpitOnsiteSetupEnrollmentStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const isTokenMode = values.enrollmentCredentialMode === 'token';

  if (values.enrollmentServiceMode === 'skipped') {
    return (
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            {t('Service enrollment')}
          </Title>
        </StackItem>
        <DemoEnrollmentModeSelector
          value={values.enrollmentServiceMode}
          onChange={(mode) => onChange({ enrollmentServiceMode: mode })}
        />
        <StackItem>
          <Alert variant="info" isInline title={t('Enrollment credentials already provisioned')}>
            {t(
              'Flight Control enrollment credentials are already on this device. Cockpit skips credential provisioning and continues with connectivity checks only if needed.',
            )}
          </Alert>
        </StackItem>
      </Stack>
    );
  }

  if (values.enrollmentServiceMode === 'connectivity_only') {
    return (
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            {t('Service enrollment')}
          </Title>
          <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
            {t(
              'This device is already enrolled. Cockpit runs flightctl-agent test-connection to verify the Flight Control server is reachable without re-provisioning credentials.',
            )}
          </p>
        </StackItem>
        <DemoEnrollmentModeSelector
          value={values.enrollmentServiceMode}
          onChange={(mode) => onChange({ enrollmentServiceMode: mode })}
        />
        <StackItem>
          <Alert variant="info" isInline title={t('Verify connectivity only')}>
            {t('Device is already enrolled — verify connectivity only')}
          </Alert>
        </StackItem>
      </Stack>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Service enrollment')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'Enroll device into Flight Control management service. Cockpit invokes flightctl-agent enroll to authenticate and provision credentials on the device before the agent submits an enrollment request.',
          )}
        </p>
      </StackItem>

      <DemoEnrollmentModeSelector
        value={values.enrollmentServiceMode}
        onChange={(mode) => onChange({ enrollmentServiceMode: mode })}
      />

      <StackItem>
        <Card isPlain>
          <CardTitle>{t('Flight Control')}</CardTitle>
          <CardBody>
            <FormGroup label={t('Endpoint')} fieldId="onsite-fc-url">
              <TextInput
                id="onsite-fc-url"
                value={values.flightControlEndpoint}
                onChange={(_e, v) => onChange({ flightControlEndpoint: v })}
                placeholder="https://flightctl.example.com"
              />
              <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
                {t('Optional — leave blank to use the endpoint configured in Cockpit config.json.')}
              </p>
            </FormGroup>

            <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-md">
              {t(
                'Before visiting the device, sign in to Flight Control and open Devices to start adding a device for onsite onboarding. Copy the auth token shown for this enrollment, or use username and password below. Return to this Cockpit wizard on the device to enter credentials. Credentials are written to a temporary file on the device — never passed on the command line.',
              )}
            </p>

            {isTokenMode ? (
              <FormGroup label={t('Auth token')} isRequired fieldId="onsite-fc-token" className="pf-v6-u-mt-md">
                <TextInput
                  id="onsite-fc-token"
                  type="password"
                  value={values.flightControlToken}
                  onChange={(_e, v) => onChange({ flightControlToken: v })}
                  placeholder={t('Paste auth token from Flight Control')}
                />
                <Button
                  variant="link"
                  isInline
                  className="pf-v6-u-mt-sm"
                  onClick={() => onChange({ enrollmentCredentialMode: 'username_password' })}
                >
                  {t('Enroll with username and password')}
                </Button>
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
                <StackItem>
                  <Button variant="link" isInline onClick={() => onChange({ enrollmentCredentialMode: 'token' })}>
                    {t('Switch to auth token')}
                  </Button>
                </StackItem>
              </Stack>
            )}
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupEnrollmentStep;
