const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, text: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function verifyIntegration() {
  console.log('='.repeat(75));
  console.log('CONVERSATIONAL BANKING DATA ANALYST - FE / BE INTEGRATION VERIFICATION');
  console.log('='.repeat(75));

  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.resolve(rootDir, 'backend');
  const frontendDir = path.resolve(rootDir, 'frontend');
  const viteBin = path.resolve(frontendDir, 'node_modules/vite/bin/vite.js');

  console.log('[1/4] Starting Backend server on port 5000...');
  const backendProcess = spawn(process.execPath, ['dist/index.js'], {
    cwd: backendDir,
    stdio: 'pipe',
  });

  backendProcess.stdout.on('data', (d) => {
    const txt = d.toString().trim();
    if (txt) console.log('  [Backend stdout]:', txt);
  });
  backendProcess.stderr.on('data', (d) => {
    const txt = d.toString().trim();
    if (txt) console.warn('  [Backend stderr]:', txt);
  });

  console.log('[2/4] Starting Frontend server on port 5173 (host 127.0.0.1)...');
  const frontendProcess = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: frontendDir,
    stdio: 'pipe',
  });

  frontendProcess.stdout.on('data', (d) => {
    const txt = d.toString().trim();
    if (txt) console.log('  [Frontend stdout]:', txt);
  });
  frontendProcess.stderr.on('data', (d) => {
    const txt = d.toString().trim();
    if (txt) console.warn('  [Frontend stderr]:', txt);
  });

  // Give servers time to bind ports
  await sleep(3500);

  try {
    // 1. Direct Backend Health Check
    console.log('\n[3/4] Verifying Direct Backend API at http://127.0.0.1:5000/api/health...');
    const beHealth = await httpGet('http://127.0.0.1:5000/api/health');
    console.log(`  Backend Health: HTTP ${beHealth.status} => ${beHealth.data.trim()}`);
    if (beHealth.status !== 200) throw new Error('Backend failed health check');

    // 2. Direct Frontend HTML Check
    console.log('\n[4/4] Verifying Frontend Web App at http://127.0.0.1:5173...');
    const feRes = await httpGet('http://127.0.0.1:5173');
    console.log(`  Frontend Page: HTTP ${feRes.status} (${feRes.data.length} bytes served)`);
    if (feRes.status !== 200 || !feRes.data.includes('Conversational Banking Data Analyst')) {
      throw new Error('Frontend failed to serve index.html');
    }

    // 3. Test Conversational API Query
    console.log('\n[Integration Test] POST http://127.0.0.1:5000/api/analytics/ask:');
    const queryRes = await httpPost('http://127.0.0.1:5000/api/analytics/ask', {
      question: 'How many customers do we have?',
    });
    console.log(`  Status:        HTTP ${queryRes.status}`);
    console.log(`  Answer:        "${queryRes.json.answer}"`);
    console.log(`  Intent:        "${queryRes.json.intent}"`);
    console.log(`  Visualization: "${queryRes.json.visualization}"`);
    console.log(`  Data Rows:     ${queryRes.json.data.length}`);
    console.log(`  Sample:        ${JSON.stringify(queryRes.json.data[0])}`);

    if (queryRes.status === 200 && queryRes.json.success === true) {
      console.log('\n' + '='.repeat(75));
      console.log('FE / BE INTEGRATION VERIFICATION PASSED WITH 100% SUCCESS!');
      console.log('='.repeat(75));
    } else {
      throw new Error('Integration query test returned invalid response');
    }
  } finally {
    console.log('\nCleaning up processes...');
    try {
      backendProcess.kill();
      frontendProcess.kill();
    } catch {
      // ignore
    }
  }
}

verifyIntegration().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
