import * as React from 'react';
import { Bullseye, Page, PageSection, Spinner } from '@patternfly/react-core';
import { Navigate } from 'react-router-dom';

import { useFetch } from '../../hooks/useFetch';
import { UX_BRANCH_EDM_3710, UX_BRANCH_PARAM, useUxBranch } from '../../hooks/useUxBranch';
import { isDevMockApi } from '../../utils/devMock';
import CockpitOnsiteSetupWizard from './CockpitOnsiteSetupWizard';
import { getDevicesPendingApprovalUrl, returnToDevicesPendingApproval } from './cockpitOnsiteSetupReturn';
import { CockpitOnsiteSetupValues } from './types';

import './CockpitOnsiteSetupPage.css';

const getDevicesUrl = (): string => {
  const params = new URLSearchParams({ [UX_BRANCH_PARAM]: UX_BRANCH_EDM_3710 });
  return `/devicemanagement/devices?${params.toString()}`;
};

const CockpitOnsiteSetupPage = () => {
  const { isFirstBootCustomizationBranch } = useUxBranch();
  const { post } = useFetch();
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = React.useCallback(() => {
    setDismissed(true);
  }, []);

  const handleEnrollmentSuccess = React.useCallback(
    async (_values: CockpitOnsiteSetupValues) => {
      if (isDevMockApi()) {
        try {
          await post('enrollmentrequests', {});
        } catch {
          // Prototype flow still returns to Devices if mock POST fails.
        }
      }
      returnToDevicesPendingApproval(getDevicesPendingApprovalUrl(), handleDismiss);
    },
    [handleDismiss, post],
  );

  if (!isFirstBootCustomizationBranch) {
    return <Navigate to={getDevicesUrl()} replace />;
  }

  if (dismissed) {
    return <Navigate to={getDevicesUrl()} replace />;
  }

  return (
    <Page className="fctl-cockpit-onsite-setup-page">
      <PageSection
        variant="secondary"
        hasBodyWrapper={false}
        type="wizard"
        className="fctl-cockpit-onsite-setup-content"
      >
        <CockpitOnsiteSetupWizard onCancel={handleDismiss} onEnrollmentSuccess={handleEnrollmentSuccess} />
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
