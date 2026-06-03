import { CockpitOnsiteSetupValues } from '../types';

export type CockpitOnsiteSetupStepProps = {
  values: CockpitOnsiteSetupValues;
  onChange: (patch: Partial<CockpitOnsiteSetupValues>) => void;
};
