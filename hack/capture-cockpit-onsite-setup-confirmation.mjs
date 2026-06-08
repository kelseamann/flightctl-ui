import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const captureSuccess = '2c1eb0f4-646e-447a-92f1-7910bfbf6093';

async function setupMockApi(page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/login/info')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: 'Kelsea Mann UXD' }) });
      return;
    }
    if (url.includes('/auth/permissions')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ permissions: [{ resource: '*', operations: ['*'] }] }) });
      return;
    }
    if (url.includes('/organizations')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{ metadata: { name: 'default' } }] }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await setupMockApi(page);
    await page.addInitScript(() => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('flightctl-current-organization', 'default');
      localStorage.setItem('expiration', `${now + 3600}`);
      sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
    });
    await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
    await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
    await page.getByText("Let's begin onboarding your device").first().waitFor({ timeout: 30000 });

    for (let i = 0; i < 4; i += 1) {
      await page.getByRole('button', { name: 'Next step' }).click();
      await page.waitForTimeout(400);
    }
    await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: 'Start Enrollment' }).click();
    await page.waitForTimeout(2500);

    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
      await page.addScriptTag({ url: CAPTURE_SCRIPT });
      await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
    });
    const endpoint = `https://mcp.figma.com/mcp/capture/${captureSuccess}/submit`;
    await page.evaluate(
      ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
      { captureId: captureSuccess, endpoint },
    );
    console.log('submitted success capture');
    await page.waitForTimeout(3000);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
