# Wenex Platform Documentation — Auth Service

## Auth Service

**Description**  
The **Auth** service is the central **authentication, authorization, and credential management** authority of the Wenex platform. It implements secure identity verification, token issuance (JWT, personal tokens, refresh tokens), fine-grained permission enforcement (RBAC + ABAC), OAuth2/OIDC flows (where applicable), and session lifecycle management.

It acts as the single source of truth for deciding **who can do what** across all microservices — enforcing ownership rules, share/group/client-based access, and custom grants defined in the `Core` interface. The service is designed for high security, auditability, low latency, and horizontal scalability.

**Use Cases**

- User login, SSO, passwordless (magic link / OTP), passkey support
- API key / personal access token issuance for developers & integrations
- Machine-to-machine authentication (client credentials flow)
- Fine-grained permission checks in every API request
- Multi-tenant authorization isolation (per client/app)
- Session revocation on suspicious activity or password change
- Token rotation, refresh, and short-lived access token strategy
- Audit trail of authentication events and authorization decisions

**Modules**

### APTs — Authentication Personal Tokens

**Purpose**  
Manages long-lived or scoped **personal access tokens** (PATs / API keys) — used by developers, CI/CD pipelines, mobile apps, external integrations, or scripts to authenticate without full user sessions.

**Key Fields**

| Field         | Type      | Required | Description                                           | Example / Notes                                  |
|---------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`          | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `token`       | string    | no       | Hashed / encrypted final token value                  | Only shown once at creation                      |
| `name`        | string    | yes      | Human-readable name / purpose                         | "CI/CD Pipeline Token", "Mobile App Integration" |
| `secret`      | string    | yes      | Hashed secret / bcrypt value                          | Used for verification                            |
| `expires_at`  | number    | yes      | UNIX timestamp (expiration)                           | —                                                |
| `strict`      | boolean   | no       | Enforce IP/user-agent binding                         | Optional security hardening                      |
| `cid`         | string    | yes      | Client ID (domain.clients) this token is bound to     | Multi-tenancy isolation                          |
| `aid`         | string    | no       | Account ID (conjoint.accounts)                        | Optional grouping                                |
| `uid`         | string    | no       | User ID (identity.users) — owner                      | —                                                |
| `domain`      | string    | yes      | Allowed origin / referer domain                       | CORS / security enforcement                      |
| `scopes`      | Scope[]   | yes      | Granted OAuth-style scopes                            | `["financial:read", "content:write"]`            |
| `subjects`    | string[]  | yes      | Target entities this token can act upon               | User IDs, account IDs, etc.                      |
| `tz` / `lang` | string    | yes      | Context defaults for responses                        | Inherited from user                              |
| `session`     | string    | no       | Linked session ID (if short-lived)                    | —                                                |
| `client_id`   | string    | yes      | OAuth client_id reference                             | —                                                |
| `coworkers`   | string[]  | no       | Team members allowed to manage/revoke this token      | —                                                |

**Relationships & Integrations**

- → `identity.users` / `conjoint.accounts` / `domain.clients`
- → `auth.grants` (permission resolution)
- → `general.activities` (token creation/revocation events)

**Typical Use Cases**

- GitHub Actions / GitLab CI token for Wenex API access
- Third-party integration key with read-only financial scope
- Mobile app long-lived token bound to user + device
- Temporary debug token with short expiration

### Auths

**Purpose**  
Handles **session-based authentication flows** — traditional login, refresh tokens, OAuth authorization code flow, device code flow, and credential validation.

**Key Fields** (typical schema — varies by flow)

| Field              | Type      | Required | Description                                           | Example / Notes                                  |
|--------------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`               | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`             | enum      | yes      | Auth flow type                                        | `password`, `refresh`, `oauth_code`, `otp`       |
| `user`             | string    | yes      | identity.users reference                              | —                                                |
| `client`           | string    | yes      | domain.clients reference                              | —                                                |
| `code` / `token`   | string    | yes      | One-time code or JWT                                  | Short-lived in most cases                        |
| `refresh_token`    | string    | no       | Long-lived refresh token                              | Rotated on use                                   |
| `scopes`           | Scope[]   | yes      | Requested / granted scopes                            | —                                                |
| `state`            | string    | no       | OAuth state parameter                                 | CSRF protection                                  |
| `redirect_uri`     | string    | no       | OAuth redirect target                                 | —                                                |
| `expires_at`       | number    | yes      | Expiration timestamp                                  | —                                                |
| `ip` / `agent`     | string    | yes      | Client fingerprint                                    | Security monitoring                              |
| `createdAt`        | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- → `identity.sessions` (active session tracking)
- → `auth.apts` (hybrid flows)
- → `general.activities` (login success/failure)

**Typical Use Cases**

- Browser login → JWT + refresh token issuance
- Mobile app OAuth PKCE flow
- OTP / magic-link authentication
- Refresh token rotation on every use

### Grants

**Purpose**  
Stores and enforces **fine-grained, policy-based permissions** attached to entities (via `Core` interface) — implementing the layered access model (owner → shares → groups → clients).

**Key Fields**

| Field      | Type       | Required | Description                                           | Example / Notes                                  |
|------------|------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`       | string     | yes      | MongoDB ObjectId                                      | —                                                |
| `subject`  | string     | yes      | User / group / client identifier                      | User ID, group name, client ID                   |
| `action`   | Action     | yes      | Permission action enum                                | `read:own`, `update:share`, `delete:client`      |
| `object`   | Resource   | yes      | Target resource type                                  | `financial/invoices`, `content/posts`            |
| `field`    | string[]   | no       | Field-level restrictions                              | `["amount", "status"]`                           |
| `filter`   | string[]   | no       | Query filters (e.g. only own records)                 | MongoDB-like filter expressions                  |
| `location` | string[]   | no       | Geospatial / context restrictions                     | Rarely used                                      |
| `time`     | GrantTime[]| no       | Time-based validity (cron + duration)                 | Office hours access, temporary grants            |

**Relationships & Integrations**

- Attached to → every `Core`-based entity
- → `auth.apts` / `auth.auths` (token → grant resolution)
- Evaluated in real-time by API gateway / middleware

**Typical Use Cases**

- Allow team member to read but not edit financial invoices
- Restrict client app to only read own messages
- Grant temporary write access during business hours
- Field-level protection on sensitive wallet data
