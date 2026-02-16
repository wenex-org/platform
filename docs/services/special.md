# Wenex Platform Documentation — Special Service

## Special Service

**Description**  
The **Special Service** serves as a **cross-cutting, utility-focused microservice** that handles platform-wide concerns not naturally belonging to any single business domain. It provides high-performance **object/file storage abstraction**, centralized **file metadata management**, and **aggregated statistical counters / time-series metrics** used for analytics, dashboards, rate-limiting, fraud detection, usage billing, and operational insights.

This service is deliberately kept lightweight and horizontally scalable, acting as a critical dependency for almost every other microservice that needs persistent blob storage or numeric aggregations over time.

**Use Cases**

- Storing user avatars, product images, invoice PDFs, proof-of-delivery photos
- Managing downloadable reports, exported CSVs, backup archives
- Serving temporary signed URLs for secure file sharing
- Generating real-time / historical usage statistics (API calls, storage consumed, messages sent)
- Powering admin dashboards with platform health & adoption metrics
- Supporting billing & quota enforcement (storage used per tenant, messages per day)
- Fraud / anomaly detection via sudden spikes in file uploads or API activity
- Usage analytics in e-learning (course views), e-commerce (product image views), crypto (wallet transaction volume)

**Modules**

### Files

**Purpose**  
Central abstraction layer for **persistent object/blob storage** — managing metadata, access control, lifecycle, sharing links, and integration with underlying storage backends (S3-compatible, MinIO, GCS, local FS for dev).

**Key Fields**

| Field            | Type      | Required | Description                                           | Example / Notes                                  |
|------------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`             | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `field`          | string    | no       | Contextual field name (avatar, invoice_pdf, …)        | Helps UI rendering & validation                  |
| `title`          | string    | no       | Original / display filename                           | "profile-vahid-2026.jpg"                         |
| `state`          | enum      | no       | Lifecycle state                                       | `active`, `pending`, `deleted`, `quarantined`    |
| `original`       | string    | yes      | Original filename provided by client                  | "my photo (1).jpeg"                              |
| `encoding`       | string    | no       | Content encoding                                      | `7bit`, `base64`                                 |
| `mimetype`       | string    | yes      | MIME type                                             | `image/jpeg`, `application/pdf`                  |
| `size`           | number    | yes      | File size in bytes                                    | 1248576                                          |
| `bucket`         | string    | yes      | Storage bucket name                                   | `wenex-avatars`, `invoices-2026`                 |
| `key`            | string    | yes      | Object key / path in storage                          | `u/1234/avatars/2026-02/profile.jpg`             |
| `acl`            | string    | yes      | Access control level                                  | `private`, `public-read`, `signed`               |
| `content_type`   | string    | no       | Override Content-Type header                          | —                                                |
| `storage_class`  | string    | no       | Storage tier (standard, infrequent, glacier, …)       | Cost / access optimization                       |
| `location`       | string    | yes      | Full public / internal URL                            | `https://storage.wenex.org/...`                  |
| `etag`           | string    | no       | ETag / MD5 for integrity & caching                    | —                                                |
| `createdAt`      | Date      | yes      | Upload timestamp                                      | —                                                |
| `updatedAt`      | Date      | yes      | Last metadata change                                  | —                                                |

**Relationships & Integrations**

- Referenced by almost every service: `identity.profiles`, `content.posts`, `financial.invoices`, `career.products`, `logistic.cargoes` (proof-of-delivery)
- → `context.settings` / `domain.clients` (per-tenant bucket quotas)
- → `touch.notices` (upload complete, virus scan result)
- Provides signed URLs → frontend SDK / mobile apps

**Typical Use Cases**

- User uploads new avatar → resized variants created
- Invoice PDF generated → stored & attached to `financial.invoices`
- Proof-of-delivery photo taken by driver → linked to `logistic.travels`
- Secure temporary download link for exported report

### Stats

**Purpose**  
Centralized, high-throughput **counter and time-series aggregation** engine — tracking numeric metrics over time (daily, monthly, yearly) for usage analytics, billing, monitoring, leaderboards, and operational dashboards.

**Key Fields**

| Field     | Type      | Required | Description                                           | Example / Notes                                  |
|-----------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`      | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`    | enum      | yes      | StatType (counter, gauge, histogram, …)               | `counter`, `daily-active-users`                  |
| `key`     | enum      | yes      | StatKey (strongly-typed metric name)                  | `api:requests`, `storage:bytes`, `messages:sent` |
| `obj`     | string    | no       | Target entity (user, client, account, …)              | Scope of the statistic                           |
| `flag`    | string    | no       | Additional dimension / tag                            | e.g. `country:IR`, `plan:enterprise`             |
| `day`     | number    | no       | Day of month (1–31)                                   | For daily buckets                                |
| `month`   | number    | no       | Month (1–12)                                          | —                                                |
| `year`    | number    | yes      | Year                                                  | 2026                                             |
| `hours`   | number[]  | no       | 24-slot array (hourly values)                         | For intra-day patterns                           |
| `days`    | number[]  | no       | 31-slot array (daily values in month)                 | —                                                |
| `months`  | number[]  | no       | 12-slot array (monthly values in year)                | —                                                |
| `createdAt`| Date     | yes      | —                                                     | —                                                |
| `updatedAt`| Date     | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- Incremented via events from nearly every service
- → `general.activities` (raw event source)
- Used by → admin dashboards, billing engine, rate-limiters
- Aggregated → `context.settings` (quota enforcement)

**Typical Use Cases**

- Track total storage used per client → enforce quota
- Count daily active users / API requests per tenant
- Monitor messages sent per channel/account
- Generate monthly usage report for enterprise billing
- Detect anomalies (sudden spike in file uploads)
