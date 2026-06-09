import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const DEVICES_URL = `${BASE}/devicemanagement/devices?branch=EDM-3710`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const captures = {
  addDeviceModal: process.argv[2] || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  pendingApproval: process.argv[3] || 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
};

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
  await page.waitForTimeout(5000);
  return result;
}

async function withPage(run) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
    await page.goto(DEVICES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('heading', { name: 'Devices' }).first().waitFor({ timeout: 60000 });
    return await run(page);
  } finally {
    await browser.close();
  }
}

const mode = process.argv[4] || 'both';

if (mode === 'modal' || mode === 'both') {
  await withPage(async (page) => {
    await page.getByRole('button', { name: 'Add devices' }).first().click();
    await page.getByRole('dialog').waitFor({ timeout: 30000 });
    await page.getByText('Cockpit on the device', { exact: true }).waitFor({ timeout: 30000 });
    await page.getByRole('button', { name: 'Open device onboarding' }).first().waitFor({ timeout: 30000 });
    await capturePage(page, captures.addDeviceModal);
  });
}

if (mode === 'pending' || mode === 'both') {
  await withPage(async (page) => {
    await page.evaluate(async () => {
      await fetch('/api/flightctl/api/v1/enrollmentrequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FlightCtl-Organization-ID': 'default',
        },
        body: '{}',
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Devices pending approval' }).waitFor({ timeout: 30000 });
    await page.getByText('warehouse-edge-07').waitFor({ timeout: 30000 });
    await capturePage(page, captures.pendingApproval);
  });
}
