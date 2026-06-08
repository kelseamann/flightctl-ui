import * as React from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/js/icons/trash-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { DETECTED_NETWORK_OPTIONS } from '../cockpitOnsiteSetupConstants';
import type { NetworkConnectionType } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupNetworkStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  const updateProxy = (index: number, url: string) => {
    const httpProxies = values.httpProxies.map((entry, i) => (i === index ? url : entry));
    onChange({ httpProxies });
  };

  const addProxy = () => {
    onChange({ httpProxies: [...values.httpProxies, ''] });
  };

  const removeProxy = (index: number) => {
    const httpProxies = values.httpProxies.filter((_, i) => i !== index);
    onChange({ httpProxies: httpProxies.length > 0 ? httpProxies : [''] });
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Network configurations')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'Cockpit system onboarding detects interfaces through NetworkManager. Ethernet is recommended when the device temporary Wi‑Fi access point is the only active path.',
          )}
        </p>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('System detected')}
        </Title>
        <Stack className="fctl-cockpit-network-detected">
          {DETECTED_NETWORK_OPTIONS.map((option) => (
            <StackItem key={option.id}>
              <Card
                isPlain
                isSelectable
                isSelected={values.networkConnectionType === option.id}
                onClick={() => onChange({ networkConnectionType: option.id as NetworkConnectionType })}
              >
                <CardTitle>
                  <Radio
                    id={`network-${option.id}`}
                    name="network-connection"
                    label={t(option.labelKey)}
                    isChecked={values.networkConnectionType === option.id}
                    onChange={() => onChange({ networkConnectionType: option.id as NetworkConnectionType })}
                  />
                  <Badge
                    className="pf-v6-u-ml-sm"
                    isRead
                    {...(option.state === 'active' ? { color: 'green' } : { color: 'grey' })}
                  >
                    {option.state === 'active' ? t('Active') : t('Inactive')}
                  </Badge>
                  {option.recommended && (
                    <Badge className="pf-v6-u-ml-sm" isRead>
                      {t('Recommended')}
                    </Badge>
                  )}
                </CardTitle>
                <CardBody>
                  <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-0">{t(option.descriptionKey)}</p>
                </CardBody>
              </Card>
            </StackItem>
          ))}
        </Stack>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('Network config')}
        </Title>
        <FormGroup label={t('Static IP')} isRequired fieldId="onsite-ipv4">
          <TextInput
            id="onsite-ipv4"
            value={values.ipv4Address}
            onChange={(_e, v) => onChange({ ipv4Address: v })}
            placeholder="192.168.1.50"
          />
        </FormGroup>
        <FormGroup label={t('DNS')} isRequired fieldId="onsite-dns" className="pf-v6-u-mt-md">
          <TextInput
            id="onsite-dns"
            value={values.dnsServers}
            onChange={(_e, v) => onChange({ dnsServers: v })}
            placeholder="192.168.1.1"
          />
        </FormGroup>
        <FormGroup label={t('Gateway')} fieldId="onsite-gateway" className="pf-v6-u-mt-md">
          <TextInput
            id="onsite-gateway"
            value={values.ipv4Gateway}
            onChange={(_e, v) => onChange({ ipv4Gateway: v })}
            placeholder="192.168.1.1"
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('HTTP proxy configuration')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
          {t('Add one or more HTTP proxies if the device must reach Flight Control through a proxy.')}
        </p>
        <Stack hasGutter>
          {values.httpProxies.map((proxy, index) => (
            <StackItem key={`proxy-${index}`}>
              <FormGroup label={index === 0 ? t('HTTP proxy URL') : undefined} fieldId={`onsite-proxy-${index}`}>
                <div className="pf-v6-l-flex pf-v6-u-gap-sm pf-v6-u-align-items-flex-end">
                  <TextInput
                    id={`onsite-proxy-${index}`}
                    value={proxy}
                    onChange={(_e, v) => updateProxy(index, v)}
                    placeholder="http://proxy.example.com:8080"
                    className="pf-v6-u-flex-fill"
                  />
                  {values.httpProxies.length > 1 && (
                    <Button
                      variant="plain"
                      aria-label={t('Remove proxy')}
                      icon={<TrashIcon />}
                      onClick={() => removeProxy(index)}
                    />
                  )}
                </div>
              </FormGroup>
            </StackItem>
          ))}
          <StackItem>
            <Button variant="link" isInline icon={<PlusCircleIcon />} onClick={addProxy}>
              {t('Add another proxy')}
            </Button>
          </StackItem>
        </Stack>
      </StackItem>
      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('Services')}
        </Title>
        <FormGroup label={t('NTP configuration')} fieldId="onsite-ntp">
          <TextInput
            id="onsite-ntp"
            value={values.ntpServer}
            onChange={(_e, v) => onChange({ ntpServer: v })}
            placeholder={t('Optional — e.g. pool.ntp.org')}
          />
          <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
            {t('Cockpit can configure chrony with automatic or custom NTP servers on the network services step.')}
          </p>
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupNetworkStep;
