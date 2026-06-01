import { chromium } from 'playwright';

const CAPTURE_ID = process.argv[2];
if (!CAPTURE_ID) {
  console.error('Usage: node hack/capture-image-builds-table-column-fix.mjs <captureId>');
  process.exit(1);
}

const ENDPOINT = `https://mcp.figma.com/mcp/capture/${CAPTURE_ID}/submit`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const BASE = 'http://localhost:9000';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem('flightctl-current-organization', 'default');
    sessionStorage.setItem('rhem-ux-branch', 'image-builds-column-fix');
  });
  await page.goto(`${BASE}/devicemanagement/imagebuilds?branch=image-builds-column-fix`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.locator('h1').filter({ hasText: /Image builds/i }).first().waitFor({ timeout: 60000 });
  await page.locator('table').first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.addScriptTag({ url: CAPTURE_SCRIPT });
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 15000 });
  const result = await page.evaluate(
    ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
    { captureId: CAPTURE_ID, endpoint: ENDPOINT },
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
