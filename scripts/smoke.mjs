#!/usr/bin/env node
// Live check after deploying. Usage:
//   node scripts/smoke.mjs https://yourdomain.com <CRON_SECRET> yourstore.com
// 1. Shows which settings the deployment is missing (/api/health)
// 2. Runs a real free scan of the store you name and prints what each AI engine said.
// A scan uses real API credit (about $0.50-$1).

const [base, secret, store] = process.argv.slice(2);
if (!base || !secret) {
  console.error('Usage: node scripts/smoke.mjs https://yourdomain.com <CRON_SECRET> [store-to-scan.com]');
  process.exit(1);
}
const url = base.replace(/\/$/, '');

const health = await fetch(`${url}/api/health?key=${encodeURIComponent(secret)}`).then((r) => r.json());
console.log('\nSettings:');
for (const [name, c] of Object.entries(health.checks || {})) console.log(`  ${c.ok ? 'OK     ' : 'MISSING'} ${name}${c.note ? `  (${c.note})` : ''}`);
if (!health.checks) console.log('  Could not read checks. Is CRON_SECRET right?', health);
console.log(health.ready ? '\nAll settings present.' : '\nFix the MISSING items in Vercel → Settings → Environment Variables, then redeploy.');
if (!store) process.exit(health.ready ? 0 : 1);

console.log(`\nScanning ${store}… (1–3 minutes)`);
const start = await fetch(`${url}/api/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: store }) }).then((r) => r.json());
if (!start.id) {
  console.error('Could not start:', start.error || start);
  process.exit(1);
}
let scan;
for (let i = 0; i < 80; i++) {
  scan = (await fetch(`${url}/api/scan/${start.id}`).then((r) => r.json())).scan;
  if (scan.status !== 'running') break;
  process.stdout.write(`  ${scan.progress || '…'}\r`);
  await new Promise((r) => setTimeout(r, 3000));
}
if (scan.status !== 'done') {
  console.error(`\nScan ${scan.status}: ${scan.error || 'still running after 4 minutes'}. Check Vercel → Logs.`);
  process.exit(1);
}
console.log(`\n\n${scan.storeName}: ${scan.score}/100 · engines: ${scan.engines.join(', ')}`);
const failed = scan.results.filter((r) => r.error);
if (failed.length) console.log(`  ${failed.length} engine answers failed: ${[...new Set(failed.map((r) => r.engine))].join(', ')} (check that key in Vercel logs)`);
for (const r of scan.results.slice(0, 6)) {
  console.log(`\n[${r.engine}] "${r.prompt}"\n  named: ${r.mentioned}${r.position ? ` (#${r.position})` : ''} · recommends: ${r.competitors.map((c) => c.name).slice(0, 4).join(', ') || '–'}`);
  console.log(`  sources: ${r.sources.map((s) => s.domain).slice(0, 4).join(', ') || '–'}`);
  console.log(`  answer: ${r.raw_response.replace(/\s+/g, ' ').slice(0, 220)}…`);
}
console.log(`\nFull report: ${url}/scan/${scan.id}`);
