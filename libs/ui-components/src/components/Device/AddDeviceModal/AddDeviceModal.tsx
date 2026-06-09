import * as React from 'react';
import {
  Button,
  Divider,
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
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import LearnMoreLink from '../../common/LearnMoreLink';
import { useAppLinks } from '../../../hooks/useAppLinks';
import { UX_BRANCH_EDM_3710, UX_BRANCH_PARAM, useUxBranch } from '../../../hooks/useUxBranch';

const getOnsiteSetupUrl = (): string => {
  const params = new URLSearchParams({ [UX_BRANCH_PARAM]: UX_BRANCH_EDM_3710 });
  return `${window.location.origin}/onsite-setup?${params.toString()}`;
};

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { isFirstBootCustomizationBranch } = useUxBranch();
  const addNewDevicesLink = useAppLinks('addNewDevice');
  const onsiteSetupUrl = React.useMemo(() => getOnsiteSetupUrl(), []);

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

  return (
    <Modal variant="small" onClose={onClose} isOpen>
      <ModalHeader title={t('Add devices')} />
      <ModalBody>
        <Stack hasGutter>
          {isFirstBootCustomizationBranch ? (
            <>
              <StackItem>
                {t(
                  'Onboard the device in Cockpit before it appears in Devices pending approval. Open Device Onboarding on the device from a browser on your phone or laptop.',
                )}
              </StackItem>
              <StackItem>
                <strong>{t('Cockpit on the device')}</strong>
                <div className="pf-v6-u-mt-sm pf-v6-u-font-family-monospace pf-v6-u-color-200">
                  https://&lt;device-host&gt;/cockpit
                </div>
              </StackItem>
              <StackItem>
                {t(
                  'Ensure you have network access to Cockpit on the device before starting onboarding.',
                )}
              </StackItem>
              <StackItem>
                <Button
                  variant="link"
                  isInline
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="end"
                  onClick={openOnsiteSetup}
                >
                  {t('Open device onboarding')}
                </Button>
              </StackItem>
              <StackItem>
                <Divider />
              </StackItem>
              <StackItem>
                <Title headingLevel="h4" size="md">
                  {t('Or add devices using an OS image:')}
                </Title>
              </StackItem>
              <StackItem>
                <List component={ListComponent.ol} type={OrderType.number}>
                  {legacySteps.map((step) => (
                    <ListItem key={step}>{step}</ListItem>
                  ))}
                </List>
              </StackItem>
            </>
          ) : (
            <>
              <StackItem>{t('You can add devices following these steps:')}</StackItem>
              <StackItem>
                <List component={ListComponent.ol} type={OrderType.number}>
                  {legacySteps.map((step) => (
                    <ListItem key={step}>{step}</ListItem>
                  ))}
                </List>
              </StackItem>
            </>
          )}
          <StackItem>
            <LearnMoreLink link={addNewDevicesLink} text={t('Learn more about adding devices')} />
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={onClose}>
          {t('Close')}
        </Button>
        {isFirstBootCustomizationBranch && (
          <Button variant="primary" icon={<ExternalLinkAltIcon />} iconPosition="end" onClick={openOnsiteSetup}>
            {t('Open device onboarding')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AddDeviceModal;
