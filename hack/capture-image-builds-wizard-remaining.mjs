import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  wizardOutput: 'f39f490d-18aa-47b7-a434-168eafc9ba53',
  wizardRegistration: '5b09e11d-9e4c-4af0-82ea-1949d39ae2d1',
  wizardCatalog: '5a93f53c-2f2d-4ea4-9aa7-e5e2e850eaa7',
  wizardReview: 'f8844eb1-1e2b-4f2f-91c2-37a26aa35057',
};

async function bootstrapApp(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
}

async function capturePage(page, captureId, label) {
  console.log(`Submitting ${label} (${captureId})...`);
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
  await page.waitForTimeout(1200);
  try {
    const result = await Promise.race([
      page.evaluate(
        ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
        { captureId, endpoint },
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('capture submit timeout')), 20000)),
    ]);
    console.log(`  submitted:`, result);
  } catch (err) {
    console.log(`  submit may still be processing:`, err.message);
  }
  await page.waitForTimeout(1000);
}

async function selectRepo(page, label, repoName) {
  const group = page.locator('.pf-v6-c-form__group').filter({ hasText: label }).first();
  await group.getByRole('button').first().click();
  await page.getByRole('option', { name: repoName }).click();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await bootstrapApp(page);
    await page.goto(`${BASE}/devicemanagement/imagebuilds/create`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByText('Build new image').first().waitFor({ timeout: 30000 });

    await page.getByRole('textbox', { name: 'Build name' }).fill('wireframe-build');
    await selectRepo(page, 'Source repository', 'oci-registry');
    await page.locator('[name="source.imageName"]').fill('example/base');
    await page.locator('[name="source.imageTag"]').fill('1.0');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Management-ready by default').waitFor({ timeout: 15000 });
    await selectRepo(page, 'Target repository', 'oci-registry');
    await page.locator('[name="destination.imageName"]').fill('example/output');
    await page.locator('[name="destination.imageTag"]').fill('1.0');
    await capturePage(page, captures.wizardOutput, 'Step 2 — Image output');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Early binding').waitFor({ timeout: 15000 });
    await capturePage(page, captures.wizardRegistration, 'Step 3 — Registration');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Add to the software catalog').waitFor({ timeout: 15000 });
    await page.getByRole('checkbox', { name: /Add to the software catalog/i }).uncheck();
    await capturePage(page, captures.wizardCatalog, 'Step 4 — Software Catalog');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Build image' }).waitFor({ timeout: 15000 });
    await capturePage(page, captures.wizardReview, 'Step 5 — Review');

    console.log('All wizard step captures submitted.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
