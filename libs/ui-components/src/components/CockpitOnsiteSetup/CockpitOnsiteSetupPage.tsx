import * as React from 'react';
import { Bullseye, Button, Content, ContentVariants, Page, PageSection, Spinner } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Navigate } from 'react-router-dom';

import { useTranslation } from '../../hooks/useTranslation';
import { UX_BRANCH_EDM_3710_JIRA, useUxBranch } from '../../hooks/useUxBranch';
import CockpitOnsiteSetupWizard from './CockpitOnsiteSetupWizard';

import './CockpitOnsiteSetupPage.css';

const CockpitOnsiteSetupPage = () => {
  const { t } = useTranslation();
  const { isFirstBootCustomizationBranch } = useUxBranch();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isFirstBootCustomizationBranch) {
    return <Navigate to="/devicemanagement/devices" replace />;
  }

  if (dismissed) {
    return <Navigate to="/devicemanagement/devices" replace />;
  }

  return (
    <Page className="fctl-cockpit-onsite-setup-page">
      <PageSection variant="secondary" isWidthLimited>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-md pf-v6-u-color-200">
          {t(
            'UX prototype of Cockpit system onboarding (steps 1–4). Use a phone or laptop browser on the device network. RHEM reports status from step 5 onward.',
          )}
        </Content>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-lg">
          <Button
            component="a"
            variant="link"
            isInline
            href={UX_BRANCH_EDM_3710_JIRA}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            {t('EDM-3710 — track UX feedback in Jira')}
          </Button>
        </Content>
        <CockpitOnsiteSetupWizard onComplete={() => setDismissed(true)} />
      </PageSection>
    </Page>
  );
};

const CockpitOnsiteSetupPageWithSuspense = () => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <CockpitOnsiteSetupPage />
  </React.Suspense>
);

export default CockpitOnsiteSetupPageWithSuspense;
