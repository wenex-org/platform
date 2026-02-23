# Wenex Platform — Workers Overview

Wenex uses a set of lightweight, specialized **background workers** (usually running as separate NestJS microservices or queue consumers) to handle asynchronous, recurring and event-driven tasks that should not block the main API request/response cycle.

These workers are the operational backbone that keeps the system eventually consistent, performant, observable and real-time capable — especially important in a microservices + event-sourced + CQRS-oriented architecture.

## Summary Table

| Worker       | Primary Responsibility                              | Trigger / Input Source                  | Main Technologies / Targets              | Criticality |
|--------------|------------------------------------------------------|------------------------------------------|-------------------------------------------|-------------|
| **cleaner**  | Removal / archiving of temporal & expired data       | Cron / scheduled jobs                    | `essential.sagas`, `logger.audits`, `special.stats`, `thing.metrics` | High (storage & performance) |
| **dispatcher** | Notifies clients about data changes (CQRS projection) | Kafka / Redis Pub/Sub / internal events  | WebSocket, Server-Sent Events, Mobile Push | High (real-time UX) |
| **logger**   | Writes structured audit & security logs              | Almost every mutation / important action | Dedicated audit collection (Elastic? ClickHouse? Mongo?) | Very High (compliance & forensics) |
| **observer** | Collects & aggregates usage statistics & telemetry   | Internal events, periodic snapshots      | `special.stats`, Redis counters, time-series DB | Medium–High (billing & monitoring) |
| **preserver**| EMQX MQTT broker authentication & authorization     | MQTT CONNECT / PUBLISH / SUBSCRIBE       | EMQX extension / plugin / auth hook       | Critical (IoT & pub/sub security) |
| **publisher**| Publishes data change events to interested parties   | Entity create/update/delete/soft-delete  | MQTT topics (EMQX) → owner / shares / clients | High (real-time sync) |
| **watcher**  | Keeps frequently accessed data in sync with Redis    | Change events + periodic reconciliation  | Redis (caching layer)                     | High (API performance) |
