import * as React from 'react';

import { useAppContext } from './useAppContext';

export const UX_BRANCH_PARAM = 'branch';
export const UX_BRANCH_STORAGE_KEY = 'rhem-ux-branch';

export const UX_BRANCH_MAIN = 'main';
export const UX_BRANCH_COLUMN_FIX = 'image-builds-column-fix';

export const UX_TICKET_BRANCHES = [
  'EDM-3861',
  'EDM-3863',
  'EDM-3866',
  'EDM-3864',
  'EDM-3862',
  'EDM-3867',
  'EDM-3227',
  'EDM-1471',
] as const;

export type UxTicketBranch = (typeof UX_TICKET_BRANCHES)[number];
export type UxBranch = typeof UX_BRANCH_MAIN | typeof UX_BRANCH_COLUMN_FIX | UxTicketBranch;

const KNOWN_BRANCHES = new Set<string>([UX_BRANCH_MAIN, UX_BRANCH_COLUMN_FIX, ...UX_TICKET_BRANCHES]);

export const UX_BRANCH_OPTIONS: ReadonlyArray<{ id: UxBranch; label: string }> = [
  { id: UX_BRANCH_MAIN, label: UX_BRANCH_MAIN },
  { id: UX_BRANCH_COLUMN_FIX, label: UX_BRANCH_COLUMN_FIX },
  ...UX_TICKET_BRANCHES.map((id) => ({ id, label: id })),
];

const parseUxBranch = (value: string | null): UxBranch => {
  if (!value || value === UX_BRANCH_MAIN) {
    return UX_BRANCH_MAIN;
  }
  if (KNOWN_BRANCHES.has(value)) {
    return value as UxBranch;
  }
  return UX_BRANCH_MAIN;
};

const readStoredBranch = (): UxBranch | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.sessionStorage.getItem(UX_BRANCH_STORAGE_KEY);
  return stored ? parseUxBranch(stored) : null;
};

const writeStoredBranch = (branch: UxBranch) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (branch === UX_BRANCH_MAIN) {
    window.sessionStorage.removeItem(UX_BRANCH_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(UX_BRANCH_STORAGE_KEY, branch);
  }
};

export const useUxBranch = () => {
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const branchParam = searchParams.get(UX_BRANCH_PARAM);
  const storedBranch = readStoredBranch();
  const branch = branchParam ? parseUxBranch(branchParam) : storedBranch ?? UX_BRANCH_MAIN;

  React.useEffect(() => {
    if (branchParam || branch === UX_BRANCH_MAIN) {
      return;
    }
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set(UX_BRANCH_PARAM, branch);
        return nextParams;
      },
      { replace: true },
    );
  }, [branch, branchParam, setSearchParams]);

  const setBranch = React.useCallback(
    (nextBranch: UxBranch) => {
      writeStoredBranch(nextBranch);
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextBranch === UX_BRANCH_MAIN) {
          nextParams.delete(UX_BRANCH_PARAM);
        } else {
          nextParams.set(UX_BRANCH_PARAM, nextBranch);
        }
        return nextParams;
      });
    },
    [setSearchParams],
  );

  return {
    branch,
    setBranch,
    isColumnFixBranch: branch === UX_BRANCH_COLUMN_FIX,
  };
};
