import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const WIZARD_URL = `${BASE}/onsite-setup?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  entry: 'c61782b1-422f-4f68-bc48-39bbc326a381',
  general: '62f644c5-b951-4b7a-a842-42309324f1c2',
  network: 'd442ee44-74af-40bf-9671-7be357352c79',
  enrollment: 'faf40323-54eb-4cb4-92bd-fc6aaacd00a7',
  review: '88484764-dff2-40d0-8aa4-b0d68f28e4c2',
  confirmationEnrolling: 'e963515f-4daf-47c4-8da0-dd4a9cb8dcd6',
  confirmationSuccess: '7efd6c96-4985-43c2-9930-cd651b2206c7',
};

async function setupMockApi(page) {
  const organizations = {
    apiVersion: 'v1beta1',
    kind: 'OrganizationList',
    metadata: {},
    items: [
      {
        apiVersion: 'v1beta1',
        kind: 'Organization',
        metadata: { name: 'default' },
        spec: { displayName: 'Default Organization' },
      },
    ],
  };

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
        body: JSON.stringify({
          permissions: [{ resource: '*', operations: ['*'] }],
        }),
      });
      return;
    }

    if (url.includes('/organizations')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(organizations),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], metadata: {} }),
    });
  });
}

async function bootstrapApp(page) {
  await setupMockApi(page);
  await page.addInitScript(() => {
    window.DEV_MOCK_API = true;
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('flightctl-current-organization', 'default');
    localStorage.setItem('expiration', `${now + 3600}`);
    sessionStorage.setItem('rhem-ux-branch', 'EDM-3710');
  });
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
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
  await page.waitForTimeout(3000);
}

async function goToWizardStep(page, stepName) {
  const nav = page.locator('.pf-v6-c-wizard__nav-link').filter({ hasText: stepName });
  if (await nav.count()) {
    await nav.first().click({ timeout: 15000 });
    await page.waitForTimeout(600);
    return;
  }
  throw new Error(`Wizard nav step not found: ${stepName}`);
}

async function clickNextStep(page) {
  const next = page.getByRole('button', { name: 'Next step' });
  await next.click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await bootstrapApp(page);
    await page.goto(WIZARD_URL, { waitUntil: 'load', timeout: 60000 });
    await page.getByText("Let's begin onboarding your device").first().waitFor({ timeout: 30000 });

    // Entry already captured in an earlier run.
    await clickNextStep(page);
    await page.getByRole('heading', { name: 'General information' }).waitFor({ timeout: 15000 });
    await capturePage(page, captures.general, '02 — General information');

    await goToWizardStep(page, 'Network configurations');
    await page.getByRole('heading', { name: 'Network configurations' }).waitFor({ timeout: 15000 });
    await capturePage(page, captures.network, '03 — Network configurations');

    await goToWizardStep(page, 'Service enrollment');
    await page.getByRole('heading', { name: 'Service enrollment' }).waitFor({ timeout: 15000 });
    const endpoint = page.locator('#onsite-fc-url');
    if (await endpoint.isVisible()) {
      await endpoint.fill('https://flightctl.example.com');
    }
    await capturePage(page, captures.enrollment, '04 — Service enrollment');

    await goToWizardStep(page, 'Review and enroll');
    await page.getByRole('heading', { name: 'Review and enroll' }).waitFor({ timeout: 15000 });
    await capturePage(page, captures.review, '05 — Review and enroll');

    await page.getByRole('button', { name: 'Start Enrollment' }).click();
    await page.getByText('Enrolling device').first().waitFor({ timeout: 15000 });
    await capturePage(page, captures.confirmationEnrolling, '06 — Confirmation (enrolling)');

    await page.getByText('Enrollment succeeded').first().waitFor({ timeout: 15000 });
    await capturePage(page, captures.confirmationSuccess, '07 — Confirmation (success)');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
