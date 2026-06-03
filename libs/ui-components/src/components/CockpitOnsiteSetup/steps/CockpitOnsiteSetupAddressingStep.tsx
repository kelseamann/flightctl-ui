import * as React from 'react';
import {
  Checkbox,
  ExpandableSection,
  FormGroup,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupAddressingStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const [ipv6Expanded, setIpv6Expanded] = React.useState(values.ipv6Method !== 'disabled');

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Network addressing')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t('Configure IPv4 and optional IPv6, matching Cockpit network address settings.')}
        </p>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="onsite-dhcp">
          <Radio
            id="onsite-dhcp"
            name="addressing"
            label={t('Automatic (DHCP)')}
            description={t('Network assigns IPv4 settings automatically')}
            isChecked={values.addressingMode === 'dhcp'}
            onChange={() => onChange({ addressingMode: 'dhcp' })}
            className="pf-v6-u-mb-md"
          />
          <Radio
            id="onsite-static"
            name="addressing"
            label={t('Manual (static IPv4)')}
            description={t('Enter IPv4 address, subnet mask, gateway, and DNS')}
            isChecked={values.addressingMode === 'static'}
            onChange={() => onChange({ addressingMode: 'static' })}
          />
        </FormGroup>
      </StackItem>

      {values.addressingMode === 'static' && (
        <StackItem>
          <FormGroup label={t('IPv4 address')} isRequired fieldId="onsite-ipv4">
            <TextInput
              id="onsite-ipv4"
              value={values.ipv4Address}
              onChange={(_e, v) => onChange({ ipv4Address: v })}
              placeholder="192.168.1.50"
            />
          </FormGroup>
          <FormGroup label={t('Subnet mask')} isRequired fieldId="onsite-subnet">
            <TextInput
              id="onsite-subnet"
              value={values.ipv4SubnetMask}
              onChange={(_e, v) => onChange({ ipv4SubnetMask: v })}
              placeholder="255.255.255.0"
            />
          </FormGroup>
          <FormGroup label={t('Default gateway')} isRequired fieldId="onsite-gateway">
            <TextInput
              id="onsite-gateway"
              value={values.ipv4Gateway}
              onChange={(_e, v) => onChange({ ipv4Gateway: v })}
              placeholder="192.168.1.1"
            />
          </FormGroup>
          <FormGroup fieldId="onsite-auto-dns">
            <Checkbox
              id="onsite-auto-dns"
              label={t('Obtain DNS server addresses automatically')}
              isChecked={values.ipv4AutoDns}
              onChange={(_e, checked) => onChange({ ipv4AutoDns: checked })}
            />
          </FormGroup>
          {!values.ipv4AutoDns && (
            <>
              <FormGroup label={t('DNS server (primary)')} fieldId="onsite-dns1">
                <TextInput
                  id="onsite-dns1"
                  value={values.ipv4PrimaryDns}
                  onChange={(_e, v) => onChange({ ipv4PrimaryDns: v })}
                  placeholder="8.8.8.8"
                />
              </FormGroup>
              <FormGroup label={t('DNS server (secondary)')} fieldId="onsite-dns2">
                <TextInput
                  id="onsite-dns2"
                  value={values.ipv4SecondaryDns}
                  onChange={(_e, v) => onChange({ ipv4SecondaryDns: v })}
                  placeholder={t('Optional')}
                />
              </FormGroup>
            </>
          )}
        </StackItem>
      )}

      <StackItem>
        <ExpandableSection
          toggleText={ipv6Expanded ? t('Hide IPv6 settings') : t('Show IPv6 settings')}
          isExpanded={ipv6Expanded}
          onToggle={(_event, expanded) => setIpv6Expanded(expanded)}
        >
          <FormGroup fieldId="onsite-ipv6-method">
            <Radio
              id="onsite-ipv6-disabled"
              name="ipv6-method"
              label={t('Disabled')}
              isChecked={values.ipv6Method === 'disabled'}
              onChange={() => onChange({ ipv6Method: 'disabled' })}
              className="pf-v6-u-mb-sm"
            />
            <Radio
              id="onsite-ipv6-auto"
              name="ipv6-method"
              label={t('Automatic (DHCP)')}
              isChecked={values.ipv6Method === 'auto'}
              onChange={() => onChange({ ipv6Method: 'auto' })}
              className="pf-v6-u-mb-sm"
            />
            <Radio
              id="onsite-ipv6-static"
              name="ipv6-method"
              label={t('Manual (static IPv6)')}
              isChecked={values.ipv6Method === 'static'}
              onChange={() => onChange({ ipv6Method: 'static' })}
            />
          </FormGroup>
          {values.ipv6Method === 'static' && (
            <>
              <FormGroup label={t('IPv6 address')} isRequired fieldId="onsite-ipv6" className="pf-v6-u-mt-md">
                <TextInput
                  id="onsite-ipv6"
                  value={values.ipv6Address}
                  onChange={(_e, v) => onChange({ ipv6Address: v })}
                  placeholder="2001:db8::1"
                />
              </FormGroup>
              <FormGroup label={t('IPv6 gateway')} fieldId="onsite-ipv6-gateway">
                <TextInput
                  id="onsite-ipv6-gateway"
                  value={values.ipv6Gateway}
                  onChange={(_e, v) => onChange({ ipv6Gateway: v })}
                  placeholder={t('Optional')}
                />
              </FormGroup>
            </>
          )}
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupAddressingStep;
