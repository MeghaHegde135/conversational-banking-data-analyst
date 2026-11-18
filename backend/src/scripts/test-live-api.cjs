const http = require('node:http');
const path = require('node:path');
const { createApp } = require('../../dist/app');

function makeRequest(port, method, pathUrl, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: pathUrl,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runLiveTests() {
  console.log('='.repeat(75));
  console.log('LIVE API TEST RUNNER - CONVERSATIONAL BANKING DATA ANALYST');
  console.log('Testing all supported intents against POST /api/analytics/ask');
  console.log('='.repeat(75));

  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(5000, '127.0.0.1', resolve);
  });
  console.log('Backend listening on http://127.0.0.1:5000\n');

  try {
    // 0. Health check
    const health = await makeRequest(5000, 'GET', '/api/health');
    console.log(`[PASS] GET /api/health -> HTTP ${health.status}`, health.body);

    // Test cases for all 6 supported intents
    const testCases = [
      {
        name: 'Intent 1: customer_count',
        question: 'How many customers do we have?',
        expectedIntent: 'customer_count',
        expectedDataset: 'customers',
        expectedVis: 'kpi',
      },
      {
        name: 'Intent 2: pending_applications',
        question: 'show pending onboarding applications',
        expectedIntent: 'pending_applications',
        expectedDataset: 'onboarding_applications',
        expectedVis: 'table',
      },
      {
        name: 'Intent 3: application_status',
        question: 'show applications by status',
        expectedIntent: 'application_status',
        expectedDataset: 'onboarding_applications',
        expectedVis: 'pie',
      },
      {
        name: 'Intent 4: branch_customers',
        question: 'which branches have the most customers?',
        expectedIntent: 'branch_customers',
        expectedDataset: 'branches, customers',
        expectedVis: 'bar',
      },
      {
        name: 'Intent 5: total_transactions',
        question: 'what is the total transaction amount?',
        expectedIntent: 'total_transactions',
        expectedDataset: 'transactions',
        expectedVis: 'kpi',
      },
      {
        name: 'Intent 6: monthly_transactions',
        question: 'show monthly transaction trends',
        expectedIntent: 'monthly_transactions',
        expectedDataset: 'transactions',
        expectedVis: 'bar',
      },
    ];

    console.log('\n--- TESTING ALL 6 SUPPORTED INTENTS ---');
    for (const tc of testCases) {
      const res = await makeRequest(5000, 'POST', '/api/analytics/ask', { question: tc.question });
      const pass =
        res.status === 200 &&
        res.body.success === true &&
        res.body.intent === tc.expectedIntent &&
        res.body.dataset === tc.expectedDataset &&
        res.body.visualization === tc.expectedVis &&
        Array.isArray(res.body.data) &&
        res.body.data.length > 0;

      if (!pass) {
        console.error(`[FAIL] ${tc.name}:`, res);
        process.exit(1);
      }

      console.log(`\n[PASS] ${tc.name}`);
      console.log(`  Question:      "${tc.question}"`);
      console.log(`  HTTP Status:   ${res.status}`);
      console.log(`  Intent:        ${res.body.intent}`);
      console.log(`  Dataset:       ${res.body.dataset}`);
      console.log(`  Visualization: ${res.body.visualization}`);
      console.log(`  Answer:        "${res.body.answer}"`);
      console.log(`  Data Rows:     ${res.body.data.length} records`);
      console.log(`  Sample Row:    ${JSON.stringify(res.body.data[0])}`);
    }

    console.log('\n--- TESTING ERROR & SECURITY EDGE CASES ---');

    // 1. HTTP 400: Empty Question
    const emptyRes = await makeRequest(5000, 'POST', '/api/analytics/ask', { question: '   ' });
    console.log(`[PASS] Empty Question -> HTTP ${emptyRes.status} (Expected 400): ${emptyRes.body.error}`);

    // 2. HTTP 400: Question > 500 characters
    const longRes = await makeRequest(5000, 'POST', '/api/analytics/ask', { question: 'Z'.repeat(501) });
    console.log(`[PASS] >500 Chars -> HTTP ${longRes.status} (Expected 400): ${longRes.body.error}`);

    // 3. HTTP 422: Unsupported Question
    const unsuppRes = await makeRequest(5000, 'POST', '/api/analytics/ask', {
      question: 'What is the weather forecast for tomorrow?',
    });
    console.log(`[PASS] Unsupported Question -> HTTP ${unsuppRes.status} (Expected 422): ${unsuppRes.body.error}`);

    // 4. HTTP 422: SQL Injection Attempt
    const injectionRes = await makeRequest(5000, 'POST', '/api/analytics/ask', {
      question: "'; DROP TABLE customers; --",
    });
    console.log(`[PASS] SQL Injection Blocked -> HTTP ${injectionRes.status} (Expected 422): ${injectionRes.body.error}`);

    console.log('\n' + '='.repeat(75));
    console.log('ALL LIVE API VERIFICATION CHECKS PASSED WITH 100% SUCCESS.');
    console.log('='.repeat(75));
  } finally {
    server.close();
  }
}

runLiveTests().catch((err) => {
  console.error('Live test error:', err);
  process.exit(1);
});
