# Wenex Platform Documentation — Essential Service

## Essential Service

**Description**  
The **Essential Service** implements the **distributed transaction orchestration** and **compensating transaction** backbone of the Wenex platform using the **Saga pattern**. It coordinates long-running, multi-service business processes that span multiple microservices while maintaining data consistency without relying on distributed 2PC (two-phase commit).  

The service acts as both the **orchestrator registry** and **execution log**, recording saga instances, their stages/steps, compensating actions, timeouts, aborts, and final outcomes. It enables reliable eventually-consistent workflows across financial, logistic, content, identity and other domains.

**Use Cases**

- Multi-step order placement & payment in e-commerce (reserve stock → charge wallet → create invoice → send confirmation)
- Banking money transfers between accounts/wallets with currency conversion
- Subscription & recurring billing lifecycle (create invoice → charge → activate access → notify user)
- Logistic shipment booking (assign driver + vehicle → reserve cargo space → update tracking)
- User onboarding with verification & provisioning (create profile → verify identity → grant permissions → send welcome)
- Refund / cancellation flows with compensation (reverse charge → restore stock → cancel ticket)
- Cross-service content publishing approval workflows
- IoT device provisioning & activation sequences

**Modules**

### Sagas

**Purpose**  
Represents a single long-running business transaction composed of multiple ordered steps (stages). Tracks overall state, timeout behavior, session context (MongoDB transaction session), and final commit/abort/prune outcome.

**Key Fields**

| Field           | Type       | Required | Description                                              | Example / Notes                                  |
|-----------------|------------|----------|----------------------------------------------------------|--------------------------------------------------|
| `id`            | string     | yes      | MongoDB ObjectId                                         | —                                                |
| `ttl`           | number     | yes      | Time-to-live in seconds (auto-abort/prune timeout)       | 1800 (30 minutes)                                |
| `job`           | string     | yes      | Business process / job identifier                        | `order:fullfillment`, `payment:subscription`     |
| `state`         | enum       | yes      | Current saga lifecycle state                             | `pending`, `running`, `committing`, `aborted`, `completed` |
| `session`       | string     | yes      | MongoDB session ID used for atomicity within stages      | —                                                |
| `pruned_at`     | Date       | no       | Timestamp when saga was pruned (cleanup)                 | After TTL + grace period                         |
| `aborted_at`    | Date       | no       | Timestamp of abort / compensation completion             | —                                                |
| `committed_at`  | Date       | no       | Timestamp when saga successfully reached final state     | —                                                |
| `createdAt`     | Date       | yes      | Creation timestamp                                       | —                                                |
| `updatedAt`     | Date       | yes      | Last activity timestamp                                  | —                                                |

**Relationships & Integrations**

- → `essential.stages` (one saga owns many ordered stages)
- → almost every other service (via saga ID passed in requests)
- Emits events → Kafka topics (`saga.started`, `saga.stage.completed`, `saga.aborted`, `saga.completed`)
- Used by → `general.workflows`, `financial.transactions`, `logistic.travels`, `content.tickets`, etc.
- Compensating logic often implemented in originating service modules

**Typical Use Cases**

- E-commerce checkout: `reserve-product-stock → charge-wallet → create-invoice → send-confirmation-email → mark-order-paid`
- Bank internal transfer: `debit-source-wallet → credit-target-wallet → create-transaction-record → notify-both-parties`
- Subscription renewal: `generate-next-invoice → attempt-charge → on-success: extend-access → on-failure: notify-user-and-retry`
- Shipment creation: `assign-vehicle-and-driver → reserve-cargo-capacity → create-tracking-record → send-driver-notification`

### (Related — not a direct module but tightly coupled) Saga Stages

**Purpose**  
Atomic step / command within a saga. Records request payload, response or result, metadata, and whether the step succeeded or requires compensation.

**Key Fields** (summary — detailed in `stage.interface.ts`)

| Field     | Type                  | Required | Description                                            | Example / Notes                                  |
|-----------|-----------------------|----------|--------------------------------------------------------|--------------------------------------------------|
| `saga`    | string                | yes      | Parent saga reference                                  | —                                                |
| `bucket`  | enum (Collection)     | yes      | Target collection / service                            | `financial.transactions`, `logistic.cargoes`     |
| `action`  | enum (SagaStageAction)| yes      | Operation type                                         | `create`, `update`, `delete`, `compensate`       |
| `req`     | SagaStageReq<T,D>     | yes      | Input payload (typed per service/module)               | —                                                |
| `res`     | Serializer<T> / number / null | no   | Execution result or affected count                     | Created document, updated count, error code      |
| `meta`    | Metadata              | no       | Tracing, correlation, retry count, etc.                | —                                                |
