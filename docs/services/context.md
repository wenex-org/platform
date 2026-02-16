# Wenex Platform Documentation — Context Service

## Context Service

**Description**  
The **Context Service** acts as the centralized, hierarchical configuration and settings engine of the Wenex platform. It provides strongly-typed, scoped, versionable, and observable key-value storage for application-wide defaults, tenant/client-specific overrides, user preferences, feature flags, runtime tuning parameters, and environment-specific behavior controls.

It supports different levels of precedence (global → client/app → organization/account → user), real-time watching/subscription patterns (via event emission), audit trails, and rollback capabilities — making it the single source of truth for almost all tunable behavior in the system.

**Use Cases**

- Global platform defaults (default timezone, language fallback, API rate limits)
- Per-client / per-app branding & feature toggles (SaaS multi-tenancy)
- Organization-level policy enforcement (allowed payment methods, max upload size)
- User-specific preferences (UI theme, notification settings, preferred currency)
- A/B testing & staged rollouts of new features
- Environment-specific overrides (dev vs staging vs prod behavior)
- Runtime tuning of background jobs, queue priorities, cache TTLs
- Compliance & legal settings (data retention periods, GDPR consent flags)

**Modules**

### Configs

**Purpose**  
Stores **strongly-typed, usually immutable or infrequently changed configuration values** that are most often set at deployment, by administrators, or during tenant onboarding. Typically used for infrastructure-related, security-sensitive, or system-wide behavioral settings.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `key`       | enum      | yes      | ConfigKey (strongly typed enum of known config keys)  | `MAX_UPLOAD_SIZE_MB`, `DEFAULT_TZ`, `RATE_LIMIT_RPM` |
| `eid`       | string    | yes      | Entity ID — scope of the config                       | user ID, account ID, client ID, or empty/global  |
| `value`     | any       | no       | Typed value (string, number, boolean, object, array)  | `15`, `true`, `{ "daily": 100, "burst": 300 }`   |
| `status`    | enum      | no       | Operational status                                    | `active`, `disabled`, `deprecated`               |
| `createdAt` | Date      | yes      | Creation timestamp                                    | —                                                |
| `updatedAt` | Date      | yes      | Last modification timestamp                           | —                                                |
| `updatedBy` | string    | no       | User/admin who last changed it                        | Useful for audit                                 |

**Relationships & Integrations**

- Read by almost every service at bootstrap and on-demand
- → `identity.users` / `conjoint.accounts` / `domain.clients` (via `eid`)
- Emits change events → `general.activities` / Kafka topic
- Frequently watched by gateway, auth, rate-limiter, storage services

**Typical Use Cases**

- Set global maximum file upload size: `MAX_UPLOAD_SIZE_MB = 50`
- Define default JWT access token lifetime per client plan
- Disable registration for new users during maintenance (`ALLOW_REGISTRATION = false`)
- Set organization-specific allowed domains for sign-up
- Configure default currency & precision per tenant

### Settings

**Purpose**  
Manages **user/tenant-modifiable preference-like settings** that are changed more frequently by end-users, administrators, or via UI toggles. Usually less security-sensitive and more personalization-oriented than `configs`.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `key`       | string    | yes      | Free-form or lightly validated setting key            | `theme`, `notifications.email.marketing`, `lang` |
| `eid`       | string    | yes      | Entity the setting belongs to                         | user ID, account ID, client ID                   |
| `value`     | any       | no       | Flexible value (string, boolean, number, JSON)        | `"dark"`, `false`, `["en", "fa"]`                |
| `status`    | enum      | no       | Lifecycle / visibility status                         | `active`, `archived`                             |
| `createdAt` | Date      | yes      | Creation timestamp                                    | —                                                |
| `updatedAt` | Date      | yes      | Last modification timestamp                           | —                                                |

**Relationships & Integrations**

- Heavily used by frontend SDK & mobile apps
- → `identity.users`, `conjoint.accounts`, `domain.clients` (via `eid`)
- Change events → `touch.notices` / `touch.pushes` (e.g. theme changed)
- Cached aggressively at edge / client-side

**Typical Use Cases**

- User sets preferred UI theme: `theme = "dark"`
- Account disables marketing emails: `notifications.email.marketing = false`
- User selects default language & fallback languages
- Client enables/disables specific modules/features in their dashboard
- Organization sets default notification channels for members
