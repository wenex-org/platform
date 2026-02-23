# Wenex Platform Documentation — Conjoint Service

## Conjoint Service

**Description**  
The **Conjoint Service** provides the foundational building blocks for **real-time, multi-party communication** and **social interaction** within the Wenex ecosystem. It implements flexible, scalable abstractions for messaging, group/channel-based conversations, contact management, and membership/authorization patterns — serving as the communication backbone for chat, community, customer support, team collaboration, social features, and notification surfaces across many verticals.

**Use Cases**

- Real-time customer support & live chat in e-commerce & banking
- Team & project communication in enterprise & remote work tools
- Community & discussion forums in e-learning platforms
- Private & group messaging in crypto wallets & DeFi apps
- Internal employee communication & announcements
- Multi-channel support ticketing escalation & follow-up
- Social features in marketplace & sharing-economy apps
- Push + in-app messaging hybrid experiences

**Modules**

### Accounts

**Purpose**  
Central entity representing a **communication identity** (personal, bot, organization, service account, etc.). Acts as the participant / sender / receiver in messaging flows and channel memberships.

**Key Fields**

| Field       | Type     | Required | Description                                      | Example / Notes                                 |
|-------------|----------|----------|--------------------------------------------------|-------------------------------------------------|
| `id`        | string   | yes      | MongoDB ObjectId                                 | —                                               |
| `type`      | enum     | yes      | AccountType (personal, bot, organization, …)     | `personal`, `service`, `bot`                    |
| `profile`   | string   | no       | Reference to Identity → Profile                  | Used for rich display name, avatar, etc.        |
| `bio`       | string   | no       | Short public description                         | 160 characters max                              |
| `status`    | string   | no       | Current emoji/text status                        | "🍵 Working", "🚀"                              |
| `createdAt` | Date     | yes      | Creation timestamp                               | —                                               |
| `updatedAt` | Date     | yes      | Last modification timestamp                      | —                                               |

**Relationships & Integrations**

- → `identity.profiles` (optional rich identity)
- ← `conjoint.channels` (via ownership / admin)
- ← `conjoint.members` (participation)
- ← `conjoint.messages` (author)

**Typical Use Cases**

- Personal user account used in private chats
- Official brand/service account in public channels
- Customer support bot account
- Organization-wide announcement account

### Channels

**Purpose**  
Named communication containers that support one-to-many and many-to-many messaging patterns (broadcast, group chat, topic-based rooms, support queues, announcement feeds, etc.).

**Key Fields**

| Field              | Type     | Required | Description                                          | Example / Notes                             |
|--------------------|----------|----------|------------------------------------------------------|---------------------------------------------|
| `id`               | string   | yes      | MongoDB ObjectId                                     | —                                           |
| `type`             | enum     | yes      | ChannelType (private, group, public, broadcast, …)   | `group`, `broadcast`, `support`             |
| `scope`            | enum     | yes      | ChannelScope (private, organization, public, …)      | `organization`, `public`                    |
| `name`             | string   | no       | Machine-readable identifier                          | `team-alpha`, `general`                     |
| `title`            | string   | no       | Human-readable name                                  | "Marketing Team", "Product Announcements"   |
| `profile`          | string   | no       | Optional avatar/profile reference                    | —                                           |
| `account`          | string   | no       | Owning / main account (for broadcast channels)       | —                                           |
| `pinned_messages`  | string[] | no       | Array of important message IDs                       | —                                           |
| `state`            | enum     | no       | Lifecycle state                                      | `active`, `archived`                        |
| `status`           | enum     | no       | Operational status                                   | —                                           |

**Relationships & Integrations**

- ← `conjoint.members` (participants)
- ← `conjoint.messages` (content)
- → `identity.profiles` / `conjoint.accounts` (visual identity)

**Typical Use Cases**

- Company-wide announcement channel
- Project-specific team group
- Public community discussion room
- Customer support queue channel

### Members

**Purpose**  
Defines **participation** and **authorization** of an account inside a channel (role + fine-grained permissions).

**Key Fields**

| Field         | Type     | Required | Description                               | Example / Notes                          |
|---------------|----------|----------|-------------------------------------------|------------------------------------------|
| `id`          | string   | yes      | MongoDB ObjectId                          | —                                        |
| `channel`     | string   | yes      | Channel reference                         | —                                        |
| `account`     | string   | yes      | Account reference                         | —                                        |
| `role`        | string   | no       | Named role (admin, moderator, member, …)  | `admin`, `member`, `guest`               |
| `permissions` | string[] | no       | Granular permissions                      | `["message:send", "pin:add"]`            |

**Relationships & Integrations**

- → `conjoint.channels`
- → `conjoint.accounts`

**Typical Use Cases**

- Promote user to channel admin
- Restrict guests to read-only
- Grant temporary moderator rights
- Implement custom role-based access

### Contacts

**Purpose**  
User-maintained address book / quick-access list of frequently communicated accounts (people, services, bots).

**Key Fields**

| Field      | Type   | Required | Description                               | Example / Notes                     |
|------------|--------|----------|-------------------------------------------|-------------------------------------|
| `id`       | string | yes      | MongoDB ObjectId                          | —                                   |
| `type`     | enum   | yes      | ContactType                               | `person`, `service`, `bot`          |
| `phone`    | string | no       | Phone number                              | E.164 format                        |
| `email`    | string | no       | Email address                             | —                                   |
| `account`  | string | no       | Linked Conjoint Account                   | Preferred linking method            |
| `nickname` | string | no       | Custom display name                       | "Sarah – Designer"                  |

**Relationships & Integrations**

- → `conjoint.accounts` (strong preference)
- → `identity.profiles` (fallback rich data)

**Typical Use Cases**

- Quick-start private chat from address book
- Favorite support agents / bots
- Import phone contacts → match existing users

### Messages

**Purpose**  
Core content unit of communication — supports rich text, media, reactions, threading, forwarding, scheduling, mentions, etc.

**Key Fields**

| Field             | Type      | Required | Description                                      | Example / Notes                             |
|-------------------|-----------|----------|--------------------------------------------------|---------------------------------------------|
| `id`              | string    | yes      | MongoDB ObjectId                                 | —                                           |
| `type`            | enum      | yes      | MessageType (text, image, file, system, …)       | `text`, `file`, `action`                    |
| `content`         | any       | yes      | Main payload (string, object, array…)            | —                                           |
| `caption`         | string    | no       | Optional description for media                   | —                                           |
| `channel`         | string    | no       | Target channel (group/community)                 | Mutually exclusive with direct messaging    |
| `account`         | string    | no       | Target account (1:1 messaging)                   | —                                           |
| `mentions`        | string[]  | no       | Mentioned user/account IDs                       | —                                           |
| `reply_to`        | string    | no       | Referenced message (threading)                   | —                                           |
| `edited_at`       | Date      | no       | Last edit timestamp                              | —                                           |
| `delivered_at`    | Date      | no       | Delivery confirmation                            | —                                           |
| `views`           | number    | no       | View counter (groups & channels)                 | —                                           |
| `reactions`       | Reaction[]| no       | Emoji reactions                                  | —                                           |
| `scheduled_at`    | Date      | no       | Future send time                                 | —                                           |

**Relationships & Integrations**

- → `conjoint.channels` / direct `conjoint.accounts`
- → `touch.pushes` / `touch.notices` (delivery)
- → `special.files` (attachments)
- → `general.reactions`

**Typical Use Cases**

- Sending rich text + image in group chat
- Replying in thread
- Mentioning team member → trigger notification
- Scheduling announcement message
- Forwarding important message across channels
