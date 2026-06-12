import * as React from 'react';
import { TextInput } from '@patternfly/react-core';
import CogIcon from '@patternfly/react-icons/dist/js/icons/cog-icon';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';

import { useTranslation } from '../../hooks/useTranslation';

import './CockpitInterfaceShell.css';

export type CockpitShellNavItem = 'overview' | 'onboarding' | 'logs';

const NAV_ITEMS: { id: CockpitShellNavItem; labelKey: 'Overview' | 'Onboarding' | 'Logs' }[] = [
  { id: 'overview', labelKey: 'Overview' },
  { id: 'onboarding', labelKey: 'Onboarding' },
  { id: 'logs', labelKey: 'Logs' },
];

type CockpitInterfaceShellProps = {
  children: React.ReactNode;
  /** Root class for page-specific styling and Figma capture selectors. */
  pageClassName?: string;
  activeNavItem?: CockpitShellNavItem;
  sessionUser?: string;
};

const CockpitInterfaceShell = ({
  children,
  pageClassName,
  activeNavItem = 'onboarding',
  sessionUser = 'onboarding@cockpit-onboarding-test',
}: CockpitInterfaceShellProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNavItems = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return NAV_ITEMS;
    }
    return NAV_ITEMS.filter(({ labelKey }) => t(labelKey).toLowerCase().includes(query));
  }, [searchQuery, t]);

  return (
    <div
      className={['fctl-cockpit-interface-shell', pageClassName].filter(Boolean).join(' ')}
      data-testid="cockpit-interface-shell"
    >
      <header className="fctl-cockpit-interface-shell__topbar">
        <span className="fctl-cockpit-interface-shell__session-user">{sessionUser}</span>
        <div className="fctl-cockpit-interface-shell__topbar-actions">
          <span className="fctl-cockpit-interface-shell__topbar-action">
            <LockIcon aria-hidden />
            {t('Limited access')}
          </span>
          <span className="fctl-cockpit-interface-shell__topbar-action">
            <QuestionCircleIcon aria-hidden />
            {t('Help')}
          </span>
          <span className="fctl-cockpit-interface-shell__topbar-action">
            <CogIcon aria-hidden />
            {t('Session')}
          </span>
        </div>
      </header>
      <div className="fctl-cockpit-interface-shell__body">
        <nav className="fctl-cockpit-interface-shell__sidebar" aria-label={t('System navigation')}>
          <TextInput
            aria-label={t('Search')}
            placeholder={t('Search')}
            type="search"
            className="fctl-cockpit-interface-shell__search"
            value={searchQuery}
            onChange={(_e, value) => setSearchQuery(value)}
            data-testid="cockpit-sidebar-search"
          />
          <p className="fctl-cockpit-interface-shell__sidebar-heading">{t('System')}</p>
          <ul className="fctl-cockpit-interface-shell__nav-list">
            {filteredNavItems.map(({ id, labelKey }) => (
              <li key={id}>
                <span
                  className={
                    activeNavItem === id
                      ? 'fctl-cockpit-interface-shell__nav-item fctl-cockpit-interface-shell__nav-item--active'
                      : 'fctl-cockpit-interface-shell__nav-item'
                  }
                >
                  {t(labelKey)}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <main className="fctl-cockpit-interface-shell__main">{children}</main>
      </div>
    </div>
  );
};

export default CockpitInterfaceShell;
