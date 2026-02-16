# Wenex — Career Service Documentation

## Overview

**Description**  
Central microservice that models real-world commercial organizations, their hierarchy, offerings (products & services), inventory, people (employees & customers), and basic performance metrics.

**Use Cases**

- Multi-branch retail chain (supermarkets, pharmacies, fashion)
- Franchise management (food, education, fitness centers)
- Professional service providers (clinics, consultancies, workshops)
- Product catalog for marketplaces or internal ERP
- On-demand service platforms (cleaning, repair, tutoring)
- B2B supplier & distributor portals
- Internal company asset & service catalogs

### Modules

- [**businesses**](#businesses)
- [**branches**](#branches)  
- [**stores**](#stores)  
- [**employees**](#employees)  
- [**customers**](#customers)  
- [**products**](#products)  
- [**services**](#services)  
- [**stocks**](#stocks)

## Modules

### Businesses

**Purpose**  
Represents legal or brand-level organizations (companies, brands, chains, franchises). Top level of the commercial hierarchy.

**Key Fields**

| Field            | Type      | Required | Description                                           | Example / Notes                                 |
|------------------|-----------|----------|-------------------------------------------------------|-------------------------------------------------|
| name             | string    | yes      | Official or brand name                                | "TechTrend Innovations"                         |
| type             | enum      | yes      | Legal/business classification                         | `CORPORATION`, `SOLE_PROPRIETORSHIP`, `FRANCHISE` |
| code             | string    | no       | Tax ID, commercial registry number                    | "IR123456789"                                   |
| alias            | string    | no       | URL-friendly slug                                     | "techtrend"                                     |
| logo             | string    | no       | URL or file ID                                        | Object Storage key                              |
| cover            | string    | no       | Banner image                                          | —                                               |
| slogan           | string    | no       | Marketing tagline                                     | "Tomorrow's tech today"                         |
| state            | enum      | yes      | Lifecycle state                                       | `ACTIVE`, `SUSPENDED`, `ARCHIVED`               |
| status           | enum      | yes      | Operational/verification status                       | `VERIFIED`, `PENDING`, `REJECTED`               |
| rate             | number    | yes      | Average rating (cached)                               | 4.32                                            |
| votes            | number    | no       | Total number of ratings                               | 1847                                            |
| rating           | number    | no       | Weighted or Bayesian rating (optional)                | —                                               |
| address          | string    | no       | Headquarters / legal address                          | —                                               |
| website          | string    | no       | Official website                                      | "https://techtrend.com"                         |
| categories       | string[]  | no       | Industry / vertical tags                              | ["electronics", "software"]                     |
| founder          | string    | no       | Founder user ID                                       | User ID                                         |
| foundation_date  | Date      | no       | Date company was founded                              | —                                               |

**Relationships & Integrations**  
→ owns **Branches**, **Stores**, **Products**, **Services**, **Stocks**  
← referenced by **Employees**, **Customers**  
→ integrates with **identity.profiles**, **financial.wallets**, **logistic.locations**

**Typical Use Cases**

- Registering a new franchise brand
- Managing multi-country chain headquarters
- Displaying brand catalog in marketplace frontend
- Calculating brand-level reputation score

### Branches

**Purpose**  
Regional / city-level subdivisions of a business (area offices, regional headquarters, distribution centers).

**Key Fields**

| Field           | Type     | Required | Description                               | Example / Notes                         |
|-----------------|----------|----------|-------------------------------------------|-----------------------------------------|
| name            | string   | no       | Branch name                               | "Tehran Central Branch"                 |
| type            | enum     | yes      | Administrative / functional type          | `HEADQUARTER`, `REGIONAL`, `LOGISTICS`  |
| business        | string   | yes      | Parent Business ID                        | —                                       |
| code            | string   | no       | Internal branch code                      | "THR-001"                               |
| state           | enum     | no       | —                                         | —                                       |
| status          | enum     | yes      | —                                         | —                                       |
| rate            | number   | yes      | Aggregated rating                         | 4.1                                     |
| votes           | number   | no       | —                                         | —                                       |
| rating          | number   | no       | —                                         | —                                       |
| manager         | string   | no       | Employee ID (branch manager)              | —                                       |
| parent          | string   | no       | Parent branch (for sub-branches)          | —                                       |
| location        | string   | yes      | Location ID (logistic.locations)          | —                                       |
| phone           | string   | no       | Main contact number                       | —                                       |
| address         | string   | no       | Full physical address                     | —                                       |
| opening_date    | Date     | no       | —                                         | —                                       |

**Relationships & Integrations**  
→ parent **Business**  
→ owns **Stores**  
→ managed by **Employees**  
→ referenced by **Stocks**, **Services**

### Stores

**Purpose**  
Customer-facing sales points (physical shops, online stores, pop-up stores, dark stores, warehouses with retail).

**Key Fields**

| Field       | Type      | Required | Description                               | Example / Notes                           |
|-------------|-----------|----------|-------------------------------------------|-------------------------------------------|
| name        | string    | yes      | Store name / identifier                   | "Valiasr Flagship"                        |
| type        | enum      | yes      | `PHYSICAL`, `ONLINE`, `DARK_STORE`, …     | —                                         |
| fork        | enum      | yes      | Ownership model (franchise, owned, …)     | `OWNED`, `FRANCHISE`, `PARTNER`           |
| business    | string    | yes      | Owning Business                           | —                                         |
| parent      | string    | no       | Parent store (chain concept)              | —                                         |
| manager     | string    | no       | Employee ID                               | —                                         |
| range       | enum      | no       | Delivery/service radius category          | `CITY`, `NATIONAL`, `GLOBAL`              |
| state       | enum      | no       | —                                         | —                                         |
| status      | enum      | yes      | —                                         | —                                         |
| rate        | number    | yes      | —                                         | —                                         |
| categories  | string[]  | no       | Merchandise categories                    | ["women", "accessories"]                  |
| phone       | string    | no       | —                                         | —                                         |
| address     | string    | no       | —                                         | —                                         |
| location    | string    | no       | Main location ID                          | —                                         |

**Relationships & Integrations**  
→ belongs to **Business** / **Branch**  
→ contains **Stocks**  
→ served by **Services**  
→ rated via **general.comments**

(continuing pattern — abbreviated for brevity; full version would include all 8 modules in similar detail)

### Employees

**Purpose**  
Manages internal workforce / staff records that are linked to businesses, branches or stores. Serves as the connection point between identity profiles and organizational structure.

**Key Fields**

| Field            | Type      | Required | Description                                      | Example / Notes                          |
|------------------|-----------|----------|--------------------------------------------------|------------------------------------------|
| type             | enum      | yes      | Role category or employment type                 | `FULL_TIME`, `PART_TIME`, `CONTRACTOR`   |
| business         | string    | no       | Top-level organization (optional if branch/store specific) | Business ID                     |
| branch           | string    | no       | —                                                | Branch ID                                |
| store            | string    | no       | —                                                | Store ID                                 |
| profile          | string    | yes      | Link to identity.profiles                        | Profile ID                               |
| manager          | string    | no       | Direct supervisor (Employee ID – self-reference) | —                                        |
| hire_date        | Date      | yes      | Official start date                              | —                                        |
| termination_date | Date      | no       | When employment ends (if applicable)             | —                                        |
| job_title        | string    | yes      | Current position                                 | "Store Manager", "Senior Buyer"          |
| department       | string    | no       | Functional group                                 | "Sales", "Logistics", "IT"               |
| state            | enum      | yes      | Lifecycle                                        | `ACTIVE`, `ON_LEAVE`, `TERMINATED`       |
| status           | enum      | yes      | Verification / approval status                   | `VERIFIED`, `PENDING`, `SUSPENDED`       |
| rate             | number    | no       | Performance rating (internal)                    | 4.6                                      |
| employee_code    | string    | no       | Internal payroll/HR identifier                   | "EMP-2024-078"                           |

**Relationships & Integrations**  
→ belongs to **Business** / **Branch** / **Store**  
→ references **identity.profiles**  
← referenced as manager by other **Employees**  
← referenced in **Stores** (manager field)

**Typical Use Cases**

- Assigning store managers and shift supervisors
- Tracking onboarding and offboarding dates
- Building organizational charts per branch/business
- Filtering active employees eligible for certain permissions or reports

### Customers

**Purpose**  
Represents buyer entities (individuals or companies) that interact with businesses, stores, products and services — the commercial counterparty side.

**Key Fields**

| Field           | Type      | Required | Description                                      | Example / Notes                          |
|-----------------|-----------|----------|--------------------------------------------------|------------------------------------------|
| type            | enum      | yes      | `INDIVIDUAL`, `COMPANY`, `GOVERNMENT`, …         | —                                        |
| profile         | string    | no       | Link to personal profile (for B2C)               | Profile ID                               |
| account         | string    | no       | Link to conjoint.accounts (for richer identity)  | Account ID                               |
| business        | string    | no       | For B2B – the buying organization                | Business ID                              |
| name            | string    | yes      | Display / legal name                             | "Sara Mohammadi" or "Acme Corp"          |
| code            | string    | no       | Tax/VAT number or customer number                | "IR654321987"                            |
| phone           | string    | no       | Primary contact number                           | —                                        |
| email           | string    | no       | —                                                | —                                        |
| address         | string    | no       | Default / billing address                        | —                                        |
| location        | string    | no       | Preferred / last known location                  | Location ID                              |
| state           | enum      | yes      | —                                                | —                                        |
| status          | enum      | yes      | `ACTIVE`, `BLOCKED`, `PROSPECT`, …               | —                                        |
| first_purchase  | Date      | no       | —                                                | —                                        |
| last_purchase   | Date      | no       | —                                                | —                                        |
| total_spent     | number    | no       | Lifetime value (cached)                          | 12450000                                 |
| orders_count    | number    | no       | —                                                | 87                                       |

**Relationships & Integrations**  
→ can be linked to **identity.profiles** or **conjoint.accounts**  
→ can belong to / purchase from **Business** / **Store**  
→ creates **financial.invoices**, **financial.transactions**

**Typical Use Cases**

- Maintaining B2B customer master data with credit limits
- Personalizing offers for frequent retail customers
- Segmenting customers by lifetime value or last purchase date
- Blocking abusive accounts across all stores of a chain

### Products

**Purpose**  
Core catalog entity for sellable physical or digital goods with rich metadata, variants (via features), media and rating aggregation.

**Key Fields**

| Field         | Type               | Required | Description                                | Example / Notes                            |
|---------------|--------------------|----------|--------------------------------------------|--------------------------------------------|
| name          | string             | yes      | Product title                              | "Wireless Noise-Cancelling Headphones"     |
| alias         | string             | no       | URL-friendly slug                          | "sony-wh-1000xm5"                          |
| business      | string             | no       | Owning brand/business                      | —                                          |
| branch        | string             | no       | —                                          | —                                          |
| store         | string             | no       | If product is store-exclusive              | —                                          |
| brand         | string             | no       | Brand name                                 | "Sony"                                     |
| content       | string             | no       | Long description / rich text               | Markdown or HTML                           |
| cover         | string             | no       | Main product image                         | File ID                                    |
| gallery       | string[]           | no       | Additional images                          | —                                          |
| categories    | string[]           | no       | Hierarchical taxonomy                      | ["audio", "headphones", "wireless"]        |
| state         | enum               | no       | `DRAFT`, `PUBLISHED`, `DISCONTINUED`       | —                                          |
| rate          | number             | yes      | Cached average rating                      | 4.78                                       |
| votes         | number             | no       | Total ratings count                        | 1243                                       |
| rating        | number             | no       | Optional Bayesian/smoothed score           | —                                          |
| features      | ProductFeature[]   | no       | Variant-defining attributes                | Color, Storage, …                          |

**Relationships & Integrations**  
→ owned by **Business** / **Store**  
→ has many **ProductFeature** (used for variants)  
→ referenced by **Stocks**  
→ rated via **general.comments**

**Typical Use Cases**

- Building rich product detail pages in e-commerce frontends
- Filtering and faceting by features (color, size, RAM, …)
- Managing seasonal / discontinued products
- Synchronizing catalog to external marketplaces

### Services

**Purpose**  
Represents bookable, scheduled or location-based professional / on-demand services with pricing and service area information.

**Key Fields**

| Field      | Type      | Required | Description                                | Example / Notes                          |
|------------|-----------|----------|--------------------------------------------|------------------------------------------|
| type       | enum      | yes      | Service classification                     | `CONSULTING`, `REPAIR`, `CLEANING`, …    |
| name       | string    | yes      | Service title                              | "Home Deep Cleaning"                     |
| business   | string    | yes      | Provider                                   | —                                        |
| branch     | string    | no       | —                                          | —                                        |
| range      | enum      | no       | Service radius category                    | `CITY`, `50KM`, `NATIONAL`               |
| currency   | string    | no       | —                                          | Currency ID                              |
| unit       | string    | no       | Pricing unit                               | "hour", "session", "m²"                  |
| price      | number    | no       | Base price                                 | 850000                                   |
| profit     | number    | no       | Estimated margin                           | 320000                                   |
| discount   | number    | no       | Current discount amount                    | 150000                                   |
| state      | enum      | yes      | —                                          | —                                        |
| status     | enum      | yes      | —                                          | —                                        |
| rate       | number    | yes      | —                                          | —                                        |
| categories | string[]  | no       | —                                          | —                                        |
| location   | string    | no       | Main service location                      | —                                        |

**Relationships & Integrations**  
→ provided by **Business** / **Branch**  
→ can be restricted to **LocationRange**  
→ booked → creates **financial.invoices**

**Typical Use Cases**

- Offering home services with radius-based availability
- Publishing professional consulting packages
- Managing tiered pricing for different regions
- Displaying top-rated local services in mobile apps

### Stocks

**Purpose**  
Inventory tracking per product (or product variant), location (store/warehouse), with pricing, capacity and reorder threshold logic.

**Key Fields**

| Field      | Type     | Required | Description                                  | Example / Notes                          |
|------------|----------|----------|----------------------------------------------|------------------------------------------|
| type       | enum     | yes      | `PHYSICAL`, `VIRTUAL`, `CONSIGNMENT`, …      | —                                        |
| product    | string   | yes      | Referenced product                           | Product ID                               |
| feature    | string   | no       | Specific variant (ProductFeature combination)| —                                        |
| store      | string   | no*      | Sales location                               | Store ID (*one of store/business required) |
| business   | string   | no*      | Central warehouse / owner                    | —                                        |
| branch     | string   | no       | —                                            | —                                        |
| capacity   | number   | no       | Maximum stock level                          | 500                                      |
| inventory  | number   | yes      | Current available quantity                   | 87                                       |
| blocked    | number   | no       | Reserved (cart / orders)                     | 12                                       |
| place      | string   | no       | Aisle / shelf / bin                          | "A-12-03"                                |
| threshold  | number   | no       | Reorder point                                | 30                                       |
| currency   | string   | no       | —                                            | —                                        |
| unit       | string   | no       | Unit of measure                              | "piece", "kg", "box"                     |
| price      | number   | no       | Selling price                                | 2450000                                  |
| profit     | number   | no       | Margin                                       | 820000                                   |
| discount   | number   | no       | Current discount                             | 200000                                   |
| state      | enum     | no       | —                                            | —                                        |
| status     | enum     | yes      | —                                            | —                                        |

**Relationships & Integrations**  
→ references **Products** (+ optional **ProductFeature**)  
→ located in **Stores** / **Business**  
→ updated during **financial.transactions** (sales, returns, adjustments)  
→ can trigger **logistic** movements

**Typical Use Cases**

- Real-time stock visibility per store
- Low-stock / out-of-stock notifications
- Multi-warehouse inventory allocation
- Variant-level inventory (size S/M/L, color red/blue)
