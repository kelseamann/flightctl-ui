import * as React from 'react';
import {
  Button,
  List,
  ListComponent,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  OrderType,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import LearnMoreLink from '../../common/LearnMoreLink';
import { FlightCtlApp, useAppContext } from '../../../hooks/useAppContext';
import { useAppLinks } from '../../../hooks/useAppLinks';
import {
  MOCK_DEVICE_COCKPIT_URL,
  MOCK_SETUP_ETHERNET_CIDR,
  MOCK_SETUP_WIFI_SSID,
} from '../../CockpitOnsiteSetup/cockpitOnsiteSetupConstants';
import { UX_BRANCH_EDM_3710, UX_BRANCH_PARAM, useUxBranch } from '../../../hooks/useUxBranch';

const getOnsiteSetupUrl = (): string => {
  const params = new URLSearchParams({ [UX_BRANCH_PARAM]: UX_BRANCH_EDM_3710 });
  return `${window.location.origin}/onsite-setup?${params.toString()}`;
};

const OnsiteOnboardingTabContent = () => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'For devices on unmanaged networks without DHCP, complete first-boot onboarding on the device through Cockpit before the device can submit an enrollment request to Flight Control.',
        )}
      </StackItem>
      <StackItem>
        <strong>{t('Before you go onsite')}</strong>
        <List component={ListComponent.ul} className="pf-v6-u-mt-sm">
          <ListItem>
            {t(
              'Sign in to Flight Control and copy the auth token for this device enrollment. You will paste it into the Cockpit wizard on the device — credentials are never generated onsite.',
            )}
          </ListItem>
          <ListItem>
            {t(
              'Connect your laptop or phone to the device setup network (Wi-Fi access point or wired setup interface) before opening Cockpit.',
            )}
          </ListItem>
        </List>
      </StackItem>
      <StackItem>
        <strong>{t('Setup network access on the device')}</strong>
        <List component={ListComponent.ul} className="pf-v6-u-mt-sm">
          <ListItem>
            {t('Wi-Fi access point:')}{' '}
            <span className="pf-v6-u-font-family-monospace">{MOCK_SETUP_WIFI_SSID}</span>
            {' — '}
            {t('captive portal shows device serial and MAC, then redirects to Cockpit.')}
          </ListItem>
          <ListItem>
            {t('Wired setup interface:')}{' '}
            <span className="pf-v6-u-font-family-monospace">{MOCK_SETUP_ETHERNET_CIDR}</span>
          </ListItem>
          <ListItem>
            {t('Cockpit URL (HTTP during setup):')}{' '}
            <span className="pf-v6-u-font-family-monospace">{MOCK_DEVICE_COCKPIT_URL}</span>
          </ListItem>
        </List>
      </StackItem>
    </Stack>
  );
};

const OsImageEnrollmentTabContent = ({ steps, learnMoreLink }: { steps: string[]; learnMoreLink: string }) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>{t('Add devices by building and booting a Flight Control OS image:')}</StackItem>
      <StackItem>
        <List component={ListComponent.ol} type={OrderType.number}>
          {steps.map((step) => (
            <ListItem key={step}>{step}</ListItem>
          ))}
        </List>
      </StackItem>
      <StackItem>
        <LearnMoreLink link={learnMoreLink} text={t('Learn more about adding devices')} />
      </StackItem>
    </Stack>
  );
};

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { appType } = useAppContext();
  const { isFirstBootCustomizationBranch } = useUxBranch();
  const addNewDevicesLink = useAppLinks('addNewDevice');
  const onsiteSetupUrl = React.useMemo(() => getOnsiteSetupUrl(), []);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>('onsite');
  const isStandaloneWebApp = appType === FlightCtlApp.STANDALONE;
  const useTabbedLayout = isStandaloneWebApp && isFirstBootCustomizationBranch;

  const legacySteps = [
    t('Request an enrollment certificate for your device'),
    t('Build a bootc OS image'),
    t('Create, sign and publish a bootable OS disk image'),
    t('Boot your device into the OS disk image'),
  ];

  const openOnsiteSetup = () => {
    window.open(onsiteSetupUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const showOnsitePrimaryAction = useTabbedLayout && activeTabKey === 'onsite';

  return (
    <Modal variant={useTabbedLayout ? 'large' : 'small'} onClose={onClose} isOpen>
      <ModalHeader title={t('Add devices')} />
      <ModalBody>
        {useTabbedLayout ? (
          <Tabs
            activeKey={activeTabKey}
            onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
            aria-label={t('Add devices workflows')}
          >
            <Tab eventKey="onsite" title={<TabTitleText>{t('Cockpit onsite onboarding')}</TabTitleText>}>
              <OnsiteOnboardingTabContent />
            </Tab>
            <Tab eventKey="os-image" title={<TabTitleText>{t('OS image enrollment')}</TabTitleText>}>
              <OsImageEnrollmentTabContent steps={legacySteps} learnMoreLink={addNewDevicesLink} />
            </Tab>
          </Tabs>
        ) : (
          <Stack hasGutter>
            {isFirstBootCustomizationBranch ? (
              <>
                <StackItem>
                  <OnsiteOnboardingTabContent />
                </StackItem>
                <StackItem>
                  <strong>{t('Or add devices using an OS image:')}</strong>
                  <List component={ListComponent.ol} type={OrderType.number} className="pf-v6-u-mt-sm">
                    {legacySteps.map((step) => (
                      <ListItem key={step}>{step}</ListItem>
                    ))}
                  </List>
                </StackItem>
                <StackItem>
                  <LearnMoreLink link={addNewDevicesLink} text={t('Learn more about adding devices')} />
                </StackItem>
              </>
            ) : (
              <StackItem>
                <OsImageEnrollmentTabContent steps={legacySteps} learnMoreLink={addNewDevicesLink} />
              </StackItem>
            )}
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={onClose}>
          {t('Close')}
        </Button>
        {showOnsitePrimaryAction && (
          <Button variant="primary" icon={<ExternalLinkAltIcon />} iconPosition="end" onClick={openOnsiteSetup}>
            {t('Open device onboarding')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AddDeviceModal;
