import * as React from 'react';
import {
  Checkbox,
  Divider,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Radio,
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
import { FIGMA_NETWORK_INTERFACES } from '../cockpitOnsiteSetupConstants';
import type { Ipv4Mode, Ipv6Mode, ProxyProtocol } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupNetworkStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const [isProtocolOpen, setIsProtocolOpen] = React.useState(false);

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
              <Th>{t('Mac address')}</Th>
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
                  <Td dataLabel={t('Mac address')}>{iface.macAddress}</Td>
                  <Td dataLabel={t('Vendor and model')}>{iface.driver}</Td>
                  <Td dataLabel={t('Speed')}>{iface.speed}</Td>
                  <Td dataLabel={t('State')}>{iface.mtu}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </StackItem>

      <StackItem>
        <FormGroup label={t('VLAN ID')} fieldId="onsite-vlan-id">
          <TextInput
            id="onsite-vlan-id"
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
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('IP Settings')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mb-lg">{t('Configure IPv4 and IPv6')}</p>
        <FormGroup label={t('IPv4 Connection:')} fieldId="onsite-ipv4-mode">
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
        <Checkbox
          id="ipv4-auto-dns"
          className="pf-v6-u-mt-md pf-v6-u-mb-xl"
          label={t('Automatically configure DNS')}
          isChecked={values.ipv4AutoDns}
          onChange={(_e, checked) => onChange({ ipv4AutoDns: checked })}
        />
        <FormGroup label={t('IPv6 Connection:')} fieldId="onsite-ipv6-mode">
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
        <Checkbox
          id="ipv6-auto-dns"
          className="pf-v6-u-mt-md"
          label={t('Automatically configure DNS')}
          isChecked={values.ipv6AutoDns}
          onChange={(_e, checked) => onChange({ ipv6AutoDns: checked })}
        />
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
        <FormGroup label={t('NTP Server Hostname')} fieldId="onsite-ntp-server">
          <TextInput
            id="onsite-ntp-server"
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
            <FormGroup label={t('Protocol')} fieldId="onsite-proxy-protocol">
              <Select
                isOpen={isProtocolOpen}
                selected={values.proxyProtocol}
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
            <FormGroup label={t('Proxy Hostname')} isRequired fieldId="onsite-proxy-hostname">
              <TextInput
                id="onsite-proxy-hostname"
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
            <FormGroup label={t('Proxy Port')} isRequired fieldId="onsite-proxy-port">
              <TextInput
                id="onsite-proxy-port"
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
            <FormGroup label={t('Proxy Username')} fieldId="onsite-proxy-user">
              <TextInput
                id="onsite-proxy-user"
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
            <FormGroup label={t('Proxy Password')} fieldId="onsite-proxy-pass">
              <TextInput
                id="onsite-proxy-pass"
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
            <FormGroup label={t('No Proxy')} fieldId="onsite-proxy-no-proxy">
              <TextInput
                id="onsite-proxy-no-proxy"
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
