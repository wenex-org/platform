# Wenex Platform Documentation — Financial Service

## Financial Service

**Description**  
The **Financial Service** is the secure, auditable, and eventually-consistent core engine for all monetary operations in the Wenex ecosystem. It manages **multi-currency wallets**, **account-based ledgers**, **invoicing**, **payment orchestration**, **transaction history**, and **reconciliation logic** — supporting both internal (platform-to-platform) and external (gateway-integrated) money movements.

Built around the **saga pattern** (via Essential → Sagas) and compensating transactions, it guarantees strong consistency for critical operations while remaining resilient in distributed environments. It supports virtual currencies, fiat proxies, crypto addresses, escrow-like holds, and multi-party settlements.

**Use Cases**

- E-commerce checkout & wallet top-up / payout flows
- Banking-style internal transfers, splits, and bulk payments
- Subscription & recurring billing engine (SaaS, content platforms)
- Crypto wallet & on/off-ramp transaction recording
- Marketplace seller payouts with commission deduction
- Refund, chargeback, and dispute resolution workflows
- Multi-currency invoicing for international B2B / freelancing platforms
- Escrow & milestone-based payments in freelance & gig economy apps
- Internal reward / bonus / cashback distribution in loyalty programs

**Modules**

### Accounts

**Purpose**  
Represents logical **financial entities** (personal wallets group, business treasury, escrow vault, shared pot, etc.) that can hold multiple currency balances and define ownership / access rules.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`      | enum      | yes      | AccountType (personal, business, escrow, system, …)   | `personal`, `business`, `escrow`                 |
| `ownership` | enum      | yes      | AccountOwnership (individual, joint, organization)    | `individual`, `organization`                     |
| `members`   | string[]  | no       | User / identity IDs with access rights                | Co-owners or authorized operators                |
| `createdAt` | Date      | yes      | Creation timestamp                                    | —                                                |
| `updatedAt` | Date      | yes      | Last modification timestamp                           | —                                                |

**Relationships & Integrations**

- → `financial.wallets` (one account owns many currency-specific wallets)
- → `identity.users` / `conjoint.accounts` / `career.businesses` (ownership link)
- Used in → `financial.transactions` (source / destination grouping)
- Access control via `auth.grants`

**Typical Use Cases**

- Personal user main financial account
- Business operating account with multiple team members
- Escrow account during marketplace transaction
- System-level reward pool account

### Currencies

**Purpose**  
Central registry of supported **fiat**, **crypto**, and **virtual / platform-specific** currencies with conversion rates, precision rules, and symbol metadata.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId or ISO 4217 / chain symbol           | `USD`, `BTC`, `WNX`                              |
| `name`      | string    | yes      | Full name                                             | "US Dollar", "Bitcoin"                           |
| `symbol`    | string    | no       | Display symbol                                        | `$`, `₿`, `W`                                    |
| `precision` | number    | yes      | Decimal places for amounts                            | 2 (fiat), 8 (crypto)                             |
| `rate`      | number    | no       | Current base rate (vs platform base currency)         | Updated via external feed / oracle               |
| `createdAt` | Date      | yes      | —                                                     | —                                                |
| `updatedAt` | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- Referenced by → `financial.wallets`, `financial.invoices`, `financial.transactions`
- Rate updates → external oracle / cron job → event emission
- Used in UI for formatting & conversion display

**Typical Use Cases**

- Support USD, EUR, BTC, ETH, platform token
- Display prices in user’s preferred currency
- Calculate cross-currency transaction fees

### Invoices

**Purpose**  
Structured, immutable billing documents — supporting one-time charges, subscriptions, pro-forma invoices, credit notes, and multi-line items with taxes, discounts, and profit tracking.

**Key Fields**

| Field           | Type               | Required | Description                                           | Example / Notes                                  |
|-----------------|--------------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`            | string             | yes      | MongoDB ObjectId                                      | —                                                |
| `type`          | enum               | yes      | InvoiceType (invoice, proforma, credit-note, …)       | `invoice`, `subscription`                        |
| `title`         | string             | no       | Human-readable reference                              | "Monthly Pro Plan – Feb 2026"                    |
| `amount`        | number             | yes      | Total amount due (after discount)                     | 99.00                                            |
| `paid`          | number             | no       | Amount already settled                                | Partial payments support                         |
| `currency`      | string             | no       | Currency code                                         | `USD`                                            |
| `payees`        | Pay[]              | yes      | Recipients of funds                                   | Platform / seller split                          |
| `payers`        | Pay[]              | no       | Source breakdown                                      | —                                                |
| `items`         | InvoiceItem[]      | no       | Line items                                            | Plan, usage, tax, discount                       |
| `state`         | enum               | yes      | Lifecycle state                                       | `open`, `paid`, `void`, `overdue`                |
| `profit`        | number             | no       | Platform / intermediary margin                        | —                                                |
| `discount`      | number             | no       | Total discount applied                                | —                                                |
| `expires_at`    | Date               | no       | Payment deadline                                      | —                                                |
| `closed_at`     | Date               | no       | Finalization timestamp                                | —                                                |
| `subscription`  | string             | no       | Cron expression for recurring                         | `0 0 1 * *` (monthly)                            |

**Relationships & Integrations**

- → `financial.transactions` (payment attempts)
- → `financial.wallets` (via Pay objects)
- → `touch.emails` / `touch.notices` (reminders, receipts)
- → `essential.sagas` (create → charge → activate flow)

**Typical Use Cases**

- Monthly SaaS subscription invoice
- One-time marketplace order bill
- Credit note after refund
- Pro-forma quote for enterprise client

### Transactions

**Purpose**  
Atomic, immutable record of every money movement — debit, credit, transfer, fee, refund — with saga correlation and multi-payee / multi-payer support.

**Key Fields**

| Field         | Type      | Required | Description                                           | Example / Notes                                  |
|---------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`          | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `saga`        | string    | yes      | Linking saga ID                                       | Ensures atomicity & compensation                 |
| `type`        | enum      | yes      | TransactionType (deposit, withdrawal, transfer, …)    | `transfer`, `fee`, `refund`                      |
| `state`       | enum      | yes      | Processing state                                      | `pending`, `verified`, `failed`, `canceled`      |
| `reason`      | enum      | yes      | Business reason code                                  | `payment`, `payout`, `correction`                |
| `amount`      | number    | yes      | Net amount moved                                      | Positive or negative depending on direction      |
| `payees`      | Pay[]     | no       | Receiving side breakdown                              | Split payments                                   |
| `payers`      | Pay[]     | no       | Sending side breakdown                                | —                                                |
| `invoice`     | string    | no       | Linked invoice ID                                     | —                                                |
| `verified_at` | Date      | no       | Gateway / blockchain confirmation time                | —                                                |
| `failed_at`   | Date      | no       | Failure timestamp                                     | —                                                |

**Relationships & Integrations**

- → `financial.wallets` (via Pay)
- → `essential.sagas` (coordination & rollback)
- → `financial.invoices`
- Emits → audit / stats events

**Typical Use Cases**

- Internal wallet-to-wallet transfer
- External gateway deposit
- Commission split on marketplace sale
- Failed payment retry / refund

### Wallets

**Purpose**  
Per-currency balance container attached to a financial account — supporting available, blocked (held), internal & external tracked amounts, and optional blockchain address integration.

**Key Fields**

| Field      | Type    | Required | Description                                           | Example / Notes                                  |
|------------|---------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`       | string  | yes      | MongoDB ObjectId                                      | —                                                |
| `account`  | string  | yes      | Owning financial account                              | —                                                |
| `currency` | string  | yes      | Currency code                                         | `USD`, `BTC`                                     |
| `amount`   | number  | yes      | Available balance                                     | 142.50                                           |
| `blocked`  | number  | no       | Held / pending amount (escrow, pending tx)            | 30.00                                            |
| `internal` | number  | no       | Internal-only funds (rewards, credits)                | —                                                |
| `external` | number  | no       | Funds from external sources                           | —                                                |
| `address`  | string  | no       | Blockchain / payment address (crypto / IBAN)          | Optional                                         |
| `private`  | string  | no       | Private key / memo (very sensitive – encrypted)       | Highly restricted access                         |

**Relationships & Integrations**

- → `financial.accounts` (1-to-N)
- → `financial.transactions` (balance changes)
- → `financial.currencies`
- Balance updates via sagas only

**Typical Use Cases**

- User main USD spending wallet
- Seller payout wallet with blocked funds during dispute
- Platform reward wallet (internal-only)
- Crypto deposit address per user
