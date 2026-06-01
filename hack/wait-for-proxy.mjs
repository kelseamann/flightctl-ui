const target = process.env.DEV_PROXY_TARGET || 'http://localhost:3001';
const url = `${target.replace(/\/$/, '')}/api/login/info`;
const timeoutMs = Number(process.env.DEV_PROXY_WAIT_MS || 60000);
const intervalMs = 500;
const started = Date.now();

const hint =
  process.env.DEV_MOCK_API === 'true'
    ? 'Start the mock stack with: npm run dev:mock'
    : 'Start the dev stack with: npm run dev (or npm run dev:mock for fixtures-only mode)';

async function probe() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return response.ok || response.status === 401 || response.status === 428;
  } catch {
    return false;
  }
}

while (Date.now() - started < timeoutMs) {
  if (await probe()) {
    console.log(`Dev proxy ready at ${target}`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

console.error(`Timed out waiting for dev proxy at ${target}`);
console.error(hint);
process.exit(1);
