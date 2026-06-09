import * as React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/js/icons/trash-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { DETECTED_NETWORK_OPTIONS, MOCK_WIFI_SCAN_RESULTS } from '../cockpitOnsiteSetupConstants';
import type { Ipv4Mode, Ipv6Mode, NetworkConnectionType } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupNetworkStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const isScannedSsid = MOCK_WIFI_SCAN_RESULTS.includes(
    values.wifiSsid as (typeof MOCK_WIFI_SCAN_RESULTS)[number],
  );
  const [manualSsidEntry, setManualSsidEntry] = React.useState(
    () => values.wifiSsid !== '' && !isScannedSsid,
  );

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
            'NetworkManager detects interfaces on the device. Ethernet is preferred for production configuration when available. Validation checks (carrier, duplicate IP) are advisory — you can proceed even if a check fails.',
          )}
        </p>
      </StackItem>

      <StackItem>
        <Alert variant="info" isInline title={t('Validation (advisory)')}>
          {t('Ethernet carrier: detected · Duplicate IP (arping): not checked for VLAN interfaces')}
        </Alert>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('System detected')}
        </Title>
        <FormGroup fieldId="network-connection">
          <div className="fctl-cockpit-network-detected">
            {DETECTED_NETWORK_OPTIONS.map((option) => (
              <div key={option.id} className="fctl-cockpit-network-detected__option">
                <Radio
                  id={`network-${option.id}`}
                  name="network-connection"
                  label={t(option.labelKey)}
                  isChecked={values.networkConnectionType === option.id}
                  onChange={() => onChange({ networkConnectionType: option.id as NetworkConnectionType })}
                />
                <span className="pf-v6-u-ml-sm pf-v6-u-color-200 pf-v6-u-font-size-sm">
                  {option.state === 'active' ? t('Active') : t('Inactive')}
                  {option.recommended ? ` · ${t('Recommended')}` : ''}
                </span>
                <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-0 fctl-cockpit-network-detected__description">
                  {t(option.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </FormGroup>
      </StackItem>

      {values.networkConnectionType === 'wifi' && (
        <StackItem>
          <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
            {t('Wi-Fi client')}
          </Title>
          <FormGroup label={t('SSID')} isRequired fieldId="onsite-wifi-ssid">
            {!manualSsidEntry && (
              <FormSelect
                id="onsite-wifi-ssid"
                value={isScannedSsid ? values.wifiSsid : ''}
                onChange={(_e, v) => {
                  if (v === '__manual__') {
                    setManualSsidEntry(true);
                    onChange({ wifiSsid: '' });
                    return;
                  }
                  onChange({ wifiSsid: v });
                }}
              >
                <FormSelectOption value="" label={t('Select a scanned network')} isDisabled />
                {MOCK_WIFI_SCAN_RESULTS.map((ssid) => (
                  <FormSelectOption key={ssid} value={ssid} label={ssid} />
                ))}
                <FormSelectOption value="__manual__" label={t('Enter SSID manually (hidden network)')} />
              </FormSelect>
            )}
            {manualSsidEntry && (
              <>
                <TextInput
                  id="onsite-wifi-ssid-manual"
                  value={values.wifiSsid}
                  onChange={(_e, v) => onChange({ wifiSsid: v })}
                  placeholder={t('Hidden or unscanned SSID')}
                />
                <Button variant="link" isInline className="pf-v6-u-mt-sm" onClick={() => setManualSsidEntry(false)}>
                  {t('Choose from scanned networks')}
                </Button>
              </>
            )}
            <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
              {t(
                'SSID scanning is unavailable while the device Wi-Fi radio is in access point mode. Use manual entry for hidden networks.',
              )}
            </p>
          </FormGroup>
          <FormGroup label={t('Wi-Fi password')} fieldId="onsite-wifi-pass" className="pf-v6-u-mt-md">
            <TextInput
              id="onsite-wifi-pass"
              type="password"
              value={values.wifiPassword}
              onChange={(_e, v) => onChange({ wifiPassword: v })}
              placeholder={t('WPA2 passphrase (8–63 characters)')}
            />
          </FormGroup>
        </StackItem>
      )}

      <StackItem>
        <FormGroup label={t('VLAN ID')} fieldId="onsite-vlan">
          <TextInput
            id="onsite-vlan"
            value={values.vlanId}
            onChange={(_e, v) => onChange({ vlanId: v })}
            placeholder={t('Optional — 1–4094')}
          />
        </FormGroup>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('IPv4')}
        </Title>
        <FormGroup label={t('IPv4 mode')} fieldId="onsite-ipv4-mode">
          <Radio
            id="ipv4-auto"
            name="ipv4-mode"
            label={t('Automatic (DHCP)')}
            isChecked={values.ipv4Mode === 'auto'}
            onChange={() => onChange({ ipv4Mode: 'auto' as Ipv4Mode })}
          />
          <Radio
            id="ipv4-static"
            name="ipv4-mode"
            label={t('Static')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ipv4Mode === 'static'}
            onChange={() => onChange({ ipv4Mode: 'static' as Ipv4Mode })}
          />
          <Radio
            id="ipv4-disabled"
            name="ipv4-mode"
            label={t('Disabled')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ipv4Mode === 'disabled'}
            onChange={() => onChange({ ipv4Mode: 'disabled' as Ipv4Mode })}
          />
        </FormGroup>
        {values.ipv4Mode === 'static' && (
          <>
            <FormGroup label={t('Static IP')} isRequired fieldId="onsite-ipv4" className="pf-v6-u-mt-md">
              <TextInput
                id="onsite-ipv4"
                value={values.ipv4Address}
                onChange={(_e, v) => onChange({ ipv4Address: v })}
                placeholder="192.168.1.50/24"
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
          </>
        )}
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('IPv6')}
        </Title>
        <FormGroup label={t('IPv6 mode')} fieldId="onsite-ipv6-mode">
          <FormSelect
            id="onsite-ipv6-mode"
            value={values.ipv6Mode}
            onChange={(_e, v) => onChange({ ipv6Mode: v as Ipv6Mode })}
          >
            <FormSelectOption value="auto" label={t('Automatic')} />
            <FormSelectOption value="dhcp" label={t('DHCP')} />
            <FormSelectOption value="static" label={t('Static')} />
            <FormSelectOption value="disabled" label={t('Disabled')} />
          </FormSelect>
        </FormGroup>
        {values.ipv6Mode === 'static' && (
          <>
            <FormGroup label={t('IPv6 address')} isRequired fieldId="onsite-ipv6" className="pf-v6-u-mt-md">
              <TextInput
                id="onsite-ipv6"
                value={values.ipv6Address}
                onChange={(_e, v) => onChange({ ipv6Address: v })}
                placeholder="2001:db8::50/64"
              />
            </FormGroup>
            <FormGroup label={t('IPv6 DNS')} fieldId="onsite-ipv6-dns" className="pf-v6-u-mt-md">
              <TextInput
                id="onsite-ipv6-dns"
                value={values.ipv6Dns}
                onChange={(_e, v) => onChange({ ipv6Dns: v })}
              />
            </FormGroup>
          </>
        )}
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('HTTP proxy configuration')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
          {t(
            'Add HTTP proxies if the device must reach Flight Control through a proxy. Optional username and password are included in the proxy URL written to systemd and /etc/environment.',
          )}
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
          <StackItem>
            <FormGroup label={t('Proxy username')} fieldId="onsite-proxy-user">
              <TextInput
                id="onsite-proxy-user"
                value={values.proxyUsername}
                onChange={(_e, v) => onChange({ proxyUsername: v })}
              />
            </FormGroup>
            <FormGroup label={t('Proxy password')} fieldId="onsite-proxy-pass" className="pf-v6-u-mt-md">
              <TextInput
                id="onsite-proxy-pass"
                type="password"
                value={values.proxyPassword}
                onChange={(_e, v) => onChange({ proxyPassword: v })}
              />
            </FormGroup>
          </StackItem>
        </Stack>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('Services')}
        </Title>
        <FormGroup label={t('NTP')} fieldId="onsite-ntp-mode">
          <Radio
            id="ntp-auto"
            name="ntp-mode"
            label={t('Automatic')}
            isChecked={values.ntpMode === 'automatic'}
            onChange={() => onChange({ ntpMode: 'automatic' })}
          />
          <Radio
            id="ntp-manual"
            name="ntp-mode"
            label={t('Manual servers')}
            className="pf-v6-u-mt-sm"
            isChecked={values.ntpMode === 'manual'}
            onChange={() => onChange({ ntpMode: 'manual' })}
          />
        </FormGroup>
        {values.ntpMode === 'manual' && (
          <FormGroup label={t('NTP servers')} fieldId="onsite-ntp" className="pf-v6-u-mt-md">
            <TextInput
              id="onsite-ntp"
              value={values.ntpServer}
              onChange={(_e, v) => onChange({ ntpServer: v })}
              placeholder="pool.ntp.org"
            />
          </FormGroup>
        )}
      </StackItem>

      <StackItem>
        <Checkbox
          id="single-nic-setup"
          label={t('Production network uses the same interface as my browser connection (single-NIC)')}
          isChecked={values.singleNicSetup}
          onChange={(_e, checked) =>
            onChange({ singleNicSetup: checked, singleNicWarningAcknowledged: checked ? false : values.singleNicWarningAcknowledged })
          }
        />
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupNetworkStep;
