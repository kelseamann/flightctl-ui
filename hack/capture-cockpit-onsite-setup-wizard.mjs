import { chromium } from 'playwright';

import {
  FIGMA_WIZARD_FRAME_HEIGHT,
  FIGMA_WIZARD_FRAME_WIDTH,
  injectFullWidthWizardCaptureStyles,
  mountWizardCaptureRoot,
  setWizardCaptureViewport,
  submitFigmaCapture,
} from './figma-capture-wizard-full-width.mjs';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const CAPTURE_ROOT_ID = 'figma-wizard-capture-root';

const START_INDEX = Number(process.argv[2] || 0);
const CAPTURE_IDS = process.argv.slice(3).filter(Boolean);

const ALL_STEPS = [
  {
    label: '02 — Network',
    captureHeight: 2050,
    prepare: async (page) => {
      await goToWizardStep(page, 'Network');
      await page.getByText('Choose a network interface to use for onboarding').waitFor({ timeout: 15000 });
      await page.getByLabel('DHCPv4').waitFor({ timeout: 15000 });
    },
  },
  {
    label: '03 — Enrollment',
    prepare: async (page) => {
      await goToWizardStep(page, 'Enrollment');
      await page.getByRole('heading', { name: 'Enrollment' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '04 — Device labels',
    prepare: async (page) => {
      await goToWizardStep(page, 'Device labels');
      await page.getByRole('heading', { name: 'Device labels' }).waitFor({ timeout: 15000 });
    },
  },
  {
    label: '05 — Apply and enroll',
    prepare: async (page) => {
      await goToWizardStep(page, 'Enrollment');
      await page.locator('#onsite-fc-token').fill('mock-enrollment-token');
      await goToWizardStep(page, 'Device labels');
      await page.getByRole('button', { name: 'Next step' }).click();
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

async function prepareCaptureRoot(page, captureHeight) {
  await injectFullWidthWizardCaptureStyles(page, {
    rootId: CAPTURE_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: captureHeight,
  });
  if (captureHeight > FIGMA_WIZARD_FRAME_HEIGHT) {
    await page.addStyleTag({
      content: `
        .fctl-cockpit-onsite-setup-page,
        .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main,
        .fctl-cockpit-onsite-setup-page .pf-v6-c-page__main-section,
        .fctl-cockpit-onsite-setup-content,
        .fctl-cockpit-interface-shell,
        .pf-v6-c-wizard,
        .pf-v6-c-wizard__outer-wrap,
        .pf-v6-c-wizard__inner-wrap {
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
        }
        .pf-v6-c-wizard__toggle {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          width: 100% !important;
          height: auto !important;
        }
        .pf-v6-c-wizard__main {
          flex-direction: row !important;
          align-items: flex-start !important;
          height: auto !important;
        }
        .pf-v6-c-wizard__nav {
          width: 250px !important;
          min-width: 250px !important;
          max-width: 250px !important;
          flex: 0 0 250px !important;
          position: relative !important;
          height: auto !important;
          align-self: stretch !important;
        }
        .pf-v6-c-wizard__main-body {
          flex: 1 1 auto !important;
          width: auto !important;
          min-width: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }
      `,
    });
  }
  await mountWizardCaptureRoot(page, {
    rootId: CAPTURE_ROOT_ID,
    wizardSelector: '.fctl-cockpit-interface-shell',
  });
  await setWizardCaptureViewport(page, {
    rootId: CAPTURE_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: captureHeight,
  });
}

async function capturePage(page, captureId, label, captureHeight = FIGMA_WIZARD_FRAME_HEIGHT) {
  console.log(`Capturing ${label} (${captureId})...`);
  await prepareCaptureRoot(page, captureHeight);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await submitFigmaCapture(page, { captureId, selector: `#${CAPTURE_ROOT_ID}` });
  console.log(`  submitted ${label}`);
}

async function goToWizardStep(page, stepName) {
  await page.locator('.pf-v6-c-wizard__nav-link').filter({ hasText: stepName }).first().click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

for (const step of STEP_CAPTURES) {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT } });
  try {
    await bootstrapPage(page);
    await step.prepare(page);
    await capturePage(page, step.id, step.label, step.captureHeight ?? FIGMA_WIZARD_FRAME_HEIGHT);
  } finally {
    await browser.close();
  }
}
