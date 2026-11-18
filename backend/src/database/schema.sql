-- ====================================================================
-- Conversational Banking Data Analyst - Database Schema
-- SQLite Database with Foreign Key Constraints, Indexes, and Integrity
-- ====================================================================

-- 1. Enable Foreign Key Constraints
PRAGMA foreign_keys = ON;

-- 2. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_name TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    branch_id INTEGER NOT NULL,
    registration_date TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_customer_per_branch UNIQUE (customer_name, branch_id)
);

-- 4. Onboarding Applications Table
CREATE TABLE IF NOT EXISTS onboarding_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
    application_date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_customer_application UNIQUE (customer_id, application_date, status)
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    transaction_date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_transaction_record UNIQUE (customer_id, amount, transaction_date)
);

-- ====================================================================
-- Indexes for Frequently Queried Foreign Keys & Filter Columns
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_applications_customer_id ON onboarding_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON onboarding_applications(status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
