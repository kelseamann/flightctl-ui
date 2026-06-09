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
const CONTEXT_BANNER_ID = 'figma-cockpit-context-banner';

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

async function prepareCaptureRoot(page, captureHeight) {
  await injectFullWidthWizardCaptureStyles(page, {
    rootId: CAPTURE_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: captureHeight,
    contextBannerId: CONTEXT_BANNER_ID,
    contextBannerCss:
      'padding: 12px 24px; background: #0066cc; color: #fff; font: 600 16px/1.4 RedHatText, Overpass, sans-serif; text-align: center;',
  });
  await mountWizardCaptureRoot(page, {
    rootId: CAPTURE_ROOT_ID,
    wizardSelector: '.fctl-cockpit-onsite-setup-page',
    contextBannerId: CONTEXT_BANNER_ID,
    contextBannerText: 'Happens in Cockpit',
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

async function clickNextStep(page) {
  await page.getByRole('button', { name: 'Next step' }).click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

for (const step of STEP_CAPTURES) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT } });
  try {
    await bootstrapPage(page);
    await step.prepare(page);
    await capturePage(page, step.id, step.label, step.captureHeight ?? FIGMA_WIZARD_FRAME_HEIGHT);
  } finally {
    await browser.close();
  }
}
