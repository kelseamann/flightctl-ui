import * as React from 'react';
import { FormGroup, Stack, StackItem, TextArea, TextInput, Title } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const CockpitOnsiteSetupGeneralStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('General information')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t(
            'Cockpit applies the hostname to the system before enrollment. Labels help operators recognize the device in Flight Control.',
          )}
        </p>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Host name')} fieldId="onsite-hostname">
          <TextInput
            id="onsite-hostname"
            value={values.hostname}
            onChange={(_e, v) => onChange({ hostname: v })}
            placeholder="localhost"
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Labels')} fieldId="onsite-labels">
          <TextArea
            id="onsite-labels"
            value={values.labels}
            onChange={(_e, v) => onChange({ labels: v })}
            placeholder={t('key=value, one per line')}
            rows={3}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupGeneralStep;
