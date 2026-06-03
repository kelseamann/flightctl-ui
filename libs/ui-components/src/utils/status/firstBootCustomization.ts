import { TFunction } from 'i18next';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';

import { FirstBootCustomizationStatus } from '../firstBootCustomization';
import { StatusItem } from './common';

export const getFirstBootCustomizationStatusItems = (
  t: TFunction,
): StatusItem<FirstBootCustomizationStatus>[] => [
  {
    id: FirstBootCustomizationStatus.Awaiting,
    label: t('Awaiting onsite customization'),
    level: 'warning',
  },
  {
    id: FirstBootCustomizationStatus.InProgress,
    label: t('Customization in progress'),
    level: 'info',
  },
  {
    id: FirstBootCustomizationStatus.Complete,
    label: t('Customization complete'),
    level: 'success',
  },
  {
    id: FirstBootCustomizationStatus.Skipped,
    label: t('Customization skipped'),
    level: 'custom',
    customIcon: MinusCircleIcon,
    customColor: 'var(--pf-t--global--icon--color--status--subtle)',
  },
  {
    id: FirstBootCustomizationStatus.NotApplicable,
    label: t('Not started'),
    level: 'unknown',
  },
];
