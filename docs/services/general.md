# Wenex Platform Documentation — General Service

## General Service

**Description**  
The **General Service** acts as the **cross-cutting utility and event backbone** of the Wenex platform. It provides generic, reusable building blocks that are not strongly tied to any single domain but are essential for observability, extensibility, history tracking, lightweight content attachment, calendar/time-based entities, and process orchestration metadata.

This service is deliberately kept domain-agnostic so that almost every other microservice can depend on it for common patterns: activity feeds, audit trails, generic attachments/metadata, calendar events, and lightweight workflow orchestration hooks.

**Use Cases**

- Real-time activity / audit logs visible in admin panels and user dashboards
- Storing generic metadata, configuration snippets, or temporary artifacts
- Attaching calendar events to orders, tickets, campaigns, training sessions
- Lightweight internal workflows and state machines (approval chains, content review, onboarding steps)
- Cross-service event sourcing / timeline reconstruction
- Comment threads on non-content entities (products, profiles, invoices, orders…)
- Generating timeline views in CRM, project management, or customer 360° dashboards
- Supporting IoT / monitoring use cases with timestamped generic events

**Modules**

### Activities

**Purpose**  
Captures timestamped, typed **audit trail**, **user actions**, **system events**, and **important state changes** across the entire platform in a unified, queryable format.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`      | enum      | yes      | ActivityType (create, update, login, payment, …)      | `user:login`, `order:paid`, `ticket:assigned`    |
| `state`     | enum      | no       | Optional outcome / status                             | `success`, `failed`, `pending`                   |
| `source`    | string    | no       | Originating service or context                        | `financial`, `identity`, `api-gateway`           |
| `message`   | string    | yes      | Human-readable summary                                | "User #u1234 completed payment of $49.99"        |
| `details`   | any       | no       | Structured payload / diff                             | `{ before: {}, after: {}, delta: {} }`           |
| `metadata`  | any       | no       | Contextual info (IP, user-agent, saga ID, …)          | —                                                |
| `createdAt` | Date      | yes      | Event timestamp                                       | —                                                |

**Relationships & Integrations**

- Referenced by almost every service
- → `identity.users`, `conjoint.accounts`, `domain.clients` (actor)
- → `essential.sagas` (correlation)
- Feeds → activity streams, admin audit logs, security monitoring

**Typical Use Cases**

- User login / failed login attempts
- Order status transitions (created → paid → shipped)
- Ticket assignment / resolution events
- Configuration change audit trail

### Artifacts

**Purpose**  
Generic key-value store for **transient or semi-permanent unstructured / semi-structured data** — configuration blobs, export files, temporary processing results, cached computations, or extension-specific payloads.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `key`       | string    | yes      | Unique identifier within context                      | `export:orders-2026-02`, `cache:stats:daily`     |
| `type`      | enum      | yes      | ValueType (json, text, binary, yaml, …)               | `json`, `csv`, `pdf`                             |
| `value`     | any       | no       | Actual content (small) or reference                   | JSON object, short text, or File ID              |
| `createdAt` | Date      | yes      | —                                                     | —                                                |
| `updatedAt` | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- Often linked to → `special.files` when value is large
- Used by export/import features, reporting, temporary state

**Typical Use Cases**

- Store last exported report metadata
- Cache complex dashboard computation result
- Hold temporary migration / import state
- Store extension-specific configuration blob

### Comments

**Purpose**  
**Generic comment / annotation** capability that can be attached to almost any entity across services (not limited to content/posts/tickets like in Content service).

**Key Fields**

| Field         | Type       | Required | Description                                           | Example / Notes                                  |
|---------------|------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`          | string     | yes      | MongoDB ObjectId                                      | —                                                |
| `type`        | string     | no       | Comment subtype                                       | `internal`, `review`, `note`                     |
| `content`     | string     | yes      | Comment body                                          | Markdown supported                               |
| `parent`      | string     | no       | Parent comment (threading)                            | —                                                |
| `state`       | enum       | no       | Visibility / moderation state                         | `visible`, `hidden`                              |
| `visibility`  | string     | no       | Access scope                                          | `internal`, `team`, `public`                     |
| `rate`        | number     | no       | Optional rating value                                 | —                                                |
| `reactions`   | Reaction[] | no       | Emoji reactions                                       | —                                                |
| `mentions`    | string[]   | no       | Mentioned users                                       | —                                                |
| `attachments` | string[]   | no       | File references                                       | —                                                |

**Relationships & Integrations**

- Attached to arbitrary entities via reference fields
- → `special.files`
- → `touch.notices` (mentions)

**Typical Use Cases**

- Internal notes on invoices / transactions
- Team review comments on products / campaigns
- Feedback on user profiles or accounts
- Moderation notes on reported content

### Events

**Purpose**  
Calendar / time-boxed entities — meetings, deadlines, campaigns, webinars, maintenance windows, recurring reminders — that can be attached to users, accounts, businesses, or system processes.

**Key Fields**

| Field         | Type      | Required | Description                                           | Example / Notes                                  |
|---------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`          | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `title`       | string    | yes      | Event name                                            | "Q1 Product Launch Webinar"                      |
| `subtitle`    | string    | no       | Secondary title                                       | —                                                |
| `s_date`      | Date      | yes      | Start time                                            | —                                                |
| `e_date`      | Date      | yes      | End time                                              | —                                                |
| `place`       | string    | no       | Physical or virtual location                          | "Zoom Meeting ID: 123 456 789"                   |
| `location`    | string    | no       | Location reference (Location ID)                      | —                                                |
| `attendees`   | string[]  | no       | Participant user/account IDs                          | —                                                |
| `organizers`  | string[]  | no       | Responsible user/account IDs                          | —                                                |
| `status`      | string    | no       | Event status                                          | `planned`, `ongoing`, `completed`, `canceled`    |
| `category`    | string    | no       | Classification                                        | `meeting`, `campaign`, `maintenance`             |
| `color`       | string    | no       | UI color hint                                         | `#FF5733`                                        |
| `correlation` | string    | no       | Link to recurring series                              | —                                                |

**Relationships & Integrations**

- → `logistic.locations`
- → `identity.users` / `conjoint.accounts`
- → `touch.notices` / `touch.emails` (reminders)

**Typical Use Cases**

- Schedule team sync meeting
- Plan product launch campaign timeline
- Set payment due date reminder
- Schedule server maintenance window

### Workflows

**Purpose**  
Lightweight **process / approval / state machine definitions** and **instance metadata** — complements the more heavyweight saga orchestration in `essential.sagas`.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `name`      | string    | yes      | Workflow identifier                                   | `content-approval`, `refund-request`             |
| `type`      | string    | no       | Category                                              | `approval`, `onboarding`, `escalation`           |
| `state`     | string    | yes      | Current step / status                                 | `pending-review`, `approved`, `rejected`         |
| `data`      | any       | no       | Context / payload                                     | —                                                |
| `createdAt` | Date      | yes      | —                                                     | —                                                |
| `updatedAt` | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- Often used together with → `essential.sagas`
- → `content.tickets`, `financial.invoices`, `career.orders`
- Triggers → notifications & activities

**Typical Use Cases**

- Content publishing approval chain
- Refund request multi-level approval
- New employee onboarding checklist
- Campaign launch gate reviews
