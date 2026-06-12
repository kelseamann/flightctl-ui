import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Radio,
  Label,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useTranslation } from '../../../hooks/useTranslation';
import InputGroupHeading from '../../common/InputGroupHeading';
import { FIGMA_NETWORK_INTERFACES } from '../cockpitOnsiteSetupConstants';
import type { Ipv4Mode, Ipv6Mode, ProxyProtocol } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupNetworkStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const [isProtocolOpen, setIsProtocolOpen] = React.useState(false);
  const [isVlanExpanded, setIsVlanExpanded] = React.useState(false);
  const [isIpv4StaticExpanded, setIsIpv4StaticExpanded] = React.useState(false);
  const [isIpv4DnsExpanded, setIsIpv4DnsExpanded] = React.useState(false);
  const [isIpv6StaticExpanded, setIsIpv6StaticExpanded] = React.useState(false);
  const [isIpv6DnsExpanded, setIsIpv6DnsExpanded] = React.useState(false);

  const needsIpv4StaticFields = values.ipv4Mode === 'static';
  const needsIpv4DnsFields = !values.ipv4AutoDns;
  const needsIpv6StaticFields = values.ipv6Mode === 'static';
  const needsIpv6DnsFields = values.ipv6Mode !== 'disabled' && !values.ipv6AutoDns;

  React.useEffect(() => {
    if (needsIpv4StaticFields) {
      setIsIpv4StaticExpanded(true);
    }
  }, [needsIpv4StaticFields]);

  React.useEffect(() => {
    if (needsIpv4DnsFields) {
      setIsIpv4DnsExpanded(true);
    }
  }, [needsIpv4DnsFields]);

  React.useEffect(() => {
    if (needsIpv6StaticFields) {
      setIsIpv6StaticExpanded(true);
    }
  }, [needsIpv6StaticFields]);

  React.useEffect(() => {
    if (needsIpv6DnsFields) {
      setIsIpv6DnsExpanded(true);
    }
  }, [needsIpv6DnsFields]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Network')}
        </Title>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('Choose a network interface to use for onboarding')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
          {t(
            'If you don’t see your network on this list, you will need to troubleshoot it and refresh the page.',
          )}
        </p>
        <Table aria-label={t('Network interfaces')} variant="compact" borders={false}>
          <Thead>
            <Tr>
              <Th screenReaderText={t('Select interface')} />
              <Th>{t('Name')}</Th>
              <Th>{t('Type')}</Th>
              <Th>{t('MAC address')}</Th>
              <Th>{t('Vendor and model')}</Th>
              <Th>{t('Speed')}</Th>
              <Th>{t('State')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {FIGMA_NETWORK_INTERFACES.map((iface) => {
              const isSelected = values.selectedNetworkInterface === iface.device;
              return (
                <Tr key={iface.device}>
                  <Td>
                    <Radio
                      id={`network-interface-select-${iface.device}`}
                      name="network-interface"
                      isChecked={isSelected}
                      onChange={() => onChange({ selectedNetworkInterface: iface.device })}
                      aria-label={t('Select {{name}}', { name: iface.device })}
                    />
                  </Td>
                  <Td dataLabel={t('Name')}>{iface.device}</Td>
                  <Td dataLabel={t('Type')}>{iface.type}</Td>
                  <Td dataLabel={t('MAC address')}>{iface.macAddress}</Td>
                  <Td dataLabel={t('Vendor and model')}>{iface.driver}</Td>
                  <Td dataLabel={t('Speed')}>{iface.speed}</Td>
                  <Td dataLabel={t('State')}>
                    <Label color="green">{t('Connected')}</Label>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </StackItem>

      <StackItem>
        <Accordion asDefinitionList={false}>
          <AccordionItem isExpanded={isVlanExpanded}>
            <AccordionToggle
              id="onsite-optional-vlan-id-toggle"
              onClick={() => setIsVlanExpanded((expanded) => !expanded)}
            >
              {t('Optional VLAN ID')}
            </AccordionToggle>
            <AccordionContent id="onsite-optional-vlan-id-content" aria-labelledby="onsite-optional-vlan-id-toggle">
              <FormGroup fieldId="onsite-vlan-id">
                <InputGroupHeading id="onsite-vlan-id-heading">{t('VLAN ID')}</InputGroupHeading>
                <TextInput
                  id="onsite-vlan-id"
                  aria-labelledby="onsite-vlan-id-heading"
                  value={values.vlanId}
                  onChange={(_e, v) => onChange({ vlanId: v })}
                  placeholder={t('Enter a number from 1-4094')}
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>{t('The text here should help me to qualify my VLAN ID')}</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('IP Settings')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mb-lg">{t('Configure IPv4 and IPv6')}</p>
        <FormGroup fieldId="onsite-ipv4-mode" role="radiogroup" aria-labelledby="onsite-ipv4-mode-heading">
          <InputGroupHeading id="onsite-ipv4-mode-heading">{t('IPv4 Connection:')}</InputGroupHeading>
          <Radio
            id="ipv4-dhcpv4"
            name="ipv4-mode"
            label={t('DHCPv4')}
            isChecked={values.ipv4Mode === 'dhcpv4'}
            onChange={() => onChange({ ipv4Mode: 'dhcpv4' as Ipv4Mode })}
          />
          <Radio
            id="ipv4-static"
            name="ipv4-mode"
            label={t('Static IP')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ipv4Mode === 'static'}
            onChange={() => onChange({ ipv4Mode: 'static' as Ipv4Mode })}
          />
        </FormGroup>
        {needsIpv4StaticFields && (
          <Accordion asDefinitionList={false} className="pf-v6-u-mt-md">
            <AccordionItem isExpanded={isIpv4StaticExpanded}>
              <AccordionToggle
                id="onsite-ipv4-static-toggle"
                onClick={() => setIsIpv4StaticExpanded((expanded) => !expanded)}
              >
                {t('IPv4 Static IP configuration')}
              </AccordionToggle>
              <AccordionContent id="onsite-ipv4-static-content" aria-labelledby="onsite-ipv4-static-toggle">
                <Stack hasGutter>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv4-address">
                      <InputGroupHeading id="onsite-ipv4-address-heading" isRequired>
                        {t('IPv4 Address')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv4-address"
                        aria-labelledby="onsite-ipv4-address-heading"
                        required
                        value={values.ipv4Address}
                        onChange={(_e, v) => onChange({ ipv4Address: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv4-subnet-mask">
                      <InputGroupHeading id="onsite-ipv4-subnet-mask-heading" isRequired>
                        {t('Subnet Mask')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv4-subnet-mask"
                        aria-labelledby="onsite-ipv4-subnet-mask-heading"
                        required
                        value={values.ipv4SubnetMask}
                        onChange={(_e, v) => onChange({ ipv4SubnetMask: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv4-gateway">
                      <InputGroupHeading id="onsite-ipv4-gateway-heading" isRequired>
                        {t('Gateway IP')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv4-gateway"
                        aria-labelledby="onsite-ipv4-gateway-heading"
                        required
                        value={values.ipv4Gateway}
                        onChange={(_e, v) => onChange({ ipv4Gateway: v })}
                      />
                    </FormGroup>
                  </StackItem>
                </Stack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <FormGroup
          fieldId="onsite-ipv4-dns"
          role="radiogroup"
          aria-labelledby="onsite-ipv4-dns-heading"
          className="pf-v6-u-mt-md"
        >
          <InputGroupHeading id="onsite-ipv4-dns-heading">{t('IPv4 DNS')}</InputGroupHeading>
          <Radio
            id="ipv4-dns-automatic"
            name="ipv4-dns"
            label={t('Automatic')}
            isChecked={values.ipv4AutoDns}
            onChange={() => onChange({ ipv4AutoDns: true })}
          />
          <Radio
            id="ipv4-dns-manual"
            name="ipv4-dns"
            label={t('Manual')}
            className="pf-v6-u-mt-sm"
            isChecked={!values.ipv4AutoDns}
            onChange={() => onChange({ ipv4AutoDns: false })}
          />
        </FormGroup>
        {needsIpv4DnsFields && (
          <Accordion asDefinitionList={false} className="pf-v6-u-mt-md pf-v6-u-mb-xl">
            <AccordionItem isExpanded={isIpv4DnsExpanded}>
              <AccordionToggle
                id="onsite-ipv4-dns-toggle"
                onClick={() => setIsIpv4DnsExpanded((expanded) => !expanded)}
              >
                {t('IPv4 DNS configuration')}
              </AccordionToggle>
              <AccordionContent id="onsite-ipv4-dns-content" aria-labelledby="onsite-ipv4-dns-toggle">
                <Stack hasGutter>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv4-primary-dns">
                      <InputGroupHeading id="onsite-ipv4-primary-dns-heading" isRequired>
                        {t('Primary Server')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv4-primary-dns"
                        aria-labelledby="onsite-ipv4-primary-dns-heading"
                        required
                        value={values.ipv4PrimaryDns}
                        onChange={(_e, v) => onChange({ ipv4PrimaryDns: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv4-secondary-dns">
                      <InputGroupHeading id="onsite-ipv4-secondary-dns-heading" isRequired>
                        {t('Secondary Server')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv4-secondary-dns"
                        aria-labelledby="onsite-ipv4-secondary-dns-heading"
                        required
                        value={values.ipv4SecondaryDns}
                        onChange={(_e, v) => onChange({ ipv4SecondaryDns: v })}
                      />
                    </FormGroup>
                  </StackItem>
                </Stack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <FormGroup
          fieldId="onsite-ipv6-mode"
          role="radiogroup"
          aria-labelledby="onsite-ipv6-mode-heading"
          className="pf-v6-u-mt-xl"
        >
          <InputGroupHeading id="onsite-ipv6-mode-heading">{t('IPv6 Connection:')}</InputGroupHeading>
          <Radio
            id="ipv6-dhcpv6"
            name="ipv6-mode"
            label={t('DHCPv6')}
            isChecked={values.ipv6Mode === 'dhcpv6'}
            onChange={() => onChange({ ipv6Mode: 'dhcpv6' as Ipv6Mode })}
          />
          <Radio
            id="ipv6-static"
            name="ipv6-mode"
            label={t('Static IP')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ipv6Mode === 'static'}
            onChange={() => onChange({ ipv6Mode: 'static' as Ipv6Mode })}
          />
          <Radio
            id="ipv6-disabled"
            name="ipv6-mode"
            label={t('Disabled')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ipv6Mode === 'disabled'}
            onChange={() => onChange({ ipv6Mode: 'disabled' as Ipv6Mode })}
          />
        </FormGroup>
        {needsIpv6StaticFields && (
          <Accordion asDefinitionList={false} className="pf-v6-u-mt-md">
            <AccordionItem isExpanded={isIpv6StaticExpanded}>
              <AccordionToggle
                id="onsite-ipv6-static-toggle"
                onClick={() => setIsIpv6StaticExpanded((expanded) => !expanded)}
              >
                {t('IPv6 Static IP configuration')}
              </AccordionToggle>
              <AccordionContent id="onsite-ipv6-static-content" aria-labelledby="onsite-ipv6-static-toggle">
                <Stack hasGutter>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv6-address">
                      <InputGroupHeading id="onsite-ipv6-address-heading" isRequired>
                        {t('IPv6 Address')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv6-address"
                        aria-labelledby="onsite-ipv6-address-heading"
                        required
                        value={values.ipv6Address}
                        onChange={(_e, v) => onChange({ ipv6Address: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv6-gateway">
                      <InputGroupHeading id="onsite-ipv6-gateway-heading" isRequired>
                        {t('Gateway IP')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv6-gateway"
                        aria-labelledby="onsite-ipv6-gateway-heading"
                        required
                        value={values.ipv6Gateway}
                        onChange={(_e, v) => onChange({ ipv6Gateway: v })}
                      />
                    </FormGroup>
                  </StackItem>
                </Stack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <FormGroup
          fieldId="onsite-ipv6-dns"
          role="radiogroup"
          aria-labelledby="onsite-ipv6-dns-heading"
          className="pf-v6-u-mt-md"
        >
          <InputGroupHeading id="onsite-ipv6-dns-heading">{t('IPv6 DNS')}</InputGroupHeading>
          <Radio
            id="ipv6-dns-automatic"
            name="ipv6-dns"
            label={t('Automatic')}
            isChecked={values.ipv6AutoDns}
            isDisabled={values.ipv6Mode === 'disabled'}
            onChange={() => onChange({ ipv6AutoDns: true })}
          />
          <Radio
            id="ipv6-dns-manual"
            name="ipv6-dns"
            label={t('Manual')}
            className="pf-v6-u-mt-sm"
            isChecked={!values.ipv6AutoDns}
            isDisabled={values.ipv6Mode === 'disabled'}
            onChange={() => onChange({ ipv6AutoDns: false })}
          />
        </FormGroup>
        {needsIpv6DnsFields && (
          <Accordion asDefinitionList={false} className="pf-v6-u-mt-md">
            <AccordionItem isExpanded={isIpv6DnsExpanded}>
              <AccordionToggle
                id="onsite-ipv6-dns-toggle"
                onClick={() => setIsIpv6DnsExpanded((expanded) => !expanded)}
              >
                {t('IPv6 DNS configuration')}
              </AccordionToggle>
              <AccordionContent id="onsite-ipv6-dns-content" aria-labelledby="onsite-ipv6-dns-toggle">
                <Stack hasGutter>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv6-primary-dns">
                      <InputGroupHeading id="onsite-ipv6-primary-dns-heading" isRequired>
                        {t('Primary Server')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv6-primary-dns"
                        aria-labelledby="onsite-ipv6-primary-dns-heading"
                        required
                        value={values.ipv6PrimaryDns}
                        onChange={(_e, v) => onChange({ ipv6PrimaryDns: v })}
                      />
                    </FormGroup>
                  </StackItem>
                  <StackItem>
                    <FormGroup fieldId="onsite-ipv6-secondary-dns">
                      <InputGroupHeading id="onsite-ipv6-secondary-dns-heading" isRequired>
                        {t('Secondary Server')}
                      </InputGroupHeading>
                      <TextInput
                        id="onsite-ipv6-secondary-dns"
                        aria-labelledby="onsite-ipv6-secondary-dns-heading"
                        required
                        value={values.ipv6SecondaryDns}
                        onChange={(_e, v) => onChange({ ipv6SecondaryDns: v })}
                      />
                    </FormGroup>
                  </StackItem>
                </Stack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('Network Services')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mb-lg">
          {t('Define the hostname to uniquely identify this image within your network environment.')}
        </p>
        <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
          {t('Configure NTP Servers')}
        </Title>
        <FormGroup fieldId="onsite-ntp-server">
          <InputGroupHeading id="onsite-ntp-server-heading">{t('NTP Server Hostname')}</InputGroupHeading>
          <TextInput
            id="onsite-ntp-server"
            aria-labelledby="onsite-ntp-server-heading"
            value={values.ntpServerHostname}
            onChange={(_e, v) => onChange({ ntpServerHostname: v })}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{t('The text here should help me to qualify my VLAN ID')}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
          {t('Configure HTTP Proxy')}
        </Title>
        <Stack hasGutter>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-protocol">
              <InputGroupHeading id="onsite-proxy-protocol-heading">{t('Protocol')}</InputGroupHeading>
              <Select
                isOpen={isProtocolOpen}
                selected={values.proxyProtocol}
                aria-labelledby="onsite-proxy-protocol-heading"
                onSelect={(_e, value) => {
                  onChange({ proxyProtocol: value as ProxyProtocol });
                  setIsProtocolOpen(false);
                }}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    isExpanded={isProtocolOpen}
                    onClick={() => setIsProtocolOpen((open) => !open)}
                    style={{ width: '100%' }}
                  >
                    {values.proxyProtocol}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="HTTP">{t('HTTP')}</SelectOption>
                  <SelectOption value="HTTPS">{t('HTTPS')}</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-hostname">
              <InputGroupHeading id="onsite-proxy-hostname-heading" isRequired>
                {t('Proxy Hostname')}
              </InputGroupHeading>
              <TextInput
                id="onsite-proxy-hostname"
                aria-labelledby="onsite-proxy-hostname-heading"
                required
                value={values.proxyHostname}
                onChange={(_e, v) => onChange({ proxyHostname: v })}
                placeholder="proxy.example.com"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>{t('The text here should help me to qualify my VLAN ID')}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-port">
              <InputGroupHeading id="onsite-proxy-port-heading" isRequired>
                {t('Proxy Port')}
              </InputGroupHeading>
              <TextInput
                id="onsite-proxy-port"
                aria-labelledby="onsite-proxy-port-heading"
                required
                value={values.proxyPort}
                onChange={(_e, v) => onChange({ proxyPort: v })}
                placeholder="proxy.example.com"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>{t('The text here should help me to qualify my port')}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-user">
              <InputGroupHeading id="onsite-proxy-user-heading">{t('Proxy Username')}</InputGroupHeading>
              <TextInput
                id="onsite-proxy-user"
                aria-labelledby="onsite-proxy-user-heading"
                value={values.proxyUsername}
                onChange={(_e, v) => onChange({ proxyUsername: v })}
                placeholder="proxy.example.com"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>{t('The text here should help me qualify my username')}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-pass">
              <InputGroupHeading id="onsite-proxy-pass-heading">{t('Proxy Password')}</InputGroupHeading>
              <TextInput
                id="onsite-proxy-pass"
                aria-labelledby="onsite-proxy-pass-heading"
                type="password"
                value={values.proxyPassword}
                onChange={(_e, v) => onChange({ proxyPassword: v })}
                placeholder="proxy.example.com"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>{t('The text here should help me qualify my username')}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="onsite-proxy-no-proxy">
              <InputGroupHeading id="onsite-proxy-no-proxy-heading">{t('No Proxy')}</InputGroupHeading>
              <TextInput
                id="onsite-proxy-no-proxy"
                aria-labelledby="onsite-proxy-no-proxy-heading"
                value={values.proxyNoProxy}
                onChange={(_e, v) => onChange({ proxyNoProxy: v })}
                placeholder="localhost,127.0.0.1,::1"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    {t('Comma-separated list of hosts, domains, or CIDRs that should bypass the proxy')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          </StackItem>
        </Stack>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupNetworkStep;
