import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const START_INDEX = Number(process.argv[2] || 0);
const CAPTURE_IDS = process.argv.slice(3).filter(Boolean);

const ALL_STEPS = [
  { label: '01 — Onboarding entry', prepare: async (page) => {
    await page.getByText("Let's begin onboarding your device").first().waitFor({ timeout: 30000 });
    await page.getByText('Device Onboarding').first().waitFor({ timeout: 30000 });
  }},
  { label: '02 — General information', prepare: async (page) => {
    await clickNextStep(page);
    await page.getByRole('heading', { name: 'General information' }).waitFor({ timeout: 15000 });
    await page.getByLabel('Host name').waitFor({ timeout: 15000 });
  }},
  { label: '03 — Network configurations', prepare: async (page) => {
    await goToWizardStep(page, 'Network configurations');
    await page.getByRole('heading', { name: 'Network configurations' }).waitFor({ timeout: 15000 });
    await page.getByText('System detected').waitFor({ timeout: 15000 });
    await page.getByLabel('Static IP').waitFor({ timeout: 15000 });
  }},
  { label: '04 — Service enrollment', prepare: async (page) => {
    await goToWizardStep(page, 'Service enrollment');
    await page.getByRole('heading', { name: 'Service enrollment' }).waitFor({ timeout: 15000 });
    const endpoint = page.locator('#onsite-fc-url');
    if (await endpoint.isVisible()) {
      await endpoint.fill('https://flightctl.example.com');
    }
    await page.getByLabel('Token').waitFor({ timeout: 15000 });
  }},
  { label: '05 — Review and enroll', prepare: async (page) => {
    await goToWizardStep(page, 'Review and enroll');
    await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
    await page.getByText('Device info').waitFor({ timeout: 15000 });
  }},
  { label: '06 — Confirmation (enrolling)', prepare: async (page) => {
    await goToWizardStep(page, 'Service enrollment');
    await page.locator('#onsite-fc-token').fill('mock-enrollment-token');
    await goToWizardStep(page, 'Review and enroll');
    await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
    await page.getByTestId('wizard-next-button').click();
    await page.waitForTimeout(1500);
  }},
];

const STEP_CAPTURES = ALL_STEPS.slice(START_INDEX)
  .map((step, index) => ({ ...step, id: CAPTURE_IDS[index] }))
  .filter((step) => step.id);

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
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
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
      .pf-v6-c-wizard__main, .pf-v6-c-wizard__main-body, .pf-v6-c-wizard__main .pf-v6-c-wizard__main-body,
      .pf-v6-c-wizard, .pf-v6-c-page, .fctl-cockpit-onsite-setup-page {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        max-width: none !important;
      }
    `,
  });
  const height = await page.evaluate(() =>
    Math.ceil(
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.querySelector('.pf-v6-c-wizard')?.scrollHeight ?? 0,
        900,
      ),
    ),
  );
  await page.setViewportSize({ width: 1440, height: Math.min(height + 80, 3200) });
  await page.waitForTimeout(400);
}

async function capturePage(page, captureId, label) {
  console.log(`Capturing ${label} (${captureId})...`);
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await expandForCapture(page);
  await ensureCaptureScript(page);
  await page.waitForTimeout(1200);
  await page.evaluate(
    ({ captureId, endpoint }) => {
      window.figma.captureForDesign({ captureId, endpoint, selector: 'body' });
    },
    { captureId, endpoint },
  );
  console.log(`  submitted ${label}`);
  await page.waitForTimeout(5000);
}

async function goToWizardStep(page, stepName) {
  const nav = page.locator('.pf-v6-c-wizard__nav-link').filter({ hasText: stepName });
  await nav.first().click({ timeout: 15000 });
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
    await capturePage(page, step.id, step.label);
  } finally {
    await browser.close();
  }
}
