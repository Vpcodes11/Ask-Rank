const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3005';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

async function runReadinessAudit() {
  console.log('====================================================');
  console.log('🚀 ASKRANK PRODUCTION DEPLOYMENT READINESS SUITE');
  console.log('====================================================\n');

  // --- SECTION 1: PUBLIC WEB ROUTES & ASSETS ---
  console.log('--- SECTION 1: Web Routes & Page Responses ---');
  const routes = [
    { path: '/', expectedText: 'AskRank' },
    { path: '/pricing', expectedText: 'Pricing' },
    { path: '/dashboard', expectedText: 'Dashboard' },
    { path: '/dashboard/audit', expectedText: 'Audit' },
    { path: '/dashboard/content-fixer', expectedText: 'Content' },
    { path: '/dashboard/citations', expectedText: 'Citation' },
    { path: '/dashboard/monitor', expectedText: 'Tracking' },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      const text = await res.text();
      assert(res.status === 200, `Route ${r.path} returns HTTP 200`);
      assert(text.toLowerCase().includes(r.expectedText.toLowerCase()), `Route ${r.path} renders valid HTML`);
    } catch (err) {
      assert(false, `Route ${r.path} failed to load`, err.message);
    }
  }

  // --- SECTION 2: END-TO-END FREE SCAN FLOW ---
  console.log('\n--- SECTION 2: End-to-End Free Scan Flow ---');
  let scanId = '';
  let shareSlug = '';
  try {
    const scanRes = await fetch(`${BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'beminimalist.co',
        niche: 'Clean Skincare and Serums'
      })
    });
    const scanData = await scanRes.json();
    assert(scanRes.status === 200 && scanData.success, 'POST /api/scan responds with success 200');
    assert(Boolean(scanData.scan?.id), 'Scan record has unique ID');
    assert(scanData.scan?.store_name === 'Beminimalist', 'Store name properly normalized from domain');
    assert(scanData.scan?.score >= 0 && scanData.scan?.score <= 100, `AI Visibility Score within valid bounds: ${scanData.scan?.score}/100`);
    assert(scanData.scan?.prompts?.length === 10, 'Generated exactly 10 high-intent commercial buyer queries');
    assert(scanData.scan?.results?.length === 40, 'Query execution across 4 pluggable engines produced 40 runs (10x4)');
    assert(scanData.scan?.competitors_found?.length > 0, 'Extracted niche competitor brands');
    assert(scanData.scan?.top_sources?.length > 0, 'Extracted citation sources and authority tiers');
    assert(scanData.scan?.unlocked === false, 'Scan initialized as locked (teaser mode: 3 visible, 7 blurred)');

    scanId = scanData.scan?.id;
    shareSlug = scanData.scan?.share_slug;
  } catch (err) {
    assert(false, 'Free scan execution failed', err.message);
  }

  // --- SECTION 3: SCAN DETAILS & SHAREABLE OG CARD ---
  console.log('\n--- SECTION 3: Scan View & Shareable OG Card ---');
  try {
    const viewRes = await fetch(`${BASE_URL}/scan/${scanId}`);
    assert(viewRes.status === 200, `GET /scan/${scanId} loads successfully`);
    const viewHtml = await viewRes.text();
    assert(viewHtml.includes('Beminimalist'), 'Scan report page renders store name via SSR');

    // Dynamic OG Card Image
    const ogRes = await fetch(`${BASE_URL}/api/og/${scanId}`);
    assert(ogRes.status === 200, 'GET /api/og/[id] returns HTTP 200');
    assert(ogRes.headers.get('content-type')?.includes('image/svg+xml'), 'OG image Content-Type is image/svg+xml');
    const svgContent = await ogRes.text();
    assert(svgContent.startsWith('<svg') && svgContent.endsWith('</svg>'), 'OG image is valid, well-formed SVG XML');
    assert(svgContent.includes('Beminimalist'), 'OG SVG contains dynamic store title');
    assert(svgContent.includes('ASKRANK.AI'), 'OG SVG contains AskRank branding header');
  } catch (err) {
    assert(false, 'Scan view / OG card test failed', err.message);
  }

  // --- SECTION 4: EMAIL CAPTURE & REPORT UNLOCK ---
  console.log('\n--- SECTION 4: Email Capture & Report Unlock ---');
  try {
    const unlockRes = await fetch(`${BASE_URL}/api/scan/${scanId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'founder@beminimalist.co' })
    });
    const unlockData = await unlockRes.json();
    assert(unlockRes.status === 200 && unlockData.success, 'POST /api/scan/[id] successfully processes email capture');
    assert(unlockData.scan?.unlocked === true, 'Scan status transitioned to unlocked=true');
    assert(unlockData.scan?.email === 'founder@beminimalist.co', 'Captured email correctly recorded');
  } catch (err) {
    assert(false, 'Email unlock test failed', err.message);
  }

  // --- SECTION 5: WHITE-LABEL PDF REPORT EXPORT ---
  console.log('\n--- SECTION 5: White-Label PDF Export ---');
  try {
    const pdfRes = await fetch(`${BASE_URL}/api/export/pdf?scan_id=${scanId}&agency=StellarGrowth`);
    assert(pdfRes.status === 200, 'GET /api/export/pdf returns HTTP 200');
    const pdfHtml = await pdfRes.text();
    assert(pdfHtml.includes('StellarGrowth'), 'PDF includes customized white-label agency name');
    assert(pdfHtml.includes('Beminimalist'), 'PDF includes audited store name');
    assert(pdfHtml.includes('window.print()'), 'PDF provides 1-click print / save as PDF handler');
  } catch (err) {
    assert(false, 'PDF export test failed', err.message);
  }

  // --- SECTION 6: STORE CONNECT, PRODUCT SYNC & DEEP AUDIT ---
  console.log('\n--- SECTION 6: Store Connect & Deep Audit ---');
  let newStoreId = '';
  try {
    const connRes = await fetch(`${BASE_URL}/api/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopify_domain: 'gymshark-test.myshopify.com',
        store_name: 'Gymshark Activewear',
        niche: 'Athletic Gymwear'
      })
    });
    const connData = await connRes.json();
    assert(connRes.status === 200 && connData.success, 'POST /api/stores connects store and syncs products');
    assert(connData.store?.product_count > 0, `Synced ${connData.store?.product_count} products from store`);
    newStoreId = connData.store?.id;

    // Trigger re-sync & re-audit
    const syncRes = await fetch(`${BASE_URL}/api/stores/${newStoreId}/sync`, { method: 'POST' });
    const syncData = await syncRes.json();
    assert(syncRes.status === 200 && syncData.success, 'POST /api/stores/[id]/sync re-audits products');
    assert(syncData.store?.status === 'synced', 'Store status remains synced');
  } catch (err) {
    assert(false, 'Store connection / sync test failed', err.message);
  }

  // --- SECTION 7: AI CONTENT FIXER & SELLER APPROVAL WORKFLOW ---
  console.log('\n--- SECTION 7: AI Content Fixer Approval Workflow ---');
  try {
    const suggListRes = await fetch(`${BASE_URL}/api/content/suggestions?store_id=${newStoreId}`);
    const suggListData = await suggListRes.json();
    assert(suggListData.suggestions?.length > 0, 'AI generated content fix suggestions for synced products');
    const targetSugg = suggListData.suggestions[0];
    assert(targetSugg.status === 'pending', 'Initial suggestion status is pending (never auto-published)');

    // Seller approves with custom edit
    const approvedContent = targetSugg.after_content + '\n\n**Seller Note**: Certified squat-tested in lab.';
    const patchRes = await fetch(`${BASE_URL}/api/content/suggestions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetSugg.id,
        status: 'synced',
        after_content: approvedContent
      })
    });
    const patchData = await patchRes.json();
    assert(patchRes.status === 200 && patchData.success, 'PATCH /api/content/suggestions updates status to synced');
    assert(patchData.suggestion?.status === 'synced', 'Suggestion status marked as synced');
    assert(Boolean(patchData.suggestion?.approved_at), `Timestamp recorded for seller approval: ${patchData.suggestion?.approved_at}`);
    assert(patchData.suggestion?.after_content.includes('Certified squat-tested in lab'), 'Seller edits persisted in after_content');
  } catch (err) {
    assert(false, 'AI Content Fixer test failed', err.message);
  }

  // --- SECTION 8: WEEKLY TRACKING CRON & FOUNDER DIGEST ---
  console.log('\n--- SECTION 8: Weekly Tracking Cron & Digest ---');
  try {
    const trackGetRes = await fetch(`${BASE_URL}/api/tracking?store_id=store-demo-blissclub`);
    const trackGetData = await trackGetRes.json();
    assert(trackGetRes.status === 200, 'GET /api/tracking returns schedule and history');
    assert(trackGetData.history?.length >= 5, 'Historical tracking points present for trajectory chart');

    // Trigger cron run
    const cronRes = await fetch(`${BASE_URL}/api/tracking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: 'store-demo-blissclub' })
    });
    const cronData = await cronRes.json();
    assert(cronRes.status === 200 && cronData.success, 'POST /api/tracking executes cron prompt rerun');
    assert(Boolean(cronData.newPoint?.overallScore), `New score calculated: ${cronData.newPoint?.overallScore}`);
    assert(Boolean(cronData.emailSummary?.subject), `Generated email digest: "${cronData.emailSummary?.subject}"`);
  } catch (err) {
    assert(false, 'Weekly tracking test failed', err.message);
  }

  // --- SECTION 9: BILLING & CURRENCY LOCALIZATION ---
  console.log('\n--- SECTION 9: Billing & Plan Upgrades ---');
  try {
    // 1. Upgrade to Monitor plan in USD
    const usdRes = await fetch(`${BASE_URL}/api/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: 'store-demo-blissclub',
        plan: 'monitor',
        currency: 'USD'
      })
    });
    const usdData = await usdRes.json();
    assert(usdRes.status === 200 && usdData.success, 'Upgrades to Monitor plan in USD ($29)');
    assert(usdData.subscription?.amount === 29 && usdData.subscription?.currency === 'USD', 'USD price correctly set ($29)');

    // 2. Upgrade to Agency plan in INR
    const inrRes = await fetch(`${BASE_URL}/api/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: 'store-demo-blissclub',
        plan: 'agency',
        currency: 'INR'
      })
    });
    const inrData = await inrRes.json();
    assert(inrRes.status === 200 && inrData.success, 'Upgrades to Agency plan in INR (₹7,999)');
    assert(inrData.subscription?.amount === 7999 && inrData.subscription?.currency === 'INR', 'INR price correctly set (₹7,999)');
  } catch (err) {
    assert(false, 'Billing test failed', err.message);
  }

  // --- SECTION 10: EDGE CASES & ERROR RESILIENCE ---
  console.log('\n--- SECTION 10: Edge Cases & Error Resilience ---');
  try {
    // 1. Empty URL
    const emptyRes = await fetch(`${BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' })
    });
    assert(emptyRes.status === 400, 'POST /api/scan with empty URL returns HTTP 400 Bad Request');

    // 2. Non-existent scan ID
    const notFoundRes = await fetch(`${BASE_URL}/api/scan/scan-non-existent-12345`);
    assert(notFoundRes.status === 404, 'GET /api/scan/invalid-id returns HTTP 404 Not Found');

    // 3. Invalid Email on Unlock
    const badEmailRes = await fetch(`${BASE_URL}/api/scan/${scanId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    assert(badEmailRes.status === 400, 'POST /api/scan/[id] with invalid email returns HTTP 400 Bad Request');

    // 4. Invalid Billing Plan
    const badPlanRes = await fetch(`${BASE_URL}/api/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'non_existent_plan_xyz' })
    });
    assert(badPlanRes.status === 400, 'POST /api/billing with invalid plan returns HTTP 400 Bad Request');

    // 5. Invalid Suggestion Update
    const badSuggRes = await fetch(`${BASE_URL}/api/content/suggestions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'sugg-does-not-exist', status: 'approved' })
    });
    assert(badSuggRes.status === 404, 'PATCH /api/content/suggestions with non-existent ID returns HTTP 404');
  } catch (err) {
    assert(false, 'Edge cases test failed', err.message);
  }

  // --- SECTION 11: DATABASE PERSISTENCE VERIFICATION ---
  console.log('\n--- SECTION 11: Database Persistence Verification ---');
  try {
    const dbPath = path.join(process.cwd(), 'data', 'askrank.db.json');
    assert(fs.existsSync(dbPath), 'data/askrank.db.json file exists on disk');
    const rawDb = fs.readFileSync(dbPath, 'utf-8');
    const parsedDb = JSON.parse(rawDb);
    assert(Array.isArray(parsedDb.scans) && parsedDb.scans.length > 0, `Scans table contains ${parsedDb.scans.length} records`);
    assert(Array.isArray(parsedDb.stores) && parsedDb.stores.length > 0, `Stores table contains ${parsedDb.stores.length} records`);
    assert(Array.isArray(parsedDb.products) && parsedDb.products.length > 0, `Products table contains ${parsedDb.products.length} records`);
    assert(Array.isArray(parsedDb.content_suggestions) && parsedDb.content_suggestions.length > 0, `Content suggestions table contains ${parsedDb.content_suggestions.length} records`);
    assert(Array.isArray(parsedDb.subscriptions) && parsedDb.subscriptions.length > 0, `Subscriptions table contains ${parsedDb.subscriptions.length} records`);
    assert(Boolean(parsedDb.scans.find(s => s.id === scanId)), 'Newly created scan is persistently written to disk');
  } catch (err) {
    assert(false, 'Database persistence check failed', err.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 READINESS AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runReadinessAudit().catch(err => {
  console.error('Audit encountered fatal error:', err);
  process.exit(1);
});
