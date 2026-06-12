import * as React from 'react';
import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import type { LabelKeyValue, LabelMapping } from '../types';
import type { CockpitOnsiteSetupStepProps } from './CockpitOnsiteSetupStepProps';

const updateKeyValueRow = (
  rows: LabelKeyValue[],
  index: number,
  field: keyof LabelKeyValue,
  value: string,
): LabelKeyValue[] => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));

const updateMappingRow = (
  rows: LabelMapping[],
  index: number,
  field: keyof LabelMapping,
  value: string,
): LabelMapping[] => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));

const CockpitOnsiteSetupLabelsStep = ({ values, onChange }: CockpitOnsiteSetupStepProps) => {
  const { t } = useTranslation();

  const updateCustomLabel = (index: number, field: keyof LabelKeyValue, value: string) => {
    onChange({ customLabels: updateKeyValueRow(values.customLabels, index, field, value) });
  };

  const updateMapping = (index: number, field: keyof LabelMapping, value: string) => {
    onChange({ labelMappings: updateMappingRow(values.labelMappings, index, field, value) });
  };

  const addCustomLabel = () => {
    onChange({ customLabels: [...values.customLabels, { key: '', value: '' }] });
  };

  const removeCustomLabel = (index: number) => {
    if (values.customLabels.length <= 1) {
      onChange({ customLabels: [{ key: '', value: '' }] });
      return;
    }
    onChange({ customLabels: values.customLabels.filter((_, i) => i !== index) });
  };

  const addMapping = () => {
    onChange({ labelMappings: [...values.labelMappings, { key: '', systemInfoField: '' }] });
  };

  const removeMapping = (index: number) => {
    if (values.labelMappings.length <= 1) {
      onChange({ labelMappings: [{ key: '', systemInfoField: '' }] });
      return;
    }
    onChange({ labelMappings: values.labelMappings.filter((_, i) => i !== index) });
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size="2xl">
          {t('Device labels')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-mt-sm">
          {t('Select the management services you want to enroll this device into.')}
        </p>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('Hostname and Alias')}
        </Title>
        <FormGroup label={t('Hostname')} isRequired fieldId="onsite-labels-hostname">
          <TextInput
            id="onsite-labels-hostname"
            value={values.hostname}
            onChange={(_e, v) => onChange({ hostname: v })}
            placeholder="example-endpoint-123"
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{t('The text here should help me to qualify my service endpoint')}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <FormGroup label={t('Alias')} fieldId="onsite-labels-alias" className="pf-v6-u-mt-md">
          <TextInput
            id="onsite-labels-alias"
            value={values.deviceAlias}
            onChange={(_e, v) => onChange({ deviceAlias: v })}
            placeholder="example-endpoint-123"
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{t('The text here should help me to qualify my service endpoint')}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-md">
          {t('Custom labels for fleet assignment')}
        </Title>
        {values.customLabels.map((row, index) => (
          <div
            key={`custom-label-${index}`}
            className="pf-v6-l-flex pf-v6-u-gap-md pf-v6-u-align-items-flex-end pf-v6-u-mb-md"
          >
            <FormGroup label={index === 0 ? t('Label key') : undefined} fieldId={`onsite-custom-label-key-${index}`}>
              <TextInput
                id={`onsite-custom-label-key-${index}`}
                value={row.key}
                onChange={(_e, v) => updateCustomLabel(index, 'key', v)}
                placeholder={t('Type key')}
              />
            </FormGroup>
            <FormGroup label={index === 0 ? t('Label value') : undefined} fieldId={`onsite-custom-label-value-${index}`}>
              <TextInput
                id={`onsite-custom-label-value-${index}`}
                value={row.value}
                onChange={(_e, v) => updateCustomLabel(index, 'value', v)}
                placeholder={t('Type value')}
              />
            </FormGroup>
            <Button variant="plain" aria-label={t('Remove label')} onClick={() => removeCustomLabel(index)}>
              <MinusCircleIcon />
            </Button>
          </div>
        ))}
        <Button variant="link" isInline icon={<PlusCircleIcon />} onClick={addCustomLabel}>
          {t('Add key/value pair')}
        </Button>
      </StackItem>

      <StackItem>
        <Title headingLevel="h2" size="md" className="pf-v6-u-mb-sm">
          {t('Mapping')}
        </Title>
        <p className="pf-v6-u-color-200 pf-v6-u-font-size-sm pf-v6-u-mb-md">
          {t('Automatically derive labels from device hardware and OS information')}
        </p>
        {values.labelMappings.map((row, index) => (
          <div
            key={`label-mapping-${index}`}
            className="pf-v6-l-flex pf-v6-u-gap-md pf-v6-u-align-items-flex-end pf-v6-u-mb-md"
          >
            <FormGroup label={index === 0 ? t('Label key') : undefined} fieldId={`onsite-mapping-key-${index}`}>
              <TextInput
                id={`onsite-mapping-key-${index}`}
                value={row.key}
                onChange={(_e, v) => updateMapping(index, 'key', v)}
                placeholder={t('Type key')}
              />
            </FormGroup>
            <FormGroup label={index === 0 ? t('System info field') : undefined} fieldId={`onsite-mapping-field-${index}`}>
              <MenuToggle aria-label={t('System info field')} style={{ width: '100%' }}>
                {row.systemInfoField || t('Menu toggle')}
              </MenuToggle>
            </FormGroup>
            <Button variant="plain" aria-label={t('Remove mapping')} onClick={() => removeMapping(index)}>
              <MinusCircleIcon />
            </Button>
          </div>
        ))}
        <Button variant="link" isInline icon={<PlusCircleIcon />} onClick={addMapping}>
          {t('Add mapping')}
        </Button>
      </StackItem>
    </Stack>
  );
};

export default CockpitOnsiteSetupLabelsStep;
