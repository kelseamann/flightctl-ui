import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupEnrollmentStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const [tokenHelpOpen, setTokenHelpOpen] = React.useState(false);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            {t('Service enrollment')}
          </Title>
          <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
            {t(
              'Cockpit runs enrollment scripts from system-onboarding.d. Paste a setup token from Flight Control or sign in with your Flight Control credentials.',
            )}
          </p>
        </StackItem>

        <StackItem>
          <Card isPlain>
            <CardTitle>
              <Checkbox
                id="onsite-fc-enable"
                label={t('Flight Control')}
                isChecked={values.flightControlEnabled}
                onChange={(_e, checked) => onChange({ flightControlEnabled: checked })}
              />
            </CardTitle>
            {values.flightControlEnabled && (
              <CardBody>
                <FormGroup label={t('Endpoint')} fieldId="onsite-fc-url">
                  <TextInput
                    id="onsite-fc-url"
                    value={values.flightControlEndpoint}
                    onChange={(_e, v) => onChange({ flightControlEndpoint: v })}
                    placeholder="https://flightctl.example.com"
                  />
                  <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
                    {t('Optional — leave blank to use the endpoint configured in Cockpit.')}
                  </p>
                </FormGroup>

                {values.enrollmentCredentialMode === 'token' ? (
                  <FormGroup label={t('Token')} isRequired fieldId="onsite-fc-token" className="pf-v6-u-mt-md">
                    <TextInput
                      id="onsite-fc-token"
                      type="password"
                      value={values.flightControlToken}
                      onChange={(_e, v) => onChange({ flightControlToken: v })}
                      placeholder={t('Paste enrollment token from Flight Control')}
                    />
                    <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
                      {t('Copy the setup token from Flight Control and paste it here before starting enrollment.')}
                    </p>
                    <Alert
                      variant="warning"
                      isInline
                      title={t('[Prototype instructions] How to get your token in Flight Control')}
                      className="pf-v6-u-mt-md"
                    >
                      <ol className="pf-v6-u-mb-0 pf-v6-u-pl-md">
                        <li>{t('Sign in to Flight Control in a browser on your laptop or phone.')}</li>
                        <li>{t('Open Devices → Add devices (or Enrollment requests).')}</li>
                        <li>{t('Start a new enrollment and copy the setup token shown for this device.')}</li>
                        <li>{t('Return to this Cockpit wizard and paste the token above.')}</li>
                      </ol>
                    </Alert>
                    <Stack hasGutter className="pf-v6-u-mt-sm">
                      <StackItem>
                        <Button variant="link" isInline onClick={() => setTokenHelpOpen(true)}>
                          {t('Cannot access token?')}
                        </Button>
                      </StackItem>
                      <StackItem>
                        <Button
                          variant="link"
                          isInline
                          onClick={() => onChange({ enrollmentCredentialMode: 'username_password' })}
                        >
                          {t('Switch to username/password')}
                        </Button>
                      </StackItem>
                    </Stack>
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
                      <Button
                        variant="link"
                        isInline
                        onClick={() => onChange({ enrollmentCredentialMode: 'token' })}
                      >
                        {t('Switch to setup token')}
                      </Button>
                    </StackItem>
                  </Stack>
                )}
              </CardBody>
            )}
          </Card>
        </StackItem>
      </Stack>

      <Modal variant="small" isOpen={tokenHelpOpen} onClose={() => setTokenHelpOpen(false)}>
        <ModalHeader title={t('Cannot access token?')} />
        <ModalBody>
          {t(
            'Use your Flight Control username and password instead — the same credentials you use to sign in to Flight Control in a browser.',
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setTokenHelpOpen(false);
              onChange({ enrollmentCredentialMode: 'username_password' });
            }}
          >
            {t('Switch to username/password')}
          </Button>
          <Button variant="link" onClick={() => setTokenHelpOpen(false)}>
            {t('Close')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CockpitOnsiteSetupEnrollmentStep;
