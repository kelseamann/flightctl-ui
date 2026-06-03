import * as React from 'react';
import { Card, CardBody, CardTitle, Checkbox, FormGroup, Stack, StackItem, TextInput, Title } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupServicesStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Network services')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t('Optional NTP and HTTP proxy settings, as on the Cockpit network services step.')}
        </p>
      </StackItem>

      <StackItem>
        <Card isPlain>
          <CardTitle>{t('Time synchronization')}</CardTitle>
          <CardBody>
            <Checkbox
              id="onsite-ntp-auto"
              label={t('Use automatic NTP configuration')}
              description={t('Keep the device clock synchronized using system NTP defaults')}
              isChecked={values.ntpAutoConfig}
              onChange={(_e, checked) => onChange({ ntpAutoConfig: checked, ntpServer: checked ? '' : values.ntpServer })}
            />
            {!values.ntpAutoConfig && (
              <FormGroup label={t('NTP server')} fieldId="onsite-ntp" className="pf-v6-u-mt-md">
                <TextInput
                  id="onsite-ntp"
                  value={values.ntpServer}
                  onChange={(_e, v) => onChange({ ntpServer: v })}
                  placeholder="pool.ntp.org"
                />
              </FormGroup>
            )}
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card isPlain>
          <CardTitle>{t('HTTP proxy')}</CardTitle>
          <CardBody>
            <Checkbox
              id="onsite-proxy-enable"
              label={t('Use HTTP proxy')}
              description={t('Required when outbound traffic must go through a proxy')}
              isChecked={values.proxyEnabled}
              onChange={(_e, checked) => onChange({ proxyEnabled: checked })}
            />
            {values.proxyEnabled && (
              <Stack hasGutter className="pf-v6-u-mt-md">
                <StackItem>
                  <FormGroup label={t('Proxy hostname')} isRequired fieldId="onsite-proxy-host">
                    <TextInput
                      id="onsite-proxy-host"
                      value={values.httpProxyHost}
                      onChange={(_e, v) => onChange({ httpProxyHost: v })}
                      placeholder="proxy.example.com"
                    />
                  </FormGroup>
                </StackItem>
                <StackItem>
                  <FormGroup label={t('Proxy port')} isRequired fieldId="onsite-proxy-port">
                    <TextInput
                      id="onsite-proxy-port"
                      value={values.httpProxyPort}
                      onChange={(_e, v) => onChange({ httpProxyPort: v })}
                      placeholder="8080"
                    />
                  </FormGroup>
                </StackItem>
                <StackItem>
                  <FormGroup label={t('Proxy username')} fieldId="onsite-proxy-user">
                    <TextInput
                      id="onsite-proxy-user"
                      value={values.httpProxyUsername}
                      onChange={(_e, v) => onChange({ httpProxyUsername: v })}
                    />
                  </FormGroup>
                </StackItem>
                <StackItem>
                  <FormGroup label={t('Proxy password')} fieldId="onsite-proxy-pass">
                    <TextInput
                      id="onsite-proxy-pass"
                      type="password"
                      value={values.httpProxyPassword}
                      onChange={(_e, v) => onChange({ httpProxyPassword: v })}
                    />
                  </FormGroup>
                </StackItem>
              </Stack>
            )}
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupServicesStep;
