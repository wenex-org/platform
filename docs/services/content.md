# Wenex Platform Documentation — Content Service

## Content Service

**Description**  
The **Content Service** is the central microservice responsible for managing **user-generated and moderated content** with rich structure, threading, rating/reaction capabilities, and lifecycle states. It powers blog-like posts, knowledge-base articles, support tickets (including escalation & resolution workflows), and lightweight note-taking / annotation features. Designed for flexibility, it supports nested threading, rich media attachments, visibility controls, and integration with notification & activity streams.

**Use Cases**

- Public blog/news section in e-commerce and corporate portals
- Internal knowledge base & how-to guides in enterprise platforms
- Customer support ticket system with threaded replies & resolution tracking
- Community-driven Q&A or discussion threads in e-learning platforms
- Feedback/review collection with ratings & sentiment analysis hooks
- Lightweight internal note-taking & personal knowledge management
- Moderated content publishing workflows in crypto & community platforms
- Article/comment system for marketplace product pages

**Modules**

### Posts

**Purpose**  
Manages structured, publishable content entries (articles, announcements, blog posts, product updates) with support for rich formatting, categories, SEO fields, scheduling, and visibility rules.

**Key Fields**

| Field              | Type       | Required | Description                                           | Example / Notes                                  |
|--------------------|------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`               | string     | yes      | MongoDB ObjectId                                      | —                                                |
| `title`            | string     | yes      | Main headline                                         | "New Security Features Released"                 |
| `type`             | string     | no       | Content subtype (article, news, update, page, …)      | `article`, `release-note`                        |
| `slug`             | string     | no       | URL-friendly identifier                               | `2025-security-audit`                            |
| `subtitle`         | string     | no       | Secondary title / lead                                | —                                                |
| `content`          | string     | yes      | Main body (Markdown / HTML / JSON rich text)          | —                                                |
| `summary`          | string     | no       | Short excerpt for previews                            | 160–300 characters                               |
| `categories`       | string[]   | no       | Hierarchical or flat taxonomy                         | `["security", "product-update"]`                 |
| `state`            | enum       | no       | Lifecycle state                                       | `draft`, `published`, `archived`                 |
| `status`           | enum       | yes      | Publication status                                    | `draft`, `review`, `published`, `rejected`       |
| `visibility`       | string     | no       | Access level                                          | `public`, `internal`, `private`, `unlisted`      |
| `thumbnail`        | string     | no       | Featured image reference (File ID)                    | —                                                |
| `featured_image`   | string     | no       | Larger banner image                                   | —                                                |
| `attachments`      | string[]   | no       | Related File IDs                                      | —                                                |
| `keywords`         | string[]   | no       | SEO / search keywords                                 | —                                                |
| `publication_date` | Date       | no       | Scheduled or actual publish time                      | —                                                |
| `views`            | number     | no       | View counter                                          | —                                                |
| `rate` / `rating`  | number     | no       | Average rating                                        | 4.7                                              |
| `reactions`        | Reaction[] | no       | Emoji / custom reactions                              | —                                                |

**Relationships & Integrations**

- → `special.files` (images, attachments)
- ← `general.comments` (public discussion below post)
- ← `touch.notices` / `touch.pushes` (new post notifications)
- → `general.activities` (publish / update events)

**Typical Use Cases**

- Publishing company blog post with rich media
- Releasing product changelog with versioned history
- Creating internal policy / handbook page
- Scheduling announcement to go live at specific time

### Tickets

**Purpose**  
Implements a full-featured support/helpdesk ticket system with priority, status tracking, assignment, due dates, resolution notes, and threaded conversation support.

**Key Fields**

| Field              | Type      | Required | Description                                          | Example / Notes                              |
|--------------------|-----------|----------|------------------------------------------------------|----------------------------------------------|
| `id`               | string    | yes      | MongoDB ObjectId                                     | —                                            |
| `title`            | string    | yes      | Short summary of the issue                           | "Cannot complete payment – error 0x800A"     |
| `type`             | string    | no       | Category/subtype                                     | `bug`, `feature-request`, `billing`          |
| `state`            | enum      | no       | High-level lifecycle                                 | `open`, `in-progress`, `resolved`            |
| `status`           | enum      | yes      | Granular status                                      | `new`, `waiting-customer`, `closed`          |
| `priority`         | enum      | yes      | Urgency level                                        | `low`, `medium`, `high`, `critical`          |
| `content`          | string    | yes      | Initial description                                  | —                                            |
| `parent`           | string    | no       | Parent ticket (for duplicates / sub-tasks)           | —                                            |
| `department`       | string    | no       | Team/queue assignment                                | `billing`, `technical`                       |
| `assigned_to`      | string    | no       | Responsible user/agent                               | —                                            |
| `due_date`         | Date      | no       | Target resolution date                               | —                                            |
| `solution`         | string    | no       | Final resolution text                                | —                                            |
| `attachments`      | string[]  | no       | Supporting files/screenshots                         | —                                            |
| `feedback`         | string    | no       | Post-resolution satisfaction note                    | Reference to `content.notes`                 |
| `rate` / `rating`  | number    | no       | Customer satisfaction score                          | —                                            |

**Relationships & Integrations**

- → `content.notes` (threaded replies & internal notes)
- → `special.files` (attachments)
- → `identity.users` / `career.employees` (assignment)
- → `touch.notices` / `touch.emails` (status change alerts)
- → `general.workflows` (optional SLA / escalation)

**Typical Use Cases**

- Customer reports payment failure → agent investigates
- Internal IT ticket for broken laptop
- Feature request collection & prioritization
- Multi-step refund approval workflow

### Notes

**Purpose**  
Provides lightweight, flexible note-taking / annotation capability — used for internal comments, ticket replies, personal reminders, knowledge-base drafts, or threaded side-conversations.

**Key Fields**

| Field         | Type       | Required | Description                                          | Example / Notes                             |
|---------------|------------|----------|------------------------------------------------------|---------------------------------------------|
| `id`          | string     | yes      | MongoDB ObjectId                                     | —                                           |
| `type`        | enum       | yes      | NoteType (internal, reply, draft, reminder, …)       | `reply`, `internal-note`                    |
| `content`     | string     | yes      | Note body                                            | Markdown supported                          |
| `state`       | enum       | no       | Visibility/lifecycle                                 | `active`, `archived`                        |
| `level`       | number     | no       | Thread depth                                         | —                                           |
| `parent`      | string     | no       | Parent note (threading)                              | —                                           |
| `relation`    | string     | no       | Attached to Post / Ticket / other entity             | —                                           |
| `visibility`  | string     | no       | Access control                                       | `private`, `team`, `public`                 |
| `attachments` | string[]   | no       | Supporting documents                                 | —                                           |
| `reactions`   | Reaction[] | no       | Quick emoji feedback                                 | —                                           |
| `mentions`    | string[]   | no       | Notify specific users                                | —                                           |

**Relationships & Integrations**

- → `content.tickets` (most common – replies & internal notes)
- → `content.posts` (drafts / annotations)
- → `special.files`
- → `touch.notices` (mentions)

**Typical Use Cases**

- Agent adds private troubleshooting note on ticket
- User replies to support thread
- Team member drafts article section as note
- Quick internal reminder linked to event/task
