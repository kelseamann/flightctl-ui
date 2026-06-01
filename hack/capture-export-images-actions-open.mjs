import { chromium } from 'playwright';

const CAPTURE_ID = process.argv[2] || '04010c3f-e941-49ce-b549-7c7a023821a3';
const ENDPOINT = `https://mcp.figma.com/mcp/capture/${CAPTURE_ID}/submit`;
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
const BASE = 'http://localhost:9000';
const DEBUG_SHOT = process.argv.includes('--debug');

async function pinMenu(page, { toggleSelector, menuMatch, hostId, minWidth = 220 }) {
  await page.evaluate(
    ({ toggleSelector, menuMatch, hostId, minWidth }) => {
      const toggle = document.querySelector(toggleSelector);
      if (!toggle) return;

      toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.add('pf-m-expanded');

      const anchor = toggle.closest('.pf-v6-l-split__item, .fctl-imageexport-card__actions, .pf-v6-c-card__actions')
        ?? toggle.parentElement;
      if (!anchor) return;

      if (document.getElementById(hostId)) return;

      const sourceMenu = [...document.querySelectorAll('.pf-v6-c-menu')].find((menu) =>
        menuMatch.every((text) => menu.textContent?.includes(text)),
      );
      if (!sourceMenu) return;

      const clone = sourceMenu.cloneNode(true);
      clone.id = hostId;
      clone.setAttribute('data-demo-pinned-menu', 'true');
      clone.style.cssText = [
        'position:absolute',
        'top:100%',
        'right:0',
        'margin-top:4px',
        'z-index:9999',
        `min-width:${minWidth}px`,
        'display:block',
        'visibility:visible',
        'opacity:1',
      ].join(';');

      anchor.style.position = 'relative';
      anchor.appendChild(clone);
    },
    { toggleSelector, menuMatch, hostId, minWidth },
  );
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1725, height: 883 } });

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('flightctl-current-organization', 'default'));
  await page.goto(`${BASE}/devicemanagement/imagebuilds/demo-build-1/exports`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Export images' }).waitFor({ timeout: 30000 });

  const isoCard = page.locator('.fctl-imageexport-card').filter({ hasText: 'ISO' });

  await page.getByRole('button', { name: 'Actions dropdown' }).click();
  await page.getByRole('menuitem', { name: 'Rebuild' }).waitFor({ timeout: 10000 });
  await pinMenu(page, {
    toggleSelector: '[aria-label="Actions dropdown"]',
    menuMatch: ['Rebuild', 'Add to catalog'],
    hostId: 'demo-header-actions-menu',
  });

  await isoCard.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('menuitem', { name: 'View logs' }).waitFor({ timeout: 10000 });
  await pinMenu(page, {
    toggleSelector: '.fctl-imageexport-card .pf-v6-c-menu-toggle',
    menuMatch: ['View logs'],
    hostId: 'demo-card-actions-menu',
    minWidth: 180,
  });
  await page.evaluate(() => {
    const toggle = document.querySelector('[aria-label="Actions dropdown"]');
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.classList.add('pf-m-expanded');

    document.querySelectorAll('.pf-v6-c-menu:not([data-demo-pinned-menu])').forEach((menu) => {
      menu.style.display = 'none';
    });
  });

  const visible = await page.evaluate(() => ({
    headerPinned: !!document.getElementById('demo-header-actions-menu'),
    cardPinned: !!document.getElementById('demo-card-actions-menu'),
    headerRect: document.getElementById('demo-header-actions-menu')?.getBoundingClientRect(),
    cardRect: document.getElementById('demo-card-actions-menu')?.getBoundingClientRect(),
  }));
  console.log('visible state:', visible);

  if (DEBUG_SHOT) {
    await page.screenshot({ path: '/tmp/export-actions-demo.png', fullPage: false });
    console.log('wrote /tmp/export-actions-demo.png');
  }

  await page.waitForTimeout(800);
  await page.addScriptTag({ url: CAPTURE_SCRIPT });
  await page.waitForFunction(() => window.figma?.captureForDesign, undefined, { timeout: 15000 });
  await Promise.race([
    page.evaluate(
      ({ captureId, endpoint }) => window.figma.captureForDesign({ captureId, endpoint, selector: 'body' }),
      { captureId: CAPTURE_ID, endpoint: ENDPOINT },
    ),
    new Promise((_, reject) => setTimeout(() => reject(new Error('capture submit timeout')), 20000)),
  ])
    .then((result) => console.log('submitted:', result))
    .catch((err) => console.log('submit note:', err.message));
} finally {
  await browser.close();
}
