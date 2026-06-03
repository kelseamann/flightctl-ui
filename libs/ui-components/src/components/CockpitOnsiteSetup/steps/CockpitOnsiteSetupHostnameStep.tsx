import * as React from 'react';
import { FormGroup, Stack, StackItem, TextInput, Title } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupHostnameStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Name this device')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t('Give this device a hostname you can recognize in Flight Control.')}
        </p>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Hostname')} isRequired fieldId="onsite-hostname">
          <TextInput
            id="onsite-hostname"
            value={values.hostname}
            onChange={(_e, v) => onChange({ hostname: v })}
            placeholder="edge-node-01.example.com"
          />
        </FormGroup>
        <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mt-sm">
          {t('Use letters, numbers, and hyphens. Dots are allowed for FQDN-style names.')}
        </p>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupHostnameStep;
