import { UX_BRANCH_EDM_3710, UX_BRANCH_PARAM } from '../../hooks/useUxBranch';

export const getDevicesPendingApprovalUrl = (): string => {
  const params = new URLSearchParams({ [UX_BRANCH_PARAM]: UX_BRANCH_EDM_3710 });
  return `/devicemanagement/devices?${params.toString()}`;
};

export const returnToDevicesPendingApproval = (devicesUrl: string, onDismiss?: () => void): void => {
  if (window.opener) {
    window.opener.location.assign(devicesUrl);
    window.close();
    return;
  }
  onDismiss?.();
};
