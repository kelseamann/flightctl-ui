import * as React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import InputGroupHeading from '../../common/InputGroupHeading';
import type { AuthenticationMethod, EnrollmentCredentialsSource } from '../types';
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
          {t('Select the management services you want to enroll this device into.')}
        </p>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('Flight Control Enrollment')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
          {t('Enroll this device into Flight Control fleet management')}
        </p>
        <FormGroup fieldId="onsite-enrollment-credentials-source" role="radiogroup" aria-labelledby="onsite-enrollment-credentials-source-heading">
          <InputGroupHeading id="onsite-enrollment-credentials-source-heading">
            {t('Credentials')}
          </InputGroupHeading>
          <Radio
            id="enrollment-credentials-existing"
            name="enrollment-credentials-source"
            label={t('Use existing enrollment credentials')}
            isChecked={values.enrollmentCredentialsSource === 'existing'}
            onChange={() => onChange({ enrollmentCredentialsSource: 'existing' as EnrollmentCredentialsSource })}
          />
          <Radio
            id="enrollment-credentials-new"
            name="enrollment-credentials-source"
            className="pf-v6-u-mt-sm"
            label={t('Configure new enrollment')}
            isChecked={values.enrollmentCredentialsSource === 'new'}
            onChange={() => onChange({ enrollmentCredentialsSource: 'new' as EnrollmentCredentialsSource })}
          />
        </FormGroup>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
          {t('Credentials')}
        </Title>
        <FormGroup fieldId="onsite-service-endpoint">
          <InputGroupHeading id="onsite-service-endpoint-heading">{t('Service Endpoint')}</InputGroupHeading>
          <TextInput
            id="onsite-service-endpoint"
            aria-labelledby="onsite-service-endpoint-heading"
            value={values.serviceEndpoint}
            onChange={(_e, v) => onChange({ serviceEndpoint: v })}
            placeholder="example-endpoint-123"
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{t('The text here should help me to qualify my service endpoint')}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <FormGroup
          fieldId="onsite-authentication-method"
          role="radiogroup"
          aria-labelledby="onsite-authentication-method-heading"
          className="pf-v6-u-mt-md"
        >
          <InputGroupHeading id="onsite-authentication-method-heading">
            {t('Authentication method')}
          </InputGroupHeading>
          <Radio
            id="authentication-method-token"
            name="authentication-method"
            label={t('Token')}
            isChecked={values.authenticationMethod === 'token'}
            onChange={() => onChange({ authenticationMethod: 'token' as AuthenticationMethod })}
          />
          <Radio
            id="authentication-method-password"
            name="authentication-method"
            className="pf-v6-u-mt-sm"
            label={t('Username and password')}
            isChecked={values.authenticationMethod === 'username_password'}
            onChange={() => onChange({ authenticationMethod: 'username_password' as AuthenticationMethod })}
          />
        </FormGroup>
        <FormGroup fieldId="onsite-fc-token" className="pf-v6-u-mt-md">
          <InputGroupHeading id="onsite-fc-token-heading" isRequired>
            {t('Token')}
          </InputGroupHeading>
          <TextInput
            id="onsite-fc-token"
            aria-labelledby="onsite-fc-token-heading"
            required
            type="password"
            value={values.flightControlToken}
            onChange={(_e, v) => onChange({ flightControlToken: v })}
            placeholder={t('Paste token from Flight Control service here')}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{t('<Documentation about how to get your token>')}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupEnrollmentStep;
