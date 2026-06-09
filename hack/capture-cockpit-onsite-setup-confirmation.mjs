import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captureSuccess = process.argv[2] || '637bb01d-a452-45ca-b2a4-5fada26b1d8a';

async function setupMockApi(page) {
  const organizations = {
    apiVersion: 'v1beta1',
    kind: 'OrganizationList',
    metadata: {},
    items: [{ apiVersion: 'v1beta1', kind: 'Organization', metadata: { name: 'default' }, spec: { displayName: 'Default Organization' } }],
  };

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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(organizations) });
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

async function expandForCapture(page) {
  await page.addStyleTag({
    content: `
      .pf-v6-c-wizard__main, .pf-v6-c-wizard__main-body, .pf-v6-c-wizard,
      .pf-v6-c-page, .fctl-cockpit-onsite-setup-page {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        max-width: none !important;
      }
    `,
  });
  const height = await page.evaluate(() =>
    Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 900)),
  );
  await page.setViewportSize({ width: 1440, height: Math.min(height + 80, 3200) });
  await page.waitForTimeout(400);
}

async function capturePage(page, captureId) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await expandForCapture(page);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await page.evaluate(
    ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
    { captureId, endpoint },
  );
  console.log(`submitted ${captureId}`);
  await page.waitForTimeout(5000);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await setupMockApi(page);
  await page.addInitScript(() => {
    window.DEV_MOCK_API = true;
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${now + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
  });
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
  await page.getByText("Let's begin onboarding your device").first().waitFor({ timeout: 30000 });

  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.waitForTimeout(400);
  }
  await page.getByRole('heading', { name: 'Service enrollment' }).waitFor({ timeout: 15000 });
  await page.locator('#onsite-fc-token').fill('mock-enrollment-token');
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: 'Start Enrollment' }).click();
  await page.getByText('Enrollment complete').first().waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Go to Devices pending approval' }).waitFor({ timeout: 30000 });
  await capturePage(page, captureSuccess);
} finally {
  await browser.close();
}
