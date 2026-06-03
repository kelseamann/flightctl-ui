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
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import LearnMoreLink from '../../common/LearnMoreLink';
import { useAppLinks } from '../../../hooks/useAppLinks';
import { useUxBranch } from '../../../hooks/useUxBranch';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import { getOnboardingJourneySteps, RHEM_REPORTING_START_STEP } from '../../../utils/onboardingJourney';

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { isFirstBootCustomizationBranch } = useUxBranch();
  const addNewDevicesLink = useAppLinks('addNewDevice');

  const rhemSteps = isFirstBootCustomizationBranch
    ? getOnboardingJourneySteps(t).slice(RHEM_REPORTING_START_STEP - 1)
    : [];

  const legacySteps = [
    t('Request an enrollment certificate for your device'),
    t('Build a bootc OS image'),
    t('Create, sign and publish a bootable OS disk image'),
    t('Boot your device into the OS disk image'),
  ];

  return (
    <Modal variant="small" onClose={onClose} isOpen>
      <ModalHeader title={t('Add devices')} />
      <ModalBody>
        <Stack hasGutter>
          {isFirstBootCustomizationBranch ? (
            <>
              <StackItem>
                {t(
                  'Complete Cockpit system onboarding on the device in a browser (phone or laptop), then use RHEM to approve enrollment and assign a fleet.',
                )}
              </StackItem>
              <StackItem>
                <Button
                  variant="link"
                  isInline
                  component={(props) => <Link to={ROUTE.ONSITE_SETUP} {...props} />}
                >
                  {t('Open onsite setup wizard prototype')}
                </Button>
              </StackItem>
              <StackItem>
                <List component={ListComponent.ol} type={OrderType.number}>
                  {rhemSteps.map((step) => (
                    <ListItem key={step.id}>{step.label}</ListItem>
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
        <Button variant="primary" isInline onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDeviceModal;
