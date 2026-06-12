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
const DEVICES_URL = `${BASE}/devicemanagement/devices?branch=EDM-3710`;
const COCKPIT_SHELL_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const ADD_DEVICE_CAPTURE_ID = process.argv[2];
const COCKPIT_SHELL_CAPTURE_ID = process.argv[3];

if (!ADD_DEVICE_CAPTURE_ID || !COCKPIT_SHELL_CAPTURE_ID) {
  console.error('Usage: node hack/capture-edm3710-v2.mjs <addDeviceCaptureId> <cockpitShellCaptureId>');
  process.exit(1);
}

const ADD_DEVICE_ROOT_ID = 'figma-v2-add-device-root';
const COCKPIT_SHELL_ROOT_ID = 'figma-v2-cockpit-shell-root';

async function setupMockApi(page, { emptyEnrollmentRequests = false } = {}) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/login/info')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ username: 'Kelsea Mann UXD' }),
      });
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
    if (emptyEnrollmentRequests && url.includes('/enrollmentrequests')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ apiVersion: 'v1beta1', kind: 'EnrollmentRequestList', metadata: {}, items: [] }),
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

async function ensureCaptureScript(page) {
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
}

async function bootstrapSession(page) {
  await setupMockApi(page, { emptyEnrollmentRequests: true });
  await page.addInitScript(() => {
    window.DEV_MOCK_API = true;
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${now + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
  });
}

async function prepareAddDeviceCaptureRoot(page) {
  await page.addStyleTag({
    content: `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        min-width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        overflow: hidden !important;
        background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
      }
      #${ADD_DEVICE_ROOT_ID} {
        box-sizing: border-box;
        position: relative;
        width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        min-width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        height: ${FIGMA_WIZARD_FRAME_HEIGHT}px;
        min-height: ${FIGMA_WIZARD_FRAME_HEIGHT}px;
        overflow: visible;
        background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
      }
      #${ADD_DEVICE_ROOT_ID} .pf-v6-c-backdrop {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      #primary-app-container,
      .pf-v6-c-page,
      .pf-v6-c-page__main,
      .pf-v6-c-page__main-section,
      .pf-v6-c-page__main-body {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
        max-height: none !important;
      }
    `,
  });

  await page.evaluate(({ rootId }) => {
    document.getElementById(rootId)?.remove();
    const appRoot = document.querySelector('#primary-app-container') || document.body.firstElementChild;
    if (!appRoot) {
      throw new Error('App root not found for add device capture');
    }
    const root = document.createElement('div');
    root.id = rootId;
    const parent = appRoot.parentElement ?? document.body;
    parent.insertBefore(root, appRoot);
    root.appendChild(appRoot);
  }, { rootId: ADD_DEVICE_ROOT_ID });

  await page.setViewportSize({ width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT });
  await page.waitForTimeout(400);
}

async function moveModalIntoCaptureRoot(page) {
  await page.evaluate(({ rootId }) => {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Capture root not found: ${rootId}`);
    }
    for (const selector of ['.pf-v6-c-backdrop', '[role="dialog"]']) {
      for (const node of document.querySelectorAll(selector)) {
        if (!root.contains(node)) {
          root.appendChild(node);
        }
      }
    }
    if (!root.querySelector('[role="dialog"]')) {
      throw new Error('Add devices modal dialog not found in capture root');
    }
  }, { rootId: ADD_DEVICE_ROOT_ID });
}

async function captureAddDeviceModal(page) {
  await page.goto(DEVICES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: 'Devices' }).first().waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Add devices' }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 30000 });
  await page.getByText('Where can I get my token?').waitFor({ timeout: 30000 });
  await prepareAddDeviceCaptureRoot(page);
  await moveModalIntoCaptureRoot(page);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await submitFigmaCapture(page, { captureId: ADD_DEVICE_CAPTURE_ID, selector: `#${ADD_DEVICE_ROOT_ID}` });
  console.log(`Submitted Add devices modal (${ADD_DEVICE_CAPTURE_ID})`);
}

async function captureEmptyCockpitShell(page) {
  await page.goto(COCKPIT_SHELL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByTestId('cockpit-interface-shell').waitFor({ timeout: 30000 });
  await page.evaluate(() => {
    const main = document.querySelector('.fctl-cockpit-interface-shell__main');
    if (main) {
      main.replaceChildren();
    }
  });
  await injectFullWidthWizardCaptureStyles(page, {
    rootId: COCKPIT_SHELL_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: FIGMA_WIZARD_FRAME_HEIGHT,
  });
  await mountWizardCaptureRoot(page, {
    rootId: COCKPIT_SHELL_ROOT_ID,
    wizardSelector: '.fctl-cockpit-interface-shell',
  });
  await setWizardCaptureViewport(page, {
    rootId: COCKPIT_SHELL_ROOT_ID,
    frameWidth: FIGMA_WIZARD_FRAME_WIDTH,
    frameHeight: FIGMA_WIZARD_FRAME_HEIGHT,
  });
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await submitFigmaCapture(page, { captureId: COCKPIT_SHELL_CAPTURE_ID, selector: `#${COCKPIT_SHELL_ROOT_ID}` });
  console.log(`Submitted Cockpit shell empty (${COCKPIT_SHELL_CAPTURE_ID})`);
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT } });

try {
  await bootstrapSession(page);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await captureAddDeviceModal(page);
  await captureEmptyCockpitShell(page);
} finally {
  await browser.close();
}
