import { TFunction } from 'i18next';

import { Device, EnrollmentRequest } from '@flightctl/types';

import {
  FirstBootCustomizationStatus,
  getDeviceFirstBootCustomizationStatus,
  getEnrollmentFirstBootCustomizationStatus,
} from './firstBootCustomization';
import { EnrollmentRequestStatus, getApprovalStatus } from './status/enrollmentRequest';

/** @deprecated Cockpit-only flow; retained for stale imports during EDM-3710 UX work */
export type OnboardingJourneyType = 'cockpit';

export type OnboardingPhase = 'off-console' | 'in-rhem';

export type JourneyStep = {
  id: string;
  phase: OnboardingPhase;
  label: string;
};

/** First step where RHEM reports device state (1-based index in the full journey). */
export const RHEM_REPORTING_START_STEP = 5;

const cockpitOffConsoleSteps = (t: TFunction): JourneyStep[] => [
  {
    id: 'cockpit-boot',
    phase: 'off-console',
    label: t(
      'Device boots; Cockpit system onboarding starts (optional temporary Wi‑Fi access point for initial access)',
    ),
  },
  {
    id: 'cockpit-connect',
    phase: 'off-console',
    label: t('Integrator opens the device Cockpit URL in a browser and signs in with the temporary onboarding user'),
  },
  {
    id: 'cockpit-wizard',
    phase: 'off-console',
    label: t(
      'Integrator completes the setup wizard: hostname, network interface, addressing, services, and Flight Control enrollment',
    ),
  },
  {
    id: 'cockpit-complete',
    phase: 'off-console',
    label: t('Integrator applies changes; temporary onboarding access is removed and the wizard becomes inert'),
  },
];

const rhemReportingSteps = (t: TFunction): JourneyStep[] => [
  {
    id: 'rhem-online',
    phase: 'in-rhem',
    label: t('Device is online — enrollment request appears in RHEM for this organization'),
  },
  {
    id: 'rhem-review',
    phase: 'in-rhem',
    label: t('Review device identity, provisioning method, and onsite customization status'),
  },
  {
    id: 'rhem-approve',
    phase: 'in-rhem',
    label: t('Approve enrollment to register the device in Flight Control'),
  },
  {
    id: 'rhem-fleet',
    phase: 'in-rhem',
    label: t('Assign the device to a fleet and manage OS configuration and applications from RHEM'),
  },
];

export const getOnboardingJourneySteps = (t: TFunction): JourneyStep[] => [
  ...cockpitOffConsoleSteps(t),
  ...rhemReportingSteps(t),
];

export const getProvisioningSourceLabel = (t: TFunction): string => t('Cockpit system onboarding');

export const getActiveJourneyStepIndex = (enrollmentRequest: EnrollmentRequest): number => {
  const customization = getEnrollmentFirstBootCustomizationStatus(enrollmentRequest);
  const approval = getApprovalStatus(enrollmentRequest);

  if (approval === EnrollmentRequestStatus.Approved) {
    return 8;
  }
  if (approval === EnrollmentRequestStatus.Denied) {
    return 7;
  }

  switch (customization) {
    case FirstBootCustomizationStatus.Awaiting:
    case FirstBootCustomizationStatus.InProgress:
      return 6;
    case FirstBootCustomizationStatus.Complete:
    case FirstBootCustomizationStatus.Skipped:
      return 7;
    case FirstBootCustomizationStatus.NotApplicable:
    default:
      return 5;
  }
};

export const getActiveJourneyStepIndexForDevice = (device: Device): number => {
  const customization = getDeviceFirstBootCustomizationStatus(device);
  if (customization === FirstBootCustomizationStatus.Complete || customization === FirstBootCustomizationStatus.Skipped) {
    return 8;
  }
  return 7;
};

export const getJourneyStepHelperText = (
  t: TFunction,
  stepIndex: number,
  activeStepIndex: number,
): string | undefined => {
  if (stepIndex !== activeStepIndex) {
    return undefined;
  }
  if (stepIndex < RHEM_REPORTING_START_STEP) {
    return t('Happens on the device in the Cockpit system onboarding wizard — RHEM is not involved yet.');
  }
  if (stepIndex === 5) {
    return t('RHEM begins reporting once the agent submits an enrollment request.');
  }
  if (stepIndex === 6) {
    return t(
      'RHEM reflects customization progress reported by the device. Approve only after customization is complete or intentionally skipped.',
    );
  }
  if (stepIndex === 7) {
    return t('Your action in RHEM — the device cannot join a fleet until enrollment is approved.');
  }
  return t('Ongoing management in RHEM after the device is enrolled.');
};
