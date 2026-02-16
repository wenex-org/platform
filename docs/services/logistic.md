# Wenex Platform Documentation — Logistic Service

## Logistic Service

**Description**  
The **Logistic Service** is the dedicated microservice responsible for modeling and managing **physical transportation, delivery, and mobility operations** within the Wenex ecosystem. It provides structured entities and relationships for vehicles, drivers, cargo parcels, geographic locations, and travel/journey instances — serving as the operational backbone for last-mile delivery, ride-hailing, freight forwarding, field service management, supply chain tracking, and any domain that involves real-world movement of people or goods.

The service is designed for high write/read throughput in tracking scenarios, strong geospatial indexing (via `locations`), multi-leg journey support, and integration with external routing engines (e.g. Valhalla) and real-time telemetry (via `thing` service).

**Use Cases**

- Last-mile delivery & order fulfillment in e-commerce marketplaces
- Ride-hailing and on-demand transportation platforms
- Freight & cargo management in B2B logistics and supply chain
- Field service dispatching (technicians, medical transport, maintenance crews)
- Fleet management for companies with owned vehicles & drivers
- Real-time shipment tracking in banking (valuables), crypto (physical gold/silver), IoT (asset tracking)
- Multi-modal journey planning and execution (truck → warehouse → drone → final delivery)
- Driver & vehicle compliance, license expiration, maintenance scheduling

**Modules**

### Cargoes

**Purpose**  
Represents individual **parcels, packages, pallets or freight units** being transported — with physical dimensions, special handling flags, and journey history.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `title`     | string    | no       | Human-readable description                            | "iPhone 16 Pro – Order #ORD-784512"              |
| `weight`    | number    | yes      | Weight in kilograms                                   | 0.42                                             |
| `width`     | number    | yes      | Width in centimeters                                  | 15.0                                             |
| `height`    | number    | yes      | Height in centimeters                                 | 8.5                                              |
| `length`    | number    | yes      | Length in centimeters                                 | 22.0                                             |
| `fragile`   | boolean   | no       | Requires careful handling                             | `true`                                           |
| `perishable`| boolean   | no       | Temperature/time sensitive                            | `true` (food, medicine)                          |
| `travels`   | string[]  | no       | Array of Travel IDs this cargo was/will be on         | Multi-leg shipments                              |
| `createdAt` | Date      | yes      | Creation timestamp                                    | —                                                |
| `updatedAt` | Date      | yes      | Last status change                                    | —                                                |

**Relationships & Integrations**

- ← `logistic.travels` (many-to-many via array)
- ← `career.products` / `career.stocks` (origin often linked to order)
- → `special.files` (photos, labels, proof-of-delivery)
- → `touch.notices` / `touch.pushes` (status updates)

**Typical Use Cases**

- Single-package e-commerce delivery
- Multi-pallet B2B freight shipment
- Temperature-controlled medicine transport
- High-value item insured delivery (jewelry, electronics)

### Drivers

**Purpose**  
Manages **human or autonomous operators** responsible for controlling vehicles during travels — including licensing, verification, gender/location preferences, and compliance metadata.

**Key Fields**

| Field             | Type    | Required | Description                                           | Example / Notes                                  |
|-------------------|---------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`              | string  | yes      | MongoDB ObjectId                                      | —                                                |
| `type`            | enum    | yes      | DriverType (human, autonomous, outsourced, …)         | `human`, `autonomous`                            |
| `gender`          | enum    | yes      | Gender (affects matching in some verticals)           | `male`, `female`, `other`                        |
| `state`           | enum    | yes      | Operational state                                     | `active`, `offline`, `suspended`                 |
| `status`          | enum    | yes      | Availability / health status                          | `available`, `on-trip`, `maintenance`            |
| `license`         | string  | yes      | Driver’s license number / identifier                  | Unique within jurisdiction                       |
| `verified_at`     | Date    | no       | Background check / license verification timestamp     | —                                                |
| `expiration_date` | Date    | yes      | License expiration                                    | Triggers re-verification reminders               |
| `createdAt`       | Date    | yes      | —                                                     | —                                                |
| `updatedAt`       | Date    | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- ← `logistic.vehicles` (current or historical assignment)
- ← `logistic.travels` (driver assigned to journey)
- → `identity.profiles` / `career.employees` (personal data link)
- → `general.activities` (status changes, violations)

**Typical Use Cases**

- Gig-economy delivery driver profile
- Company-employed truck driver with license tracking
- Autonomous vehicle “driver” entity
- Temporary outsourced courier

### Locations

**Purpose**  
Standardized **geographic point, address or area** representation used across pickup, drop-off, warehouse, charging stations, service points, etc.

**Key Fields**

| Field       | Type              | Required | Description                                           | Example / Notes                                  |
|-------------|-------------------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string            | yes      | MongoDB ObjectId                                      | —                                                |
| `name`      | string            | no       | Friendly name                                         | "Main Warehouse Tehran"                          |
| `title`     | string            | no       | Alternative / full address line                       | —                                                |
| `type`      | enum              | no       | LocationType (address, warehouse, hub, POI, …)        | `warehouse`, `pickup`, `dropoff`                 |
| `geometry`  | LocationGeometry  | yes      | GeoJSON Point / Polygon / LineString                  | `{ type: "Point", coordinates: [51.42, 35.69] }` |
| `properties`| object            | no       | Custom metadata (floor, gate code, contact, …)        | Flexible extension point                          |
| `createdAt` | Date              | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- Referenced by → `logistic.travels`, `logistic.cargoes`, `career.stores/branches`
- → `general.events` (delivery windows)
- Geospatial queries via MongoDB 2dsphere index

**Typical Use Cases**

- Customer delivery address
- Warehouse / fulfillment center
- Driver current position snapshot
- Charging station for electric fleet

### Travels

**Purpose**  
Represents a **single journey or leg** — connecting origin → destination with assigned vehicle(s), driver(s), and cargo(s). Supports multi-leg, multi-modal, and real-time status tracking.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `cargoes`   | string[]  | no       | Cargoes being transported on this leg                 | —                                                |
| `drivers`   | string[]  | no       | Assigned driver(s)                                    | Multi-driver long-haul                           |
| `vehicles`  | string[]  | no       | Assigned vehicle(s)                                   | Tractor + trailer                                |
| `locations` | string[]  | yes      | Ordered list of location IDs (start → waypoints → end)| At least 2 locations                             |
| `createdAt` | Date      | yes      | Journey creation                                      | —                                                |
| `updatedAt` | Date      | yes      | Last status / location update                         | —                                                |

**Relationships & Integrations**

- → `logistic.cargoes`, `logistic.drivers`, `logistic.vehicles`, `logistic.locations`
- → `thing.devices` / `thing.metrics` (real-time GPS, temperature)
- → `touch.notices` / `touch.pushes` (ETA updates, delays)
- Routing requests → external Valhalla service

**Typical Use Cases**

- Single delivery from warehouse to customer
- Multi-stop courier route
- Long-haul freight with driver changeover
- Ride-sharing trip with intermediate stops

### Vehicles

**Purpose**  
Manages **transport assets** (cars, trucks, vans, bikes, drones, autonomous pods) including type, license plates, current status, and driver assignment history.

**Key Fields**

| Field     | Type      | Required | Description                                           | Example / Notes                                  |
|-----------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`      | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `type`    | enum      | yes      | VehicleType (car, truck, van, bike, drone, …)         | `van`, `truck_18t`                               |
| `status`  | enum      | yes      | Operational status                                    | `active`, `maintenance`, `out-of-service`        |
| `plates`  | string[]  | yes      | License plate numbers (multiple for trailers)         | ["IR 12 345 A", "Trailer IR 98 765 B"]           |
| `drivers` | string[]  | no       | Currently or historically assigned drivers            | —                                                |
| `createdAt`| Date     | yes      | —                                                     | —                                                |
| `updatedAt`| Date     | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- ← `logistic.travels` (assignment)
- ← `logistic.drivers` (bidirectional reference)
- → `thing.devices` (telematics unit)
- → `general.activities` (maintenance, accidents)

**Typical Use Cases**

- Company delivery van fleet management
- Third-party driver’s personal motorcycle
- Trailer attached to different tractors
- Drone delivery fleet with battery status tracking
