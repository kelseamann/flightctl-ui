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
import InputGroupHeading from '../../common/InputGroupHeading';
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
        <FormGroup fieldId="onsite-labels-hostname">
          <InputGroupHeading id="onsite-labels-hostname-heading" isRequired>
            {t('Hostname')}
          </InputGroupHeading>
          <TextInput
            id="onsite-labels-hostname"
            aria-labelledby="onsite-labels-hostname-heading"
            required
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
        <FormGroup fieldId="onsite-labels-alias" className="pf-v6-u-mt-md">
          <InputGroupHeading id="onsite-labels-alias-heading">{t('Alias')}</InputGroupHeading>
          <TextInput
            id="onsite-labels-alias"
            aria-labelledby="onsite-labels-alias-heading"
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
        <div className="fctl-cockpit-label-field-header-row">
          <div className="fctl-cockpit-label-field-header-row__field">
            <InputGroupHeading id="onsite-custom-label-key-heading">{t('Label key')}</InputGroupHeading>
          </div>
          <div className="fctl-cockpit-label-field-header-row__field">
            <InputGroupHeading id="onsite-custom-label-value-heading">{t('Label value')}</InputGroupHeading>
          </div>
          <div className="fctl-cockpit-label-field-header-row__remove-spacer" aria-hidden="true" />
        </div>
        {values.customLabels.map((row, index) => (
          <div key={`custom-label-${index}`} className="fctl-cockpit-label-field-row">
            <FormGroup fieldId={`onsite-custom-label-key-${index}`} className="fctl-cockpit-label-field-row__field">
              <TextInput
                id={`onsite-custom-label-key-${index}`}
                aria-labelledby="onsite-custom-label-key-heading"
                value={row.key}
                onChange={(_e, v) => updateCustomLabel(index, 'key', v)}
                placeholder={t('Type key')}
              />
            </FormGroup>
            <FormGroup fieldId={`onsite-custom-label-value-${index}`} className="fctl-cockpit-label-field-row__field">
              <TextInput
                id={`onsite-custom-label-value-${index}`}
                aria-labelledby="onsite-custom-label-value-heading"
                value={row.value}
                onChange={(_e, v) => updateCustomLabel(index, 'value', v)}
                placeholder={t('Type value')}
              />
            </FormGroup>
            <Button
              className="fctl-cockpit-label-field-row__remove"
              variant="plain"
              aria-label={t('Remove label')}
              onClick={() => removeCustomLabel(index)}
            >
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
        <div className="fctl-cockpit-label-field-header-row">
          <div className="fctl-cockpit-label-field-header-row__field">
            <InputGroupHeading id="onsite-mapping-key-heading">{t('Label key')}</InputGroupHeading>
          </div>
          <div className="fctl-cockpit-label-field-header-row__field">
            <InputGroupHeading id="onsite-mapping-field-heading">{t('System info field')}</InputGroupHeading>
          </div>
          <div className="fctl-cockpit-label-field-header-row__remove-spacer" aria-hidden="true" />
        </div>
        {values.labelMappings.map((row, index) => (
          <div key={`label-mapping-${index}`} className="fctl-cockpit-label-field-row">
            <FormGroup fieldId={`onsite-mapping-key-${index}`} className="fctl-cockpit-label-field-row__field">
              <TextInput
                id={`onsite-mapping-key-${index}`}
                aria-labelledby="onsite-mapping-key-heading"
                value={row.key}
                onChange={(_e, v) => updateMapping(index, 'key', v)}
                placeholder={t('Type key')}
              />
            </FormGroup>
            <FormGroup fieldId={`onsite-mapping-field-${index}`} className="fctl-cockpit-label-field-row__field">
              <MenuToggle
                aria-label={t('System info field')}
                aria-labelledby="onsite-mapping-field-heading"
                style={{ width: '100%' }}
              >
                {row.systemInfoField || t('Menu toggle')}
              </MenuToggle>
            </FormGroup>
            <Button
              className="fctl-cockpit-label-field-row__remove"
              variant="plain"
              aria-label={t('Remove mapping')}
              onClick={() => removeMapping(index)}
            >
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
