import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
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
import { UX_BRANCH_EDM_3710, UX_BRANCH_PARAM, useUxBranch } from '../../../hooks/useUxBranch';

const getOnsiteSetupUrl = (): string => {
  const params = new URLSearchParams({ [UX_BRANCH_PARAM]: UX_BRANCH_EDM_3710 });
  return `${window.location.origin}/onsite-setup?${params.toString()}`;
};

const OnsiteOnboardingTabContent = () => {
  const { t } = useTranslation();
  const tokenDocLink = useAppLinks('addNewDevice');

  return (
    <Stack hasGutter>
      <StackItem>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.h4}>{t('Before')}</Content>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.p}>
              {t(
                "If you need to provide the enrollment credentials for the device, you'll need an authentication token or your username and password.",
              )}
            </Content>
          </StackItem>
          <StackItem>
            <LearnMoreLink link={tokenDocLink} text={t('Where can I get my token?')} />
          </StackItem>
        </Stack>
      </StackItem>
      <StackItem>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.h4}>{t('Onsite')}</Content>
          </StackItem>
          <StackItem>
            <List component={ListComponent.ul}>
              <ListItem>{t('Log in to the device (you must know the device address).')}</ListItem>
              <ListItem>
                {t('Ensure Cockpit is enabled:')}{' '}
                <span className="pf-v6-u-font-family-monospace">sudo systemctl status cockpit.socket</span>
              </ListItem>
              <ListItem>
                {t('If Cockpit is not enabled, enable it:')}{' '}
                <span className="pf-v6-u-font-family-monospace">sudo systemctl enable --now cockpit.socket</span>
              </ListItem>
              <ListItem>
                {t('Navigate to Cockpit:')}{' '}
                <span className="pf-v6-u-font-family-monospace">&lt;device-address&gt;:9090</span>
              </ListItem>
              <ListItem>{t('Click the Onboarding tab on the left and complete the wizard.')}</ListItem>
            </List>
          </StackItem>
        </Stack>
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
        {showOnsitePrimaryAction && (
          <Button variant="primary" icon={<ExternalLinkAltIcon />} iconPosition="end" onClick={openOnsiteSetup}>
            {t('Open device onboarding')}
          </Button>
        )}
        <Button variant="link" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDeviceModal;
