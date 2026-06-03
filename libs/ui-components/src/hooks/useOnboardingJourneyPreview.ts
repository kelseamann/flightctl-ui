import type { OnboardingJourneyType } from '../utils/onboardingJourney';

/** Deprecated — Cockpit-only; preview journey param no longer used. */
export const useOnboardingJourneyPreview = () => {
  const previewJourney: OnboardingJourneyType = 'cockpit';
  const setPreviewJourney = () => {};
  return { previewJourney, setPreviewJourney };
};
