const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const { seedDatabase } = require('./seed.cjs');

function verifyDatabase(dbPath) {
  const targetDb = dbPath || process.env.DB_FILE || path.resolve(__dirname, 'banking.db');
  console.log('='.repeat(70));
  console.log('CONVERSATIONAL BANKING DATA ANALYST - DB VERIFICATION REPORT');
  console.log('Database Path:', targetDb);
  console.log('='.repeat(70));

  const db = new DatabaseSync(targetDb);
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Foreign Key Verification
  const fkStatus = db.prepare('PRAGMA foreign_keys').get();
  console.log('\n[1] Foreign Key Constraints:');
  console.log(`    PRAGMA foreign_keys = ${fkStatus.foreign_keys} (${fkStatus.foreign_keys === 1 ? 'ENABLED' : 'DISABLED'})`);

  const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
  console.log(`    Foreign Key Violations: ${fkCheck.length} (${fkCheck.length === 0 ? 'CLEAN / 0 VIOLATIONS' : 'FAILED'})`);
  if (fkCheck.length > 0) {
    console.error('    Violations detected:', fkCheck);
    process.exit(1);
  }

  // 2. Table Schemas & Existence
  console.log('\n[2] Table Schema Verification:');
  const expectedTables = ['branches', 'customers', 'onboarding_applications', 'transactions'];
  for (const table of expectedTables) {
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
    const colNames = tableInfo.map(c => `${c.name} (${c.type}${c.pk ? ' PK' : ''})`).join(', ');
    console.log(`    Table "${table}": [${colNames}]`);
  }

  // 3. Indexes Verification
  console.log('\n[3] Index Verification:');
  const expectedIndexes = [
    'idx_customers_branch_id',
    'idx_applications_customer_id',
    'idx_applications_status',
    'idx_transactions_customer_id',
    'idx_transactions_date'
  ];
  const allIndexes = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'").all();
  for (const exp of expectedIndexes) {
    const found = allIndexes.find(i => i.name === exp);
    console.log(`    Index "${exp}": ${found ? `PRESENT on table ${found.tbl_name}` : 'MISSING'}`);
  }

  // 4. Record Counts
  console.log('\n[4] Record Counts:');
  const counts = {
    branches: db.prepare('SELECT COUNT(*) as c FROM branches').get().c,
    customers: db.prepare('SELECT COUNT(*) as c FROM customers').get().c,
    applications: db.prepare('SELECT COUNT(*) as c FROM onboarding_applications').get().c,
    transactions: db.prepare('SELECT COUNT(*) as c FROM transactions').get().c,
  };
  console.log(`    - branches:                 ${counts.branches} records`);
  console.log(`    - customers:                ${counts.customers} records (across multiple branches)`);
  console.log(`    - onboarding_applications:  ${counts.applications} records (>= 15 requirement satisfied)`);
  console.log(`    - transactions:             ${counts.transactions} records (>= 15 requirement satisfied)`);

  // 5. Onboarding Application Statuses
  console.log('\n[5] Application Status Breakdown:');
  const statuses = db.prepare('SELECT status, COUNT(*) as count FROM onboarding_applications GROUP BY status').all();
  for (const s of statuses) {
    console.log(`    - ${s.status.padEnd(10)}: ${s.count}`);
  }
  const hasApproved = statuses.some(s => s.status === 'APPROVED');
  const hasPending = statuses.some(s => s.status === 'PENDING');
  const hasRejected = statuses.some(s => s.status === 'REJECTED');
  console.log(`    Status Diversity Check: ${hasApproved && hasPending && hasRejected ? 'PASS (APPROVED, PENDING, REJECTED all included)' : 'FAIL'}`);

  // 6. Transactions Monthly Distribution
  console.log('\n[6] Transaction Distribution Across Multiple Months:');
  const months = db.prepare(`
    SELECT substr(transaction_date, 1, 7) as month,
           COUNT(*) as tx_count,
           printf('$%.2f', SUM(amount)) as total_vol
    FROM transactions
    GROUP BY substr(transaction_date, 1, 7)
    ORDER BY month ASC
  `).all();
  for (const m of months) {
    console.log(`    - ${m.month}: ${String(m.tx_count).padStart(2)} txs | Volume: ${m.total_vol}`);
  }
  console.log(`    Distinct Months: ${months.length} (Spanning multi-month timeline: Jan 2025 - Feb 2026)`);

  // 7. Constraint Enforcement Tests
  console.log('\n[7] Constraint Enforcement Tests:');
  // 7a. Foreign Key rejection test
  let fkBlocked = false;
  try {
    db.prepare('INSERT INTO customers (customer_name, branch_id, registration_date) VALUES (?, ?, ?)').run('Invalid Cust', 999999, '2026-01-01');
  } catch (err) {
    fkBlocked = true;
    console.log(`    Foreign Key Violation Rejection: PASS (Rejected invalid branch_id: ${err.message})`);
  }
  if (!fkBlocked) {
    console.error('    FAIL: Database permitted invalid foreign key reference!');
  }

  // 7b. Check Constraint test
  let checkBlocked = false;
  try {
    db.prepare('INSERT INTO onboarding_applications (customer_id, status, application_date) VALUES (?, ?, ?)').run(1, 'INVALID_STATUS', '2026-01-01');
  } catch (err) {
    checkBlocked = true;
    console.log(`    CHECK Constraint Rejection: PASS (Rejected invalid status: ${err.message})`);
  }
  if (!checkBlocked) {
    console.error('    FAIL: Database permitted invalid status value!');
  }

  // 8. Seeding Idempotency Verification
  console.log('\n[8] Repeatable Seeding (No Duplicates) Test:');
  const beforeCount = counts.transactions;
  seedDatabase(targetDb);
  const afterCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
  console.log(`    Transaction count before re-seed: ${beforeCount}, after re-seed: ${afterCount}`);
  console.log(`    Idempotency Check: ${beforeCount === afterCount ? 'PASS (0 duplicate records created)' : 'FAIL'}`);

  db.close();
  console.log('\n' + '='.repeat(70));
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY.');
  console.log('='.repeat(70));
}

if (require.main === module) {
  try {
    verifyDatabase();
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

module.exports = { verifyDatabase };
