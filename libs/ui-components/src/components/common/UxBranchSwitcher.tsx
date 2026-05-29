import * as React from 'react';
import { Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { UX_BRANCH_OPTIONS, UxBranch, useUxBranch } from '../../hooks/useUxBranch';

const UxBranchSwitcher = () => {
  const { t } = useTranslation();
  const { branch, setBranch } = useUxBranch();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLabel = UX_BRANCH_OPTIONS.find((option) => option.id === branch)?.label ?? branch;

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={(_event, value) => {
        setIsOpen(false);
        if (typeof value === 'string') {
          setBranch(value as UxBranch);
        }
      }}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          isFullHeight
          variant="plainText"
          aria-label={t('Switch UX branch')}
        >
          {t('Branch')}: {currentLabel}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {UX_BRANCH_OPTIONS.map((option) => (
          <DropdownItem key={option.id} value={option.id} isSelected={option.id === branch}>
            {option.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default UxBranchSwitcher;
