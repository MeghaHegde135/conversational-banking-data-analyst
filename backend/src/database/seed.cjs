const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

function getDb(customPath) {
  const dbPath = customPath || process.env.DB_FILE || path.resolve(__dirname, 'banking.db');
  const dbDir = path.dirname(dbPath);
  if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  return db;
}

function initSchema(db) {
  const schemePath = path.resolve(__dirname, 'scheme.sql');
  const sql = fs.readFileSync(schemePath, 'utf-8');
  db.exec(sql);
}

function seedDatabase(customPath) {
  const db = getDb(customPath);
  initSchema(db);

  // 1. Synthetic Branches (5 branches across different cities)
  const branchesData = [
    { name: 'Downtown Commercial Center', city: 'New York' },
    { name: 'Bay Area Tech Hub', city: 'San Francisco' },
    { name: 'Midwest Regional Branch', city: 'Chicago' },
    { name: 'New England Financial Center', city: 'Boston' },
    { name: 'Capitol Valley Branch', city: 'Austin' },
  ];

  const insertBranch = db.prepare(`
    INSERT OR IGNORE INTO branches (branch_name, city)
    VALUES (?, ?);
  `);

  for (const b of branchesData) {
    insertBranch.run(b.name, b.city);
  }

  // Fetch branch IDs dynamically
  const branches = db.prepare('SELECT id, branch_name FROM branches').all();
  const branchMap = new Map();
  for (const b of branches) {
    branchMap.set(b.branch_name, b.id);
  }

  const b1 = branchMap.get('Downtown Commercial Center') || 1;
  const b2 = branchMap.get('Bay Area Tech Hub') || 2;
  const b3 = branchMap.get('Midwest Regional Branch') || 3;
  const b4 = branchMap.get('New England Financial Center') || 4;
  const b5 = branchMap.get('Capitol Valley Branch') || 5;

  // 2. Synthetic Customers (20 records, no real personal data)
  const customersData = [
    { name: 'Alpha Enterprise Solutions', branchId: b1, regDate: '2025-01-15' },
    { name: 'Beacon Global Logistics', branchId: b1, regDate: '2025-01-22' },
    { name: 'Cascade Renewable Energy', branchId: b2, regDate: '2025-02-05' },
    { name: 'Delta Heights Analytics', branchId: b2, regDate: '2025-02-18' },
    { name: 'Echo Digital Systems', branchId: b2, regDate: '2025-03-01' },
    { name: 'Frontier Agro Holdings', branchId: b3, regDate: '2025-03-12' },
    { name: 'Genesis BioTech Labs', branchId: b3, regDate: '2025-04-02' },
    { name: 'Horizon Freight Services', branchId: b3, regDate: '2025-04-19' },
    { name: 'Ironclad Cyber Security', branchId: b4, regDate: '2025-05-08' },
    { name: 'Jupiter Creative Agency', branchId: b4, regDate: '2025-05-24' },
    { name: 'Keystone Retail Partners', branchId: b4, regDate: '2025-06-11' },
    { name: 'Lumina Healthcare Group', branchId: b5, regDate: '2025-06-28' },
    { name: 'Mirage Media Production', branchId: b5, regDate: '2025-07-04' },
    { name: 'Nexus Cloud Architectures', branchId: b5, regDate: '2025-07-19' },
    { name: 'Omega Robotics Systems', branchId: b1, regDate: '2025-08-03' },
    { name: 'Pinnacle Real Estate Trust', branchId: b2, regDate: '2025-08-22' },
    { name: 'Quantum Edge Instruments', branchId: b3, regDate: '2025-09-09' },
    { name: 'Radiant Solar Ventures', branchId: b4, regDate: '2025-09-25' },
    { name: 'Summit Supply Chain', branchId: b5, regDate: '2025-10-14' },
    { name: 'Terra Firma Infrastructure', branchId: b1, regDate: '2025-11-02' },
  ];

  const insertCustomer = db.prepare(`
    INSERT OR IGNORE INTO customers (customer_name, branch_id, registration_date)
    VALUES (?, ?, ?);
  `);

  for (const c of customersData) {
    insertCustomer.run(c.name, c.branchId, c.regDate);
  }

  // Fetch customer IDs dynamically
  const customers = db.prepare('SELECT id, customer_name FROM customers').all();
  const customerMap = new Map();
  for (const c of customers) {
    customerMap.set(c.customer_name, c.id);
  }

  const getCustId = (name) => customerMap.get(name) || 1;

  // 3. Synthetic Onboarding Applications (APPROVED, PENDING, REJECTED)
  const applicationsData = [
    { customer: 'Alpha Enterprise Solutions', status: 'APPROVED', date: '2025-01-16' },
    { customer: 'Beacon Global Logistics', status: 'APPROVED', date: '2025-01-23' },
    { customer: 'Cascade Renewable Energy', status: 'APPROVED', date: '2025-02-06' },
    { customer: 'Delta Heights Analytics', status: 'APPROVED', date: '2025-02-19' },
    { customer: 'Echo Digital Systems', status: 'REJECTED', date: '2025-03-02' },
    { customer: 'Frontier Agro Holdings', status: 'APPROVED', date: '2025-03-14' },
    { customer: 'Genesis BioTech Labs', status: 'APPROVED', date: '2025-04-03' },
    { customer: 'Horizon Freight Services', status: 'REJECTED', date: '2025-04-20' },
    { customer: 'Ironclad Cyber Security', status: 'APPROVED', date: '2025-05-10' },
    { customer: 'Jupiter Creative Agency', status: 'APPROVED', date: '2025-05-26' },
    { customer: 'Keystone Retail Partners', status: 'REJECTED', date: '2025-06-12' },
    { customer: 'Lumina Healthcare Group', status: 'APPROVED', date: '2025-06-29' },
    { customer: 'Mirage Media Production', status: 'APPROVED', date: '2025-07-05' },
    { customer: 'Nexus Cloud Architectures', status: 'APPROVED', date: '2025-07-21' },
    { customer: 'Omega Robotics Systems', status: 'PENDING', date: '2025-08-04' },
    { customer: 'Pinnacle Real Estate Trust', status: 'APPROVED', date: '2025-08-25' },
    { customer: 'Quantum Edge Instruments', status: 'PENDING', date: '2025-09-10' },
    { customer: 'Radiant Solar Ventures', status: 'APPROVED', date: '2025-09-27' },
    { customer: 'Summit Supply Chain', status: 'PENDING', date: '2025-10-15' },
    { customer: 'Terra Firma Infrastructure', status: 'REJECTED', date: '2025-11-03' },
  ];

  const insertApp = db.prepare(`
    INSERT OR IGNORE INTO onboarding_applications (customer_id, status, application_date)
    VALUES (?, ?, ?);
  `);

  for (const app of applicationsData) {
    insertApp.run(getCustId(app.customer), app.status, app.date);
  }

  // 4. Synthetic Transactions (38 records across multiple months: 2025-01 through 2026-02)
  const transactionsData = [
    { customer: 'Alpha Enterprise Solutions', amount: 1540.50, date: '2025-01-18' },
    { customer: 'Beacon Global Logistics', amount: 890.00, date: '2025-01-25' },
    { customer: 'Cascade Renewable Energy', amount: 12500.00, date: '2025-02-10' },
    { customer: 'Alpha Enterprise Solutions', amount: 340.25, date: '2025-02-14' },
    { customer: 'Delta Heights Analytics', amount: 4800.00, date: '2025-02-22' },
    { customer: 'Frontier Agro Holdings', amount: 720.00, date: '2025-03-15' },
    { customer: 'Cascade Renewable Energy', amount: 21500.00, date: '2025-03-20' },
    { customer: 'Beacon Global Logistics', amount: 950.00, date: '2025-03-28' },
    { customer: 'Genesis BioTech Labs', amount: 3100.00, date: '2025-04-05' },
    { customer: 'Delta Heights Analytics', amount: 1640.75, date: '2025-04-18' },
    { customer: 'Alpha Enterprise Solutions', amount: 450.00, date: '2025-04-25' },
    { customer: 'Ironclad Cyber Security', amount: 8900.00, date: '2025-05-12' },
    { customer: 'Jupiter Creative Agency', amount: 12000.50, date: '2025-05-28' },
    { customer: 'Frontier Agro Holdings', amount: 780.00, date: '2025-05-30' },
    { customer: 'Genesis BioTech Labs', amount: 3450.00, date: '2025-06-08' },
    { customer: 'Beacon Global Logistics', amount: 920.00, date: '2025-06-15' },
    { customer: 'Ironclad Cyber Security', amount: 6800.00, date: '2025-06-25' },
    { customer: 'Lumina Healthcare Group', amount: 14200.00, date: '2025-07-02' },
    { customer: 'Mirage Media Production', amount: 510.00, date: '2025-07-12' },
    { customer: 'Nexus Cloud Architectures', amount: 2300.00, date: '2025-07-28' },
    { customer: 'Pinnacle Real Estate Trust', amount: 7600.00, date: '2025-08-26' },
    { customer: 'Alpha Enterprise Solutions', amount: 310.00, date: '2025-08-30' },
    { customer: 'Cascade Renewable Energy', amount: 18500.00, date: '2025-08-31' },
    { customer: 'Jupiter Creative Agency', amount: 4200.00, date: '2025-09-05' },
    { customer: 'Radiant Solar Ventures', amount: 1150.00, date: '2025-09-29' },
    { customer: 'Lumina Healthcare Group', amount: 9800.00, date: '2025-09-30' },
    { customer: 'Delta Heights Analytics', amount: 6700.00, date: '2025-10-12' },
    { customer: 'Genesis BioTech Labs', amount: 2200.00, date: '2025-10-22' },
    { customer: 'Pinnacle Real Estate Trust', amount: 540.00, date: '2025-10-28' },
    { customer: 'Ironclad Cyber Security', amount: 13400.00, date: '2025-11-15' },
    { customer: 'Radiant Solar Ventures', amount: 890.00, date: '2025-11-20' },
    { customer: 'Nexus Cloud Architectures', amount: 3100.00, date: '2025-11-29' },
    { customer: 'Cascade Renewable Energy', amount: 24500.00, date: '2025-12-14' },
    { customer: 'Alpha Enterprise Solutions', amount: 4300.00, date: '2025-12-28' },
    { customer: 'Lumina Healthcare Group', amount: 5600.00, date: '2026-01-10' },
    { customer: 'Pinnacle Real Estate Trust', amount: 8100.00, date: '2026-01-24' },
    { customer: 'Mirage Media Production', amount: 1250.00, date: '2026-02-05' },
    { customer: 'Ironclad Cyber Security', amount: 17800.00, date: '2026-02-14' },
  ];

  const insertTx = db.prepare(`
    INSERT OR IGNORE INTO transactions (customer_id, amount, transaction_date)
    VALUES (?, ?, ?);
  `);

  for (const tx of transactionsData) {
    insertTx.run(getCustId(tx.customer), tx.amount, tx.date);
  }

  // Count totals
  const totalBranches = db.prepare('SELECT COUNT(*) as count FROM branches').get().count;
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  const totalApplications = db.prepare('SELECT COUNT(*) as count FROM onboarding_applications').get().count;
  const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;

  return {
    branchesInserted: branchesData.length,
    customersInserted: customersData.length,
    applicationsInserted: applicationsData.length,
    transactionsInserted: transactionsData.length,
    totalBranches,
    totalCustomers,
    totalApplications,
    totalTransactions,
    db,
  };
}

if (require.main === module) {
  try {
    console.log('Seeding SQLite database...');
    const result = seedDatabase();
    console.log('Seeding completed successfully:');
    console.log(`- Branches: ${result.totalBranches}`);
    console.log(`- Customers: ${result.totalCustomers}`);
    console.log(`- Applications: ${result.totalApplications}`);
    console.log(`- Transactions: ${result.totalTransactions}`);
    result.db.close();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

module.exports = { seedDatabase, getDb, initSchema };
