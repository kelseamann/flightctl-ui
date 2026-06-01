import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  table: '08b89e66-5d79-477a-8be0-cdced9ee34c8',
  wizardBaseImage: '966e2555-df81-4087-a010-312f2ebb7ce9',
  wizardOutput: 'a5d6c48f-aa67-4fe5-8619-2fc4a8715749',
  wizardRegistration: '4787d7d7-03a2-4b5b-a18e-d9e4fe5b9ebc',
  wizardCatalog: 'c841ac4b-af9b-4c51-8512-5f8ae92e83e0',
  wizardReview: 'a93dd459-9714-4aa9-8eae-93457a532d34',
  detailBaseImage: 'ad3fb971-5d5a-49d2-b5cc-02340a14710e',
  detailExports: '344bd8fd-7143-45ef-a96d-634937ab8e71',
  detailYaml: '041b4550-e30d-48b5-acaf-3cb4fb14afbc',
  detailLogs: '7019f66f-9ac5-4fa8-bd4e-5231336fde8e',
};

async function bootstrapApp(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('flightctl-current-organization', 'default');
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

async function capturePage(page, captureId) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await ensureCaptureScript(page);
  await page.waitForTimeout(1500);
  const result = await page.evaluate(
    ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
    { captureId, endpoint },
  );
  console.log(`Captured ${captureId}:`, result);
  await page.waitForTimeout(3000);
}

async function selectPfOption(page, toggleLabel, optionText) {
  const toggle = page.getByRole('button', { name: new RegExp(toggleLabel, 'i') }).first();
  await toggle.click();
  await page.getByRole('option', { name: optionText }).click();
}

async function fillWizardStep1(page) {
  await page.getByRole('textbox', { name: 'Build name' }).fill('wireframe-build');
  await selectPfOption(page, 'Source repository', 'oci-registry');
  await page.getByLabel('Image name').first().fill('example/base');
  await page.getByLabel('Image tag').first().fill('1.0');
}

async function fillWizardStep2(page) {
  await selectPfOption(page, 'Target repository', 'oci-registry');
  await page.getByLabel('Image name').last().fill('example/output');
  await page.getByLabel('Image tag').last().fill('1.0');
}

async function clickNext(page) {
  const next = page.getByRole('button', { name: 'Next' });
  await next.waitFor({ state: 'visible' });
  await next.click();
  await page.waitForTimeout(1500);
}

async function runWizardCaptures(page) {
  await page.goto(`${BASE}/devicemanagement/imagebuilds/create`, { waitUntil: 'networkidle' });
  await page.getByTestId('list-page-title').or(page.locator('h1')).filter({ hasText: 'Build new image' }).waitFor({
    timeout: 30000,
  });
  await fillWizardStep1(page);
  await capturePage(page, captures.wizardBaseImage);

  await clickNext(page);
  await page.getByText('Management-ready by default').waitFor({ timeout: 15000 });
  await fillWizardStep2(page);
  await capturePage(page, captures.wizardOutput);

  await clickNext(page);
  await page.getByText('Early binding').waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardRegistration);

  await clickNext(page);
  await page.getByRole('checkbox', { name: /Add to Software Catalog/i }).waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardCatalog);

  await clickNext(page);
  await page.getByText('Build summary').waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardReview);
}

async function runDetailCaptures(page) {
  const routes = [
    ['details', captures.detailBaseImage, 'Base image'],
    ['exports', captures.detailExports, 'Export images'],
    ['yaml', captures.detailYaml, 'YAML'],
    ['logs', captures.detailLogs, 'Logs'],
  ];

  for (const [path, captureId, tabTitle] of routes) {
    await page.goto(`${BASE}/devicemanagement/imagebuilds/demo-build-1/${path}`, { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: tabTitle }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await capturePage(page, captureId);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await bootstrapApp(page);
    await page.goto(`${BASE}/devicemanagement/imagebuilds`, { waitUntil: 'networkidle' });
    await page.getByTestId('list-page-title').waitFor({ timeout: 30000 });
    await capturePage(page, captures.table);

    await runWizardCaptures(page);
    await runDetailCaptures(page);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
