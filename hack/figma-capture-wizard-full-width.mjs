/** Shared helpers for Figma html-to-design captures of PatternFly wizards at full frame width. */

export const FIGMA_WIZARD_FRAME_WIDTH = 1440;
export const FIGMA_WIZARD_FRAME_HEIGHT = 900;
export const FIGMA_WIZARD_BOTTOM_BORDER_PX = 48;

/**
 * CSS injected before capture so the wizard spans the entire 1440px frame edge-to-edge.
 * Use with a fixed-width capture root (#figma-wizard-capture-root) at FIGMA_WIZARD_FRAME_WIDTH.
 */
export function getFullWidthWizardCaptureCss({
  rootId = 'figma-wizard-capture-root',
  frameWidth = FIGMA_WIZARD_FRAME_WIDTH,
  frameHeight = FIGMA_WIZARD_FRAME_HEIGHT,
  bottomBorderPx = FIGMA_WIZARD_BOTTOM_BORDER_PX,
  contextBannerId,
  contextBannerCss,
} = {}) {
  const bannerBlock = contextBannerId
    ? `
      #${contextBannerId} {
        box-sizing: border-box;
        width: 100%;
        flex: 0 0 auto;
        ${contextBannerCss || ''}
      }
    `
    : '';

  return `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${frameWidth}px !important;
      min-width: ${frameWidth}px !important;
      overflow: visible !important;
      background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
    }
    #${rootId} {
      box-sizing: border-box;
      width: ${frameWidth}px !important;
      min-width: ${frameWidth}px !important;
      height: ${frameHeight}px;
      min-height: ${frameHeight}px;
      padding-bottom: ${bottomBorderPx}px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
    }
    ${bannerBlock}
    #primary-app-container,
    .pf-v6-c-page,
    .pf-v6-c-page__main,
    .pf-v6-c-page__main-section,
    .pf-v6-c-page__main-body,
    .pf-v6-c-wizard,
    .pf-v6-c-wizard__outer-wrap,
    .pf-v6-c-wizard__inner-wrap,
    .pf-v6-c-wizard__main,
    .pf-v6-c-wizard__main-body,
    .pf-v6-c-wizard__nav,
    .pf-v6-c-wizard__footer,
    .pf-v6-c-wizard__footer-wrapper,
    .fctl-cockpit-onsite-setup-page,
    .fctl-cockpit-onsite-setup-content {
      width: 100% !important;
      max-width: none !important;
      min-width: 0;
      margin-left: 0 !important;
      margin-right: 0 !important;
      overflow: visible !important;
      max-height: none !important;
    }
    .pf-v6-c-wizard__main {
      flex-direction: row !important;
      align-items: stretch !important;
      flex: 1 1 auto !important;
      display: flex !important;
    }
    .pf-v6-c-wizard__nav {
      align-self: stretch !important;
      height: 100% !important;
      flex-shrink: 0;
    }
    .pf-v6-c-wizard__main-body {
      flex: 1 1 auto !important;
      display: flex !important;
      flex-direction: column !important;
    }
    .pf-v6-c-wizard__footer,
    .pf-v6-c-wizard__footer-wrapper {
      margin-top: auto !important;
      width: 100% !important;
    }
    .fctl-cockpit-onsite-setup-page,
    .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main,
    .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main-section,
    .fctl-cockpit-onsite-setup-content,
    .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard {
      flex: 1 1 auto;
      display: flex !important;
      flex-direction: column;
      min-height: 0;
      height: 100% !important;
    }
  `;
}

export async function setWizardCaptureViewport(page, {
  rootId = 'figma-wizard-capture-root',
  frameWidth = FIGMA_WIZARD_FRAME_WIDTH,
  frameHeight = FIGMA_WIZARD_FRAME_HEIGHT,
} = {}) {
  await page.evaluate(
    ({ rootId, frameWidth, frameHeight }) => {
      const root = document.getElementById(rootId);
      if (root) {
        root.style.width = `${frameWidth}px`;
        root.style.minWidth = `${frameWidth}px`;
        root.style.height = `${frameHeight}px`;
        root.style.minHeight = `${frameHeight}px`;
      }
    },
    { rootId, frameWidth, frameHeight },
  );
  await page.setViewportSize({ width: frameWidth, height: frameHeight });
  await page.waitForTimeout(400);
}

/**
 * Wrap wizardPageElement inside a fixed-width capture root for Figma submit.
 */
export async function mountWizardCaptureRoot(page, {
  rootId = 'figma-wizard-capture-root',
  wizardSelector = '.fctl-cockpit-onsite-setup-page',
  contextBannerId,
  contextBannerText,
  contextBannerCss = 'padding: 12px 24px; background: #0066cc; color: #fff; font: 600 16px/1.4 RedHatText, Overpass, sans-serif; text-align: center;',
} = {}) {
  await page.evaluate(
    ({ rootId, wizardSelector, contextBannerId, contextBannerText, contextBannerCss }) => {
      document.getElementById(rootId)?.remove();

      const wizardPage = document.querySelector(wizardSelector);
      if (!wizardPage) {
        throw new Error(`Wizard page root not found: ${wizardSelector}`);
      }

      const root = document.createElement('div');
      root.id = rootId;

      if (contextBannerId && contextBannerText) {
        const banner = document.createElement('div');
        banner.id = contextBannerId;
        banner.textContent = contextBannerText;
        banner.setAttribute('style', contextBannerCss.replace(/\n/g, ' '));
        root.appendChild(banner);
      }

      const parent = wizardPage.parentElement;
      parent.insertBefore(root, wizardPage);
      root.appendChild(wizardPage);
    },
    { rootId, wizardSelector, contextBannerId, contextBannerText, contextBannerCss },
  );
}

export async function injectFullWidthWizardCaptureStyles(page, options) {
  await page.addStyleTag({ content: getFullWidthWizardCaptureCss(options) });
}

export async function submitFigmaCapture(page, { captureId, selector }) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  void page.evaluate(
    ({ captureId, endpoint, selector }) => {
      window.figma.captureForDesign({ captureId, endpoint, selector });
    },
    { captureId, endpoint, selector },
  );
  await page.waitForTimeout(5000);
}
