import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  wizardOutput: 'c5ed878d-ac69-4ec5-8eba-250feac15992',
  wizardRegistration: '73eb2996-bf59-4f45-bb0a-5299bdc918ae',
  wizardCatalog: 'a4c94e0f-fd4b-4bfa-ae1e-2fa0c99bfce2',
  wizardReview: '934e4a9f-8cfa-45d1-bf96-d97252815a55',
};

async function bootstrapApp(page) {
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
}

async function capturePage(page, captureId) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
  await page.waitForTimeout(1000);
  const result = await page.evaluate(
    ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
    { captureId, endpoint },
  );
  console.log(`Captured ${captureId}:`, result);
  await page.waitForTimeout(2000);
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
    await page.goto(`${BASE}/devicemanagement/imagebuilds/create`, { waitUntil: 'load', timeout: 60000 });
    await page.getByText('Build new image').first().waitFor({ timeout: 30000 });

    await page.getByRole('textbox', { name: 'Build name' }).fill('wireframe-build');
    await selectRepo(page, 'Source repository', 'oci-registry');
    await page.locator('#image-name input, [name="source.imageName"]').first().fill('example/base');
    await page.locator('#image-tag input, [name="source.imageTag"]').first().fill('1.0');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Management-ready by default').waitFor({ timeout: 15000 });

    await selectRepo(page, 'Target repository', 'oci-registry');
    await page.locator('[name="destination.imageName"]').fill('example/output');
    await page.locator('[name="destination.imageTag"]').fill('1.0');
    await capturePage(page, captures.wizardOutput);

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Early binding').waitFor({ timeout: 15000 });
    await capturePage(page, captures.wizardRegistration);

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Add to the software catalog').waitFor({ timeout: 15000 });
    await capturePage(page, captures.wizardCatalog);

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('wireframe-build').waitFor({ timeout: 15000 });
    await capturePage(page, captures.wizardReview);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
