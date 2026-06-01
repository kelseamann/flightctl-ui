import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  wizardBaseImage: '2e789e0e-5b64-461c-8ecf-91fcdbc6d11a',
  wizardOutput: '0d64c32b-4ec6-4c48-9a95-8336aced7535',
  wizardRegistration: '0d63adbb-55ad-4e3f-af42-3631224bc556',
  wizardCatalog: '07bb5aff-8051-451d-a83b-bc06451fd1f7',
  wizardReview: 'a4cea546-7bb2-4643-b25e-f2f3772cc4bd',
  detailBaseImage: '0612a44c-8259-48d1-a7ba-3407591cf94e',
  detailExports: '01d1b962-8538-42e1-8130-3a1f1736d86e',
  detailYaml: '6806131f-2bb8-4d2c-83c5-82a2ff218143',
  detailLogs: 'b3ca083f-631d-4fbd-a480-e2e7dac666de',
};

async function bootstrapApp(page) {
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
}

async function capturePage(page, captureId, label) {
  console.log(`Capturing ${label} (${captureId})...`);
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 }).catch(async () => {
    await page.addScriptTag({ url: CAPTURE_SCRIPT });
    await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 20000 });
  });
  await page.waitForTimeout(1200);
  const result = await page.evaluate(
    ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
    { captureId, endpoint },
  );
  console.log(`  done:`, result);
  await page.waitForTimeout(1500);
}

async function selectRepo(page, label, repoName) {
  const group = page.locator('.pf-v6-c-form__group').filter({ hasText: label }).first();
  await group.getByRole('button').first().click();
  await page.getByRole('option', { name: repoName }).click();
}

async function runWizardCaptures(page) {
  await page.goto(`${BASE}/devicemanagement/imagebuilds/create`, { waitUntil: 'load', timeout: 60000 });
  await page.getByText('Build new image').first().waitFor({ timeout: 30000 });

  await page.getByRole('textbox', { name: 'Build name' }).fill('wireframe-build');
  await selectRepo(page, 'Source repository', 'oci-registry');
  await page.locator('[name="source.imageName"]').fill('example/base');
  await page.locator('[name="source.imageTag"]').fill('1.0');
  await capturePage(page, captures.wizardBaseImage, 'Wizard — Base image');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Management-ready by default').waitFor({ timeout: 15000 });
  await selectRepo(page, 'Target repository', 'oci-registry');
  await page.locator('[name="destination.imageName"]').fill('example/output');
  await page.locator('[name="destination.imageTag"]').fill('1.0');
  await capturePage(page, captures.wizardOutput, 'Wizard — Image output');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Early binding').waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardRegistration, 'Wizard — Registration');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Add to the software catalog').waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardCatalog, 'Wizard — Software Catalog');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('wireframe-build').waitFor({ timeout: 15000 });
  await capturePage(page, captures.wizardReview, 'Wizard — Review');
}

async function runDetailCaptures(page) {
  const routes = [
    ['details', captures.detailBaseImage, 'Base image', 'Detail — Base image tab'],
    ['exports', captures.detailExports, 'Export images', 'Detail — Export images tab'],
    ['yaml', captures.detailYaml, 'YAML', 'Detail — YAML tab'],
    ['logs', captures.detailLogs, 'Logs', 'Detail — Logs tab'],
  ];

  for (const [path, captureId, tabTitle, label] of routes) {
    await page.goto(`${BASE}/devicemanagement/imagebuilds/demo-build-1/${path}`, { waitUntil: 'load', timeout: 60000 });
    await page.getByRole('tab', { name: tabTitle }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await capturePage(page, captureId, label);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await bootstrapApp(page);
    await runWizardCaptures(page);
    await runDetailCaptures(page);
    console.log('All captures submitted.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
