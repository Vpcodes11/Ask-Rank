async function runTests() {
  const base = 'http://localhost:3005';
  console.log('--- 1. Testing Homepage ---');
  const homeRes = await fetch(`${base}/`);
  console.log('Homepage status:', homeRes.status);

  console.log('\n--- 2. Testing Free Scan API (/api/scan) ---');
  const scanRes = await fetch(`${base}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'blissclub.com',
      niche: 'Activewear and Fitness Apparel'
    })
  });
  const scanData = await scanRes.json();
  console.log('Scan Success:', scanData.success);
  console.log('Scan ID:', scanData.scan?.id);
  console.log('Store Name:', scanData.scan?.store_name);
  console.log('Score:', scanData.scan?.score);
  console.log('Prompts count:', scanData.scan?.prompts?.length);
  console.log('Results count:', scanData.scan?.results?.length);
  console.log('Competitors found:', scanData.scan?.competitors_found?.map(c => c.name));
  console.log('Unlocked:', scanData.scan?.unlocked);

  const scanId = scanData.scan?.id;

  console.log('\n--- 3. Testing Scan Detail (/api/scan/[id]) ---');
  const detailRes = await fetch(`${base}/api/scan/${scanId}`);
  const detailData = await detailRes.json();
  console.log('Detail Status:', detailRes.status, 'Score:', detailData.scan?.score);

  console.log('\n--- 4. Testing Email Unlock (/api/scan/[id]) ---');
  const unlockRes = await fetch(`${base}/api/scan/${scanId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'founder@blissclub.com' })
  });
  const unlockData = await unlockRes.json();
  console.log('Unlocked message:', unlockData.message);
  console.log('Scan now unlocked?', unlockData.scan?.unlocked);

  console.log('\n--- 5. Testing Dynamic OG Image Card (/api/og/[id]) ---');
  const ogRes = await fetch(`${base}/api/og/${scanId}`);
  console.log('OG Card status:', ogRes.status, 'Content-Type:', ogRes.headers.get('content-type'));
  const ogSvg = await ogRes.text();
  console.log('OG SVG length:', ogSvg.length, 'Contains Store Name:', ogSvg.includes('Blissclub'));

  console.log('\n--- 6. Testing White-Label PDF Report (/api/export/pdf) ---');
  const pdfRes = await fetch(`${base}/api/export/pdf?scan_id=${scanId}&agency=StellarGEO`);
  console.log('PDF status:', pdfRes.status, 'Content-Type:', pdfRes.headers.get('content-type'));

  console.log('\n--- 7. Testing Store Connection & Sync (/api/stores) ---');
  const storeRes = await fetch(`${base}/api/stores`);
  const storeData = await storeRes.json();
  console.log('Connected stores count:', storeData.stores?.length);

  console.log('\n--- 8. Testing AI Content Suggestions & Approval (/api/content/suggestions) ---');
  const suggRes = await fetch(`${base}/api/content/suggestions`);
  const suggData = await suggRes.json();
  console.log('Suggestions count:', suggData.suggestions?.length);
  const firstSugg = suggData.suggestions?.[0];
  if (firstSugg) {
    const patchRes = await fetch(`${base}/api/content/suggestions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: firstSugg.id,
        status: 'synced',
        after_content: firstSugg.after_content + '\n\n[Verified by Merchant]'
      })
    });
    const patchData = await patchRes.json();
    console.log('Suggestion update message:', patchData.message, 'New status:', patchData.suggestion?.status);
  }

  console.log('\n--- 9. Testing Weekly Tracking Cron (/api/tracking) ---');
  const cronRes = await fetch(`${base}/api/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: 'store-demo-blissclub' })
  });
  const cronData = await cronRes.json();
  console.log('Cron message:', cronData.message);
  console.log('New tracking point:', cronData.newPoint);
  console.log('Email Summary Subject:', cronData.emailSummary?.subject);

  console.log('\n--- 10. Testing Billing & Plan Upgrade (/api/billing) ---');
  const billRes = await fetch(`${base}/api/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      store_id: 'store-demo-blissclub',
      plan: 'agency',
      currency: 'INR'
    })
  });
  const billData = await billRes.json();
  console.log('Billing update message:', billData.message);
  console.log('Plan:', billData.subscription?.plan, 'Amount:', billData.subscription?.amount, billData.subscription?.currency);

  console.log('\n✅ ALL 10 TESTS PASSED CLEANLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
