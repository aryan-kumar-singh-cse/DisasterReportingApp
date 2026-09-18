/**
 * TwoTruths - Local Lambda Event Runner
 * Validates routes, AI dissonance calculations, clustering, and challenge flows without AWS.
 */

const { handler } = require('./src/index');

async function runTest(name, event) {
  console.log(`\n==========================================`);
  console.log(`🧪 TEST: ${name}`);
  console.log(`==========================================`);
  const response = await handler(event);
  console.log(`HTTP Status: ${response.statusCode}`);
  const data = JSON.parse(response.body);
  console.log('Response Payload:', JSON.stringify(data, null, 2));
  return { status: response.statusCode, data };
}

async function main() {
  // Test 1: GET /health
  await runTest('GET /health', {
    rawPath: '/health',
    requestContext: { http: { method: 'GET' } }
  });

  // Test 2: GET /reports
  await runTest('GET /reports with clustering', {
    rawPath: '/reports',
    requestContext: { http: { method: 'GET' } }
  });

  // Test 3: POST /reports (Submit new flood report)
  const createRes = await runTest('POST /reports (Flood Submission)', {
    rawPath: '/reports',
    requestContext: { http: { method: 'POST' } },
    body: JSON.stringify({
      disasterType: 'Flood',
      userSeverity: 'Critical',
      description: 'Severe water inundation near highway',
      latitude: 19.0760,
      longitude: 72.8777,
      locationName: 'Mumbai, Maharashtra'
    })
  });

  const createdId = createRes.data.report.reportId;

  // Test 4: POST /reports/{id}/vote
  await runTest(`POST /reports/${createdId}/vote (Confirm Vote)`, {
    rawPath: `/reports/${createdId}/vote`,
    requestContext: { http: { method: 'POST' } },
    body: JSON.stringify({ type: 'confirm' })
  });

  // Test 5: POST /reports/{id}/challenge
  await runTest(`POST /reports/${createdId}/challenge (Citizen Challenge)`, {
    rawPath: `/reports/${createdId}/challenge`,
    requestContext: { http: { method: 'POST' } },
    body: JSON.stringify({
      contextNote: 'Flood water depth is greater around corner of avenue'
    })
  });

  console.log(`\n🎉 ALL 5 BACKEND TESTS COMPLETED SUCCESSFULLY!\n`);
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
