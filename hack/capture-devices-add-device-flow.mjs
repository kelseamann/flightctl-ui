import { chromium } from 'playwright';

import {
  FIGMA_WIZARD_FRAME_HEIGHT,
  FIGMA_WIZARD_FRAME_WIDTH,
  submitFigmaCapture,
} from './figma-capture-wizard-full-width.mjs';

const BASE = 'http://localhost:9000';
const DEVICES_URL = `${BASE}/devicemanagement/devices?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const CAPTURE_ROOT_ID = 'figma-devices-capture-root';

const captures = {
  addDeviceModal: process.argv[2] || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  addDeviceModalOsImage: process.argv[3] || '',
  pendingApproval: process.argv[4] || 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
};

const EMPTY_ENROLLMENT_LIST = JSON.stringify({
  apiVersion: 'v1beta1',
  kind: 'EnrollmentRequestList',
  metadata: {},
  items: [],
});

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
      await route.fulfill({ status: 200, contentType: 'application/json', body: EMPTY_ENROLLMENT_LIST });
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
  await page
    .waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 15000 })
    .catch(async () => {
      await page.addScriptTag({ url: CAPTURE_SCRIPT });
      await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 15000 });
    });
}

async function prepareDevicesCaptureRoot(page) {
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
      #${CAPTURE_ROOT_ID} {
        box-sizing: border-box;
        width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        min-width: ${FIGMA_WIZARD_FRAME_WIDTH}px !important;
        height: ${FIGMA_WIZARD_FRAME_HEIGHT}px;
        min-height: ${FIGMA_WIZARD_FRAME_HEIGHT}px;
        overflow: hidden;
        background: var(--pf-t--global--background--color--secondary--default, #f0f0f0);
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

  await page.evaluate(
    ({ rootId }) => {
      document.getElementById(rootId)?.remove();
      const appRoot = document.querySelector('#primary-app-container') || document.body.firstElementChild;
      if (!appRoot) {
        throw new Error('App root not found for devices capture');
      }
      const root = document.createElement('div');
      root.id = rootId;
      const parent = appRoot.parentElement ?? document.body;
      parent.insertBefore(root, appRoot);
      root.appendChild(appRoot);
    },
    { rootId: CAPTURE_ROOT_ID },
  );

  await page.setViewportSize({ width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT });
  await page.waitForTimeout(400);
}

async function capturePage(page, captureId) {
  await prepareDevicesCaptureRoot(page);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1500);
  await submitFigmaCapture(page, { captureId, selector: `#${CAPTURE_ROOT_ID}` });
  console.log(`Submitted ${captureId}`);
}

async function withPage({ emptyEnrollmentRequests }, run) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: FIGMA_WIZARD_FRAME_WIDTH, height: FIGMA_WIZARD_FRAME_HEIGHT } });
  try {
    await setupMockApi(page, { emptyEnrollmentRequests });
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => {
      localStorage.setItem('flightctl-current-organization', 'default');
      sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
    });
    await page.goto(DEVICES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('heading', { name: 'Devices' }).first().waitFor({ timeout: 60000 });
    return await run(page);
  } finally {
    await browser.close();
  }
}

const mode = process.argv[5] || 'both-tabs';

if (mode === 'modal' || mode === 'both-tabs' || mode === 'both') {
  await withPage({ emptyEnrollmentRequests: true }, async (page) => {
    await page.getByRole('button', { name: 'Add devices' }).first().click();
    await page.getByRole('dialog').waitFor({ timeout: 30000 });
    await page.getByText('Before you go onsite', { exact: true }).waitFor({ timeout: 30000 });
    await page.getByRole('tab', { name: 'Cockpit onsite onboarding' }).waitFor({ timeout: 30000 });
    await capturePage(page, captures.addDeviceModal);
  });
}

if ((mode === 'modal-os' || mode === 'both-tabs' || mode === 'both') && captures.addDeviceModalOsImage) {
  await withPage({ emptyEnrollmentRequests: true }, async (page) => {
    await page.getByRole('button', { name: 'Add devices' }).first().click();
    await page.getByRole('dialog').waitFor({ timeout: 30000 });
    await page.getByRole('tab', { name: 'OS image enrollment' }).click();
    await page.getByText('Add devices by building and booting a Flight Control OS image:').waitFor({ timeout: 30000 });
    await capturePage(page, captures.addDeviceModalOsImage);
  });
}

if (mode === 'pending' || mode === 'both') {
  await withPage({ emptyEnrollmentRequests: false }, async (page) => {
    await page.evaluate(async () => {
      await fetch('/api/flightctl/api/v1/enrollmentrequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FlightCtl-Organization-ID': 'default',
        },
        body: '{}',
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Devices pending approval' }).waitFor({ timeout: 30000 });
    await page.getByText('warehouse-edge-07').waitFor({ timeout: 30000 });
    await capturePage(page, captures.pendingApproval);
  });
}
