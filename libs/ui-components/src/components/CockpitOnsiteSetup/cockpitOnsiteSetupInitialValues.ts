import { getDevMockCockpitOnsiteSetupInitialValues } from '../../utils/devMockWizardDefaults';
import { isDevMockApi } from '../../utils/devMock';
import { CockpitOnsiteSetupValues, defaultCockpitOnsiteSetupValues } from './types';

export const getCockpitOnsiteSetupInitialValues = (): CockpitOnsiteSetupValues => {
  if (isDevMockApi()) {
    return getDevMockCockpitOnsiteSetupInitialValues();
  }
  return { ...defaultCockpitOnsiteSetupValues };
};
