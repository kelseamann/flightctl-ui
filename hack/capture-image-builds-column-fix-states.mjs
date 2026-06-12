import { chromium } from 'playwright';

const captureId = process.argv[2];
const state = process.argv[3];

if (!captureId || !state) {
  console.error('Usage: node hack/capture-image-builds-column-fix-states.mjs <captureId> <state>');
  console.error('States: default | failure-expanded | skipped-tooltip | export-partial-failure');
  process.exit(1);
}

const ENDPOINT = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/devicemanagement/imagebuilds?branch=image-builds-column-fix`;

async function setupMockApi(page) {
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
    await route.continue();
  });
}

async function bootstrap(page) {
  await setupMockApi(page);
  await page.addInitScript(() => {
    window.DEV_MOCK_API = true;
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${Math.floor(Date.now() / 1000) + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'image-builds-column-fix');
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.goto(WIZARD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('h1').filter({ hasText: /Image builds/i }).first().waitFor({ timeout: 60000 });
  await page.locator('table').first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function expandRow(page, buildName) {
  const row = page.locator('tr').filter({ hasText: buildName }).first();
  await row.scrollIntoViewIfNeeded();
  const expandButton = row.locator('td').nth(1).getByRole('button');
  const label = (await expandButton.getAttribute('aria-label')) ?? '';
  if (!label.includes('Collapse')) {
    await expandButton.click();
    await page.waitForTimeout(800);
  }
}

const states = {
  default: async (page) => {},

  'failure-expanded': async (page) => {
    const action = page.getByRole('button', { name: /See failure message/i }).first();
    await action.scrollIntoViewIfNeeded();
    await action.click();
    await page.waitForTimeout(800);
  },

  'skipped-tooltip': async (page) => {
    const row = page.locator('tr').filter({ hasText: 'demo-build-catalog' }).first();
    await row.scrollIntoViewIfNeeded();
    const trigger = row.locator('.rhem-export-step-skipped-trigger').first();
    await trigger.hover();
    await page.waitForSelector('.pf-v6-c-tooltip', { timeout: 10000 });
    await page.waitForTimeout(500);
  },

  'export-partial-failure': async (page) => {
    await expandRow(page, 'demo-build-export-warning');
    const isoHeading = page.getByRole('heading', { name: 'ISO' }).first();
    await isoHeading.scrollIntoViewIfNeeded();
    await isoHeading.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
  },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: state === 'export-partial-failure' ? 1400 : 900 },
});

try {
  if (!states[state]) {
    throw new Error(`Unknown state: ${state}`);
  }

  await bootstrap(page);
  await states[state](page);

  await page.addScriptTag({ url: CAPTURE_SCRIPT });
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 15000 });
  await page.evaluate(
    ({ id, endpoint }) => {
      void window.figma.captureForDesign({ captureId: id, endpoint, selector: 'body' });
    },
    { id: captureId, endpoint: ENDPOINT },
  );
  await page.waitForTimeout(30000);
  console.log(JSON.stringify({ state, captureId, submitted: true }, null, 2));
} finally {
  await browser.close();
}
