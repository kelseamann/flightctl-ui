declare global {
  interface Window {
    DEV_MOCK_API?: boolean;
  }
}

export const isDevMockApi = (): boolean => window.DEV_MOCK_API === true;
