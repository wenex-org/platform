# Wenex Platform Documentation — Domain Service

## Domain Service

**Description**  
The **Domain Service** serves as the **identity and boundary layer** for external applications, tenants, and API consumers in the Wenex ecosystem. It manages **registered applications** (both first-party and third-party), **OAuth2/OIDC clients**, **API access credentials**, **domain whitelisting**, **service integrations**, and **plan/subscription metadata**. This service is the foundation of multi-tenancy, secure API access, developer onboarding, and SaaS-style extensibility — enabling other services to enforce authorization, rate limiting, branding, and feature gating based on client context.

**Use Cases**

- Registering third-party apps that integrate with Wenex APIs (Banking → fintech partners, E-Learning → LMS connectors, Crypto → wallet plugins)
- Issuing secure credentials for mobile apps, SPAs, server-to-server integrations, and embedded SDKs
- Implementing multi-tenant SaaS with per-tenant domains, branding, and feature toggles
- Managing OAuth2 clients for authorization code, client credentials, and PKCE flows
- Enforcing domain restrictions and CORS policies for frontend applications
- Supporting marketplace-style app ecosystem where partners publish extensions
- Providing audit trail and rotation capabilities for long-lived API keys / secrets
- Differentiating free, pro, enterprise plans with varying scopes and token lifetimes

**Modules**

### Apps

**Purpose**  
Represents **first-party or platform-managed applications** (Wenex dashboard, mobile apps, embedded widgets, etc.). Stores metadata, changelog history, supported scopes, and token behavior — used mainly for internal branding, versioning, and SDK compatibility tracking.

**Key Fields**

| Field                | Type           | Required | Description                                           | Example / Notes                                  |
|----------------------|----------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`                 | string         | yes      | MongoDB ObjectId                                      | —                                                |
| `type`               | enum           | yes      | AppType (web, mobile, desktop, embedded, …)           | `web`, `mobile`, `server`                        |
| `cid`                | string         | yes      | Canonical / short identifier                          | `wenex-dashboard`, `wenex-wallet-ios`            |
| `name`               | string         | no       | Human-readable name                                   | "Wenex Admin Dashboard"                          |
| `status`             | enum           | yes      | Operational status                                    | `active`, `deprecated`, `maintenance`            |
| `url`                | string         | no       | Main application URL                                  | `https://app.wenex.org`                          |
| `logo`               | string         | no       | Logo file reference                                   | File ID                                          |
| `site`               | string         | no       | Marketing / homepage URL                              | —                                                |
| `slogan`             | string         | no       | Short tagline                                         | "Build faster. Scale smarter."                   |
| `scopes`             | Scope[]        | no       | Default / supported OAuth scopes                      | `["profile", "financial:read"]`                  |
| `grant_types`        | GrantType[]    | no       | Allowed OAuth grant types                             | `["authorization_code", "client_credentials"]`   |
| `access_token_ttl`   | number         | no       | Default access token lifetime (seconds)               | 3600 (1 hour)                                    |
| `refresh_token_ttl`  | number         | no       | Refresh token lifetime (seconds)                      | 2592000 (30 days)                                |
| `change_logs`        | AppChangeLog[] | no       | Version history with semver and changes               | Array of changelog entries                       |
| `createdAt`          | Date           | yes      | Creation timestamp                                    | —                                                |
| `updatedAt`          | Date           | yes      | Last modification timestamp                           | —                                                |

**Relationships & Integrations**

- → `domain.clients` (apps often have associated client credentials)
- → `auth.grants` / `auth.apts` (scope & token issuance)
- Emits events → `general.activities` on version / status changes
- Used by SDKs to display correct branding & changelog

**Typical Use Cases**

- Track versions and breaking changes of the official Wenex mobile app
- Show changelog modal in dashboard after update
- Define baseline scopes for first-party applications
- Deprecate legacy desktop app gracefully

### Clients

**Purpose**  
Manages **external / third-party OAuth2 clients** — including credentials (`client_id`, `client_secret`, `api_key`), allowed domains, redirect URIs (implicit via domains), granted scopes, token lifetimes, and linked integration configurations (e.g. webhooks, storage providers).

**Key Fields**

| Field                | Type             | Required | Description                                           | Example / Notes                                  |
|----------------------|------------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`                 | string           | yes      | MongoDB ObjectId                                      | —                                                |
| `name`               | string           | yes      | Client / application name                             | "Acme Trading Bot"                               |
| `plan`               | enum             | yes      | ClientPlan (free, pro, enterprise, partner, …)        | `enterprise`                                     |
| `url`                | string           | no       | Application homepage                                  | `https://acme.trade`                             |
| `logo`               | string           | no       | Logo file reference                                   | —                                                |
| `site`               | string           | no       | Documentation / marketing site                        | —                                                |
| `slogan`             | string           | no       | Short description                                     | —                                                |
| `state`              | enum             | yes      | Lifecycle state                                       | `active`, `suspended`, `rejected`                |
| `status`             | enum             | yes      | Operational status                                    | `healthy`, `rate-limited`                        |
| `api_key`            | string           | yes      | Long-lived API key (alternative to OAuth)             | Rotatable                                        |
| `client_id`          | string           | yes      | OAuth2 client identifier                              | Public                                       |
| `client_secret`      | string           | yes      | OAuth2 client secret (server-to-server)               | Rotatable, never exposed to frontend             |
| `expiration_date`    | Date             | yes      | Credentials validity end date                         | Auto-revoke after date                           |
| `access_token_ttl`   | number           | no       | Custom access token lifetime                          | Override plan default                            |
| `refresh_token_ttl`  | number           | no       | Custom refresh token lifetime                         | —                                                |
| `scopes`             | Scope[]          | yes      | Granted OAuth scopes                                  | `["financial:read", "financial:write"]`          |
| `whitelist`          | string[]         | no       | Allowed CORS / redirect origins                       | `["https://app.acme.trade"]`                     |
| `coworkers`          | string[]         | no       | Team members who can manage this client               | User IDs                                         |
| `grant_types`        | GrantType[]      | yes      | Allowed OAuth flows                                   | `["client_credentials", "authorization_code"]`   |
| `domains`            | ClientDomain[]   | yes      | Registered domains & status                           | Array of domain objects                          |
| `services`           | ClientService[]  | no       | Configured integrations (webhooks, storage, …)        | e.g. S3 bucket config, webhook URL               |
| `createdAt`          | Date             | yes      | Creation timestamp                                    | —                                                |
| `updatedAt`          | Date             | yes      | Last modification timestamp                           | —                                                |

**Relationships & Integrations**

- → `domain.apps` (optional link to first-party app template)
- → `auth.grants` / `auth.auths` (token issuance & validation)
- → `context.configs` / `context.settings` (client-specific overrides)
- → `special.files` (logo)
- Emits → `general.activities` (credential rotation, suspension)

**Typical Use Cases**

- Onboard fintech partner with client credentials flow + restricted scopes
- Register SPA with PKCE + domain whitelist for secure frontend access
- Issue long-lived API key for IoT device fleet integration
- Suspend client after security incident → immediate token revocation
- Configure per-client webhook endpoint for real-time transaction events
