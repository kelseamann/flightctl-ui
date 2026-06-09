import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const CAPTURE_ROOT_ID = 'figma-cockpit-capture-root';
const BOTTOM_BORDER_PX = 48;

const START_INDEX = Number(process.argv[2] || 0);
const CAPTURE_IDS = process.argv.slice(3).filter(Boolean);

const ALL_STEPS = [
  {
    label: '01 — Onboarding entry',
    prepare: async (page) => {
      await page.getByText("Let's begin first-boot device onboarding").first().waitFor({ timeout: 30000 });
    },
  },
  {
    label: '02 — General information',
    prepare: async (page) => {
      await clickNextStep(page);
      await page.getByRole('heading', { name: 'General information' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '03 — Network configurations',
    captureHeight: 950,
    prepare: async (page) => {
      await goToWizardStep(page, 'Network configurations');
      await page.getByRole('heading', { name: 'Network configurations' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '04 — Service enrollment',
    prepare: async (page) => {
      await goToWizardStep(page, 'Service enrollment');
      await page.getByRole('heading', { name: 'Service enrollment' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '05 — Review and enroll',
    prepare: async (page) => {
      await goToWizardStep(page, 'Review and enroll');
      await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '06 — Confirmation (enrolling)',
    prepare: async (page) => {
      await goToWizardStep(page, 'Service enrollment');
      await page.locator('#onsite-fc-token').fill('mock-enrollment-token');
      await goToWizardStep(page, 'Review and enroll');
      await page.getByRole('button', { name: 'Apply and enroll' }).click();
      await page.getByText('Onboarding complete').first().waitFor({ timeout: 30000 });
      await page.getByRole('button', { name: 'Go to Devices pending approval' }).waitFor({ timeout: 30000 });
    },
  },
];

const STEP_CAPTURES = ALL_STEPS.slice(START_INDEX)
  .map((step, index) => ({ ...step, id: CAPTURE_IDS[index] }))
  .filter((step) => step.id);

async function setupMockApi(page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/login/info')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: 'Kelsea Mann UXD' }) });
      return;
    }
    if (url.includes('/auth/permissions')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ permissions: [{ resource: '*', operations: ['*'] }] }),
      });
      return;
    }
    if (url.includes('/organizations')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{ metadata: { name: 'default' }, spec: { displayName: 'Default Organization' } }],
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], metadata: {} }) });
  });
}

async function bootstrapPage(page) {
  await setupMockApi(page);
  await page.addInitScript(() => {
    window.DEV_MOCK_API = true;
    window.__FIGMA_CAPTURE_SLOW_ENROLLMENT = true;
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${now + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
  });
  await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
}

async function ensureCaptureScript(page) {
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
}

async function prepareCaptureRoot(page) {
  await page.addStyleTag({
    content: `
      html, body { margin: 0; padding: 0; background: var(--pf-t--global--background--color--secondary--default, #f0f0f0); }
      #${CAPTURE_ROOT_ID} {
        box-sizing: border-box;
        width: 1440px;
        height: 900px;
        min-height: 900px;
        padding-bottom: ${BOTTOM_BORDER_PX}px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
      }
      #figma-cockpit-context-banner {
        box-sizing: border-box;
        width: 100%;
        flex: 0 0 auto;
        padding: 12px 24px;
        background: #0066cc;
        color: #fff;
        font: 600 16px/1.4 RedHatText, Overpass, sans-serif;
        text-align: center;
      }
      .fctl-cockpit-onsite-setup-page {
        flex: 1 1 auto;
        width: 100% !important;
        max-width: none !important;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
      }
      .fctl-cockpit-onsite-setup-page .fctl-cockpit-onsite-setup-content {
        padding-block-start: 0 !important;
        flex: 1 1 auto;
        height: 100%;
      }
      .pf-v6-c-wizard, .pf-v6-c-wizard__main, .pf-v6-c-wizard__main-body,
      .pf-v6-c-page, .pf-v6-c-page__main, .pf-v6-c-page__main-section {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
        max-height: none !important;
      }
      .fctl-cockpit-onsite-setup-page,
      .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main,
      .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main-section,
      .fctl-cockpit-onsite-setup-content,
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard,
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__main {
        flex: 1 1 auto;
        display: flex !important;
        flex-direction: column;
        min-height: 0;
        height: 100% !important;
      }
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__main {
        flex-direction: row !important;
        align-items: stretch !important;
      }
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__nav {
        align-self: stretch !important;
        height: 100% !important;
      }
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__main-body {
        flex: 1 1 auto;
        display: flex !important;
        flex-direction: column !important;
      }
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__footer,
      .fctl-cockpit-onsite-setup-page .pf-v6-c-wizard__footer-wrapper {
        margin-top: auto !important;
      }
    `,
  });

  await page.evaluate((rootId) => {
    document.getElementById(rootId)?.remove();

    const wizardPage = document.querySelector('.fctl-cockpit-onsite-setup-page');
    if (!wizardPage) {
      throw new Error('Wizard page root not found');
    }

    const root = document.createElement('div');
    root.id = rootId;

    const banner = document.createElement('div');
    banner.id = 'figma-cockpit-context-banner';
    banner.textContent = 'Happens in Cockpit';

    const parent = wizardPage.parentElement;
    parent.insertBefore(root, wizardPage);
    root.appendChild(banner);
    root.appendChild(wizardPage);
  }, CAPTURE_ROOT_ID);
}

async function prepareMacViewport(page, captureHeight = 900) {
  await page.evaluate(({ rootId, captureHeight }) => {
    const root = document.getElementById(rootId);
    if (root) {
      root.style.height = `${captureHeight}px`;
      root.style.minHeight = `${captureHeight}px`;
    }
  }, { rootId: CAPTURE_ROOT_ID, captureHeight });
  await page.setViewportSize({ width: 1440, height: captureHeight });
  await page.waitForTimeout(400);
}

async function capturePage(page, captureId, label, captureHeight = 900) {
  console.log(`Capturing ${label} (${captureId})...`);
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await prepareCaptureRoot(page);
  await prepareMacViewport(page, captureHeight);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  page.evaluate(
    ({ captureId, endpoint, selector }) => {
      window.figma.captureForDesign({ captureId, endpoint, selector });
    },
    { captureId, endpoint, selector: `#${CAPTURE_ROOT_ID}` },
  );
  console.log(`  submitted ${label}`);
  await page.waitForTimeout(8000);
}

async function goToWizardStep(page, stepName) {
  await page.locator('.pf-v6-c-wizard__nav-link').filter({ hasText: stepName }).first().click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

async function clickNextStep(page) {
  await page.getByRole('button', { name: 'Next step' }).click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

for (const step of STEP_CAPTURES) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await bootstrapPage(page);
    await step.prepare(page);
    await capturePage(page, step.id, step.label, step.captureHeight ?? 900);
  } finally {
    await browser.close();
  }
}
