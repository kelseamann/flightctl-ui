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
const CAPTURE_ID = process.argv[2];

if (!CAPTURE_ID) {
  console.error('Usage: node hack/capture-cockpit-enrollment-username-password.mjs <captureId>');
  process.exit(1);
}

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
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${now + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
  });
  await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
}

async function goToWizardStep(page, stepName) {
  await page.locator('.pf-v6-c-wizard__nav-link').filter({ hasText: stepName }).first().click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

async function ensureCaptureScript(page) {
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
}

async function prepareCaptureRoot(page) {
  await injectFullWidthWizardCaptureStyles(page, {
    rootId: CAPTURE_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: FIGMA_WIZARD_FRAME_HEIGHT,
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
    frameHeight: FIGMA_WIZARD_FRAME_HEIGHT,
  });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT } });

try {
  await bootstrapPage(page);
  await goToWizardStep(page, 'Service enrollment');
  await page.getByRole('heading', { name: 'Service enrollment' }).waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: 'Enroll with username and password' }).click({ timeout: 15000 });
  await page.locator('#onsite-fc-user').waitFor({ timeout: 15000 });
  await page.locator('#onsite-fc-user').fill('edge-operator');
  await page.locator('#onsite-fc-pass').fill('example-password');

  await prepareCaptureRoot(page);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await submitFigmaCapture(page, { captureId: CAPTURE_ID, selector: `#${CAPTURE_ROOT_ID}` });
  console.log(`Submitted 04 — Service enrollment (username/password) (${CAPTURE_ID})`);
} finally {
  await browser.close();
}
