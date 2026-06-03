import * as React from 'react';
import {
  Button,
  ExpandableSection,
  FormGroup,
  NumberInput,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import SyncAltIcon from '@patternfly/react-icons/dist/js/icons/sync-alt-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useTranslation } from '../../../hooks/useTranslation';
import { MOCK_WIFI_NETWORKS } from '../cockpitOnsiteSetupConstants';
import { isWifiScanAvailable } from '../cockpitOnsiteSetupValidation';
import { MOCK_NETWORK_INTERFACES, isWifiInterface } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupInterfaceStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();
  const [advancedExpanded, setAdvancedExpanded] = React.useState(false);
  const showWifiFields = isWifiInterface(values.networkInterface);
  const wifiScanAvailable = isWifiScanAvailable(values);

  const selectInterface = (name: string) => {
    onChange({
      networkInterface: name,
      wifiSsid: isWifiInterface(name) ? values.wifiSsid : '',
      wifiPassword: isWifiInterface(name) ? values.wifiPassword : '',
      wifiSelectedBssid: isWifiInterface(name) ? values.wifiSelectedBssid : '',
    });
  };

  const selectWifiNetwork = (bssid: string, ssid: string, security: string) => {
    onChange({
      wifiSelectedBssid: bssid,
      wifiSsid: ssid,
      wifiSecurity: security === 'None' ? 'none' : 'wpa',
      wifiPassword: security === 'None' ? '' : values.wifiPassword,
    });
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Network interface')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t('Choose the interface used for onboarding, as in Cockpit system onboarding.')}
        </p>
      </StackItem>
      <StackItem>
        <Table variant="compact" aria-label={t('Network interfaces')}>
          <Thead>
            <Tr>
              <Th screenReaderText={t('Select')} />
              <Th>{t('Name')}</Th>
              <Th>{t('Type')}</Th>
              <Th>{t('MAC address')}</Th>
              <Th>{t('State')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {MOCK_NETWORK_INTERFACES.map((iface) => (
              <Tr key={iface.name}>
                <Td>
                  <Radio
                    id={`onsite-iface-${iface.name}`}
                    name="onsite-interface"
                    isChecked={values.networkInterface === iface.name}
                    onChange={() => selectInterface(iface.name)}
                    aria-label={iface.name}
                  />
                </Td>
                <Td dataLabel={t('Name')}>{iface.name}</Td>
                <Td dataLabel={t('Type')}>{iface.deviceType}</Td>
                <Td dataLabel={t('MAC address')}>
                  <span className="pf-v6-u-font-family-monospace">{iface.mac}</span>
                </Td>
                <Td dataLabel={t('State')}>{iface.state}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </StackItem>

      {showWifiFields && (
        <StackItem>
          <p className="pf-v6-u-font-weight-bold pf-v6-u-mb-sm">{t('Wi-Fi connection')}</p>
          {wifiScanAvailable ? (
            <>
              <div className="pf-v6-l-flex pf-v6-u-justify-content-space-between pf-v6-u-align-items-center pf-v6-u-mb-md">
                <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-0">
                  {t('Select a Wi-Fi network to connect to.')}
                </p>
                <Button variant="link" isInline icon={<SyncAltIcon />} onClick={() => undefined}>
                  {t('Rescan')}
                </Button>
              </div>
              <Table variant="compact" aria-label={t('Wi-Fi networks')}>
                <Thead>
                  <Tr>
                    <Th screenReaderText={t('Select')} />
                    <Th>{t('SSID')}</Th>
                    <Th>{t('Signal')}</Th>
                    <Th>{t('Security')}</Th>
                    <Th>{t('Channel')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {MOCK_WIFI_NETWORKS.map((network) => (
                    <Tr key={network.bssid}>
                      <Td>
                        <Radio
                          id={`wifi-${network.bssid}`}
                          name="wifi-network"
                          isChecked={values.wifiSelectedBssid === network.bssid}
                          onChange={() => selectWifiNetwork(network.bssid, network.ssid, network.security)}
                          aria-label={network.ssid}
                        />
                      </Td>
                      <Td dataLabel={t('SSID')}>{network.ssid}</Td>
                      <Td dataLabel={t('Signal')}>{`${network.strength}%`}</Td>
                      <Td dataLabel={t('Security')}>{network.security}</Td>
                      <Td dataLabel={t('Channel')}>{network.channel}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {values.wifiSelectedBssid && values.wifiSecurity !== 'none' && (
                <FormGroup label={t('Password')} fieldId="onsite-wifi-password" className="pf-v6-u-mt-md">
                  <TextInput
                    id="onsite-wifi-password"
                    type="password"
                    value={values.wifiPassword}
                    onChange={(_e, v) => onChange({ wifiPassword: v })}
                  />
                </FormGroup>
              )}
            </>
          ) : (
            <>
              <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
                {t(
                  'Wi-Fi scanning while in access point mode is unavailable on this hardware. Enter the network name manually, as Cockpit allows.',
                )}
              </p>
              <FormGroup label={t('Network name (SSID)')} isRequired fieldId="onsite-wifi-ssid">
                <TextInput
                  id="onsite-wifi-ssid"
                  value={values.wifiSsid}
                  onChange={(_e, v) => onChange({ wifiSsid: v })}
                  placeholder={t('Enter your Wi-Fi network name')}
                />
              </FormGroup>
              <FormGroup label={t('Security')} fieldId="onsite-wifi-security">
                <Radio
                  id="onsite-wifi-wpa"
                  name="wifi-security"
                  label={t('WPA/WPA2')}
                  isChecked={values.wifiSecurity === 'wpa'}
                  onChange={() => onChange({ wifiSecurity: 'wpa' })}
                  className="pf-v6-u-mb-sm"
                />
                <Radio
                  id="onsite-wifi-none"
                  name="wifi-security"
                  label={t('None')}
                  isChecked={values.wifiSecurity === 'none'}
                  onChange={() => onChange({ wifiSecurity: 'none', wifiPassword: '' })}
                  className="pf-v6-u-mb-sm"
                />
              </FormGroup>
              {values.wifiSecurity !== 'none' && (
                <FormGroup label={t('Password')} fieldId="onsite-wifi-password-manual">
                  <TextInput
                    id="onsite-wifi-password-manual"
                    type="password"
                    value={values.wifiPassword}
                    onChange={(_e, v) => onChange({ wifiPassword: v })}
                  />
                </FormGroup>
              )}
            </>
          )}
        </StackItem>
      )}

      <StackItem>
        <ExpandableSection
          toggleText={advancedExpanded ? t('Hide advanced options') : t('Show advanced options')}
          isExpanded={advancedExpanded}
          onToggle={(_event, expanded) => setAdvancedExpanded(expanded)}
        >
          <FormGroup fieldId="onsite-vlan-enable">
            <Radio
              id="onsite-vlan-enable"
              name="vlan"
              label={t('Use VLAN tagging on this interface')}
              isChecked={values.vlanEnabled}
              onChange={() => onChange({ vlanEnabled: true, vlanId: values.vlanId || '1' })}
            />
            <Radio
              id="onsite-vlan-disable"
              name="vlan"
              label={t('No VLAN')}
              isChecked={!values.vlanEnabled}
              onChange={() => onChange({ vlanEnabled: false, vlanId: '' })}
              className="pf-v6-u-mt-sm"
            />
          </FormGroup>
          {values.vlanEnabled && (
            <FormGroup label={t('VLAN ID')} isRequired fieldId="onsite-vlan-id" className="pf-v6-u-mt-md">
              <NumberInput
                value={Number(values.vlanId) || 1}
                min={1}
                max={4094}
                onMinus={() => {
                  const next = Math.max(1, (Number(values.vlanId) || 1) - 1);
                  onChange({ vlanId: String(next) });
                }}
                onPlus={() => {
                  const next = Math.min(4094, (Number(values.vlanId) || 1) + 1);
                  onChange({ vlanId: String(next) });
                }}
                onChange={(event) => onChange({ vlanId: (event.target as HTMLInputElement).value })}
              />
            </FormGroup>
          )}
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupInterfaceStep;
