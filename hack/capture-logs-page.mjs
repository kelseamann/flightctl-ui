import { chromium } from 'playwright';

const CAPTURE_ID = process.argv[2] || 'b615621c-5d29-4258-80e6-d9169aad7499';
const ENDPOINT = `https://mcp.figma.com/mcp/capture/${CAPTURE_ID}/submit`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const BASE = 'http://localhost:9000';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1725, height: 883 } });

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
  await page.goto(`${BASE}/devicemanagement/imagebuilds/demo-build-1/logs`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.getByRole('tab', { name: 'Logs' }).waitFor({ timeout: 60000 });
  await page.locator('textarea').first().waitFor({ timeout: 60000 });
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
