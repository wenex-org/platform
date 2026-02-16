# Wenex Platform Documentation — Identity Service

## Identity Service

**Description**  
The **Identity Service** is the central source of truth for **human and non-human principals** in the Wenex ecosystem. It manages user accounts, personal profiles, authentication sessions, identity verification states, and the core lifecycle of digital identities — serving as the foundation for authentication, authorization, personalization, and auditability across all other services.

It follows modern identity best practices: separation of authentication credentials from rich profile data, short-lived session tokens, support for multiple identity providers (email/password, OAuth, SSO, passkeys [future]), multi-factor enforcement hooks, and strong auditability of identity-related events.

**Use Cases**

- User registration, login, password reset, and account recovery flows
- Single sign-on / federated identity for enterprise customers
- Rich user profiles in social, e-learning, marketplace, and community features
- Session management and device revocation in mobile & web applications
- KYC / identity verification workflows in banking, crypto, and regulated platforms
- Personalization (language, timezone, theme) across all client applications
- Audit trail of account access, credential changes, and suspicious activity
- Support for service/bot accounts with restricted capabilities

**Modules**

### Users

**Purpose**  
Core entity representing an **authentication principal** — whether human user, service account, bot, or system identity. Stores minimal credentials, security metadata, and global preferences.

**Key Fields**

| Field         | Type      | Required | Description                                           | Example / Notes                                  |
|---------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`          | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `status`      | enum      | yes      | Account lifecycle status                              | `active`, `suspended`, `disabled`, `pending`     |
| `tz`          | string    | yes      | Preferred timezone (IANA)                             | `Asia/Tehran`, `America/New_York`               |
| `lang`        | string    | yes      | Preferred language (ISO 639-1)                        | `en`, `fa`, `es`                                 |
| `region`      | string    | yes      | Preferred region/locale                               | `IR`, `US`, `EU`                                 |
| `email`       | string    | no       | Primary email (unique when present)                   | Verified via OTP/magic link                      |
| `phone`       | string    | no       | Primary phone (E.164)                                 | Verified via SMS OTP                             |
| `secret`      | string    | no       | Hashed password / passkey credential                  | bcrypt / argon2 / webauthn                       |
| `username`    | string    | no       | Unique username / handle                              | `@vahidv`, `admin`                               |
| `password`    | string    | no       | Legacy / transitional password hash                   | Only during migration phases                     |
| `subjects`    | string[]  | yes      | Associated subject identifiers                        | OIDC sub, external provider IDs                  |
| `createdAt`   | Date      | yes      | Account creation timestamp                            | —                                                |
| `updatedAt`   | Date      | yes      | Last profile/credential change                        | —                                                |
| `lastLoginAt` | Date      | no       | Most recent successful authentication                 | Used for inactivity detection                    |

**Relationships & Integrations**

- → `identity.profiles` (1:1 rich profile)
- → `identity.sessions` (multiple active sessions)
- → `auth.apts`, `auth.auths`, `auth.grants` (token issuance)
- → `general.activities` (login, credential change events)
- → `context.settings` (user-specific preferences)

**Typical Use Cases**

- Standard email + password registration & login
- Phone-based authentication for emerging markets
- Service/bot account creation with API key only
- Account suspension after repeated failed logins

### Profiles

**Purpose**  
Rich, mutable, and display-oriented representation of a person or entity — separated from authentication credentials to allow flexible updates without affecting login security.

**Key Fields**

| Field           | Type      | Required | Description                                           | Example / Notes                                  |
|-----------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`            | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`          | enum      | yes      | ProfileType (personal, organization, bot, …)          | `personal`, `business`                           |
| `gender`        | enum      | yes      | Gender (for personalization / demographics)           | `male`, `female`, `other`, `prefer_not_to_say`   |
| `state`         | enum      | yes      | Verification / moderation state                       | `unverified`, `verified`, `rejected`             |
| `cover`         | string    | no       | Cover / banner image                                  | File ID                                          |
| `avatar`        | string    | no       | Profile picture                                       | File ID                                          |
| `gallery`       | string[]  | no       | Additional images                                     | —                                                |
| `nickname`      | string    | no       | Display name / alias                                  | "Vahid V."                                       |
| `first_name`    | string    | no       | —                                                     | —                                                |
| `middle_name`   | string    | no       | —                                                     | —                                                |
| `last_name`     | string    | no       | —                                                     | —                                                |
| `nationality`   | string    | no       | ISO 3166-1 alpha-2 country code                       | `IR`, `US`                                       |
| `national_code` | string    | no       | National ID / passport / tax ID                       | KYC-relevant                                     |
| `birthdate`     | Date      | no       | Date of birth                                         | Age gating & personalization                     |
| `verified_at`   | Date      | no       | KYC / identity verification timestamp                 | —                                                |
| `verified_by`   | string    | no       | Verifier (admin / system / provider)                  | —                                                |
| `createdAt`     | Date      | yes      | —                                                     | —                                                |
| `updatedAt`     | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- ← `identity.users` (1:1 link)
- → `conjoint.accounts`, `career.businesses`, `domain.clients` (identity source)
- → `special.files` (avatar, cover, gallery)
- → `touch.notices` (profile update notifications)

**Typical Use Cases**

- Full name + avatar shown in chat, comments, marketplace
- Age verification for restricted content
- KYC onboarding in crypto / banking verticals
- Organization profile for team / brand accounts

### Sessions

**Purpose**  
Tracks active **authenticated sessions** — including device/browser metadata, expiration, revocation status, and IP/user-agent fingerprinting for security monitoring.

**Key Fields**

| Field       | Type    | Required | Description                                           | Example / Notes                                  |
|-------------|---------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string  | yes      | MongoDB ObjectId or session token hash                | —                                                |
| `ip`        | string  | yes      | Client IP address                                     | IPv4 / IPv6                                      |
| `agent`     | string  | yes      | User-agent string                                     | Browser / OS / device fingerprint                |
| `expiration`| number  | yes      | UNIX timestamp (seconds) when session expires         | Short-lived (30 min – 30 days)                   |
| `createdAt` | Date    | yes      | Session creation time                                 | —                                                |
| `revokedAt` | Date    | no       | Revocation timestamp (logout, suspicious activity)    | —                                                |

**Relationships & Integrations**

- ← `identity.users` (session owner)
- Used by → `auth` services for token validation
- → `general.activities` (login, logout, revocation events)
- Supports → device management UI (see all sessions, revoke)

**Typical Use Cases**

- Browser session with refresh token rotation
- Mobile app persistent session with biometric lock
- Revoke all sessions on password change / suspicious login
- Multi-device awareness & forced logout on new login
