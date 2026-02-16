# Wenex Platform Documentation — Touch Service

## Touch Service

**Description**  
The **Touch** service is the unified **multi-channel outbound notification & messaging engine** of the Wenex platform.

It is responsible for delivering time-sensitive, user-facing messages through the most appropriate channel(s) — **push notifications**, **in-app notices**, **emails**, and **SMS** — while offering templating, personalization, delivery tracking, retry logic, rate limiting, provider abstraction, and rich analytics.

The service follows a **channel-agnostic design** — most business events trigger notifications through a single high-level interface, and Touch decides (or receives instructions about) which concrete channel(s) should be used based on user preferences, priority, context, and delivery guarantees.

**Use Cases**

- Order / payment status updates in e-commerce
- New message & mention alerts in communication features
- Account security & verification codes (OTP)
- Subscription renewal reminders & payment failures
- Marketing & promotional campaigns
- Critical system announcements & maintenance windows
- Delivery & shipment status updates in logistics
- KYC/verification & compliance notifications in banking & crypto
- Daily/weekly summary digests in e-learning & productivity tools

**Modules**

### Emails

**Purpose**  
Handles **outbound email delivery** — including transactional emails, marketing campaigns, HTML templated messages, attachments, and SMTP provider abstraction with delivery & bounce tracking.

**Key Fields**

| Field           | Type       | Required | Description                                          | Example / Notes                              |
|-----------------|------------|----------|------------------------------------------------------|----------------------------------------------|
| `id`            | string     | yes      | MongoDB ObjectId                                     | —                                            |
| `provider`      | enum       | yes      | EmailProvider                                        | `sendgrid`, `ses`, `postmark`, `smtp`        |
| `to`            | string[]   | yes      | Recipient email addresses                            | —                                            |
| `cc`            | string[]   | no       | Carbon copy                                          | —                                            |
| `bcc`           | string[]   | no       | Blind carbon copy                                    | —                                            |
| `from`          | string     | yes      | Sender address                                       | `no-reply@wenex.org`                         |
| `subject`       | string     | yes      | Email subject line                                   | —                                            |
| `html`          | string     | no       | HTML body                                            | —                                            |
| `text`          | string     | no       | Plain text fallback                                  | —                                            |
| `attachments`   | string[]   | no       | File references (File IDs)                           | —                                            |
| `date`          | Date       | no       | Send timestamp                                       | —                                            |
| `reply_to`      | string[]   | no       | Reply-to addresses                                   | —                                            |
| `in_reply_to`   | string     | no       | Message-ID this is replying to                       | Threading support                            |
| `smtp`          | EmailSmtp  | no       | Delivery information & response from SMTP provider   | Only populated after delivery attempt        |
| `status`        | enum       | no       | Final delivery status                                | `sent`, `delivered`, `bounced`, `failed`     |

**Relationships & Integrations**

- → `special.files` (attachments)
- → `context.settings` / `identity.users` (user email preferences)
- → `general.activities` (send & delivery events)

**Typical Use Cases**

- Welcome / verification / password reset emails
- Invoice & receipt delivery
- Weekly summary / digest emails
- Marketing campaign / newsletter

### Notices

**Purpose**  
Manages **in-app notification center** messages — rich, persistent, actionable items that appear in the user’s notification inbox / bell / drawer.

**Key Fields**

| Field         | Type           | Required | Description                                          | Example / Notes                              |
|---------------|----------------|----------|------------------------------------------------------|----------------------------------------------|
| `id`          | string         | yes      | MongoDB ObjectId                                     | —                                            |
| `type`        | enum           | yes      | NoticeType                                           | `info`, `success`, `warning`, `system`       |
| `title`       | string         | yes      | Main headline                                        | —                                            |
| `subtitle`    | string         | no       | Secondary line                                       | —                                            |
| `content`     | string         | yes      | Main body / description                              | Markdown supported                           |
| `category`    | string         | no       | Grouping / filtering category                        | —                                            |
| `visited`     | boolean        | no       | Has the user seen this notice?                       | —                                            |
| `visited_at`  | Date           | no       | When it was first seen                               | —                                            |
| `thumbnail`   | string         | no       | Small preview image                                  | File ID                                      |
| `attachments` | string[]       | no       | Supporting files                                     | —                                            |
| `actions`     | NoticeAction[] | no       | Call-to-action buttons                               | Deep links, confirmations, etc               |

**Relationships & Integrations**

- → `special.files` (thumbnail)
- → `identity.users` / `conjoint.accounts` (target recipient)
- Very frequently used together with **pushes**

**Typical Use Cases**

- "Your order has shipped!"
- "New message from Sarah"
- "Security alert – new login from unknown device"
- "Your subscription will renew in 3 days"

### Pushes

**Purpose**  
Handles **mobile/web push notifications** using the **Web Push** standard — including VAPID key management, subscription storage, delivery attempts, and failure tracking.

**Key Fields**

| Field        | Type      | Required | Description                                          | Example / Notes                              |
|--------------|-----------|----------|------------------------------------------------------|----------------------------------------------|
| `id`         | string    | yes      | MongoDB ObjectId                                     | —                                            |
| `session`    | string    | yes      | Related browser / app session                        | —                                            |
| `keys`       | PushKeys  | yes      | Web Push encryption keys (p256dh + auth)             | —                                            |
| `endpoint`   | string    | yes      | Push subscription endpoint URL                       | —                                            |
| `blacklist`  | string[]  | no       | Reasons / timestamps when this endpoint failed       | Used for exponential backoff & cleanup       |
| `expiration` | number    | yes      | When this subscription should be considered expired  | —                                            |

**Relationships & Integrations**

- ← `identity.sessions` / `conjoint.accounts`
- → **pushes history** (delivery attempts)
- → **notices** (most pushes are paired with a notice)

**Typical Use Cases**

- Instant "New message" push
- Order status change alerts
- Critical security notifications
- Background sync / silent pushes

### Smss

**Purpose**  
Manages **outbound SMS / text message delivery** — including OTP, short transactional messages, provider abstraction, delivery status tracking, and cost monitoring.

**Key Fields**

| Field       | Type      | Required | Description                                          | Example / Notes                              |
|-------------|-----------|----------|------------------------------------------------------|----------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                     | —                                            |
| `provider`  | enum      | yes      | SmsProvider                                          | `kavenegar`, `twilio`, `textlocal`, `farazsms` |
| `message`   | string    | yes      | Text content (usually 160 chars or less)             | —                                            |
| `receptors` | string[]  | yes      | Phone numbers (E.164)                                | —                                            |
| `sender`    | string    | no       | Sender ID / alphanumeric sender                      | —                                            |
| `res`       | any       | no       | Provider response / delivery info                    | Populated after send                         |

**Relationships & Integrations**

- → `identity.users` / `conjoint.contacts` (phone numbers)
- → `general.activities` (send & delivery events)
- Very often used for **OTP** & **critical alerts**

**Typical Use Cases**

- Phone verification / login OTP
- Delivery driver arriving soon
- Payment failed – urgent action required
- Two-factor authentication code
