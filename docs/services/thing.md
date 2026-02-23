# Wenex Platform Documentation — Thing Service

## Thing Service

**Description**  
The **Thing** service is the dedicated IoT / device telemetry layer of the Wenex platform. It models physical or virtual **devices**, their attached **sensors**, and the time-series **metrics** / measurements they produce.  

The service is optimized for high-ingress write throughput, time-based indexing, efficient querying of latest values and historical trends, and integration with real-time notification and analytics pipelines. It serves as the foundation for IoT use cases, industrial monitoring, smart environments, asset tracking, environmental sensing, wearable data collection, and any domain that involves collecting and interpreting data from connected "things".

**Use Cases**

- Temperature & humidity monitoring in smart warehouses / cold-chain logistics
- Vehicle telematics (speed, location, fuel level, OBD-II data) in fleet management
- Industrial equipment predictive maintenance (vibration, current draw, runtime hours)
- Environmental / agricultural sensors (soil moisture, air quality, weather stations)
- Smart home / building automation (motion, door sensors, energy meters)
- Wearable health & fitness tracking integration
- Asset tracking with battery-powered GPS + accelerometer devices
- Real-time anomaly detection and alerting in banking vaults, crypto mining farms, or critical infrastructure

**Modules**

### Devices

**Purpose**  
Central registry and lifecycle management of **physical or virtual IoT devices** — including identity, type classification, current status, location linkage, and basic operational metadata.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `name`      | string    | yes      | Human-readable device name                            | "Warehouse-TEH-Node-17", "Truck-784-OBD"         |
| `type`      | string    | no       | Device category / model family                        | `temperature-sensor`, `gps-tracker`, `gateway`   |
| `token`     | string    | no       | Device authentication token / secret                  | Long-lived or rotatable credential               |
| `state`     | enum      | no       | Operational lifecycle state                           | `active`, `inactive`, `provisioning`, `retired`  |
| `status`    | enum      | no       | Current health / connectivity status                  | `online`, `offline`, `battery-low`, `error`      |
| `location`  | string    | no       | Current or last-known location reference              | Links to `logistic.locations`                    |
| `createdAt` | Date      | yes      | Device registration timestamp                         | —                                                |
| `updatedAt` | Date      | yes      | Last status/metadata change                           | —                                                |
| `lastSeen`  | Date      | no       | Most recent telemetry or heartbeat                    | Used for offline detection                       |

**Relationships & Integrations**

- → `thing.sensors` (1:N — one device hosts multiple sensors)
- → `logistic.locations` (position tracking)
- → `logistic.vehicles` / `career.stores` (contextual assignment)
- → `touch.notices` / `touch.pushes` (offline alerts, anomalies)
- Heartbeat / telemetry ingestion → `general.activities`

**Typical Use Cases**

- Register new temperature logger in cold-chain shipment
- Track construction equipment with GPS + engine-hour counter
- Manage fleet of delivery drones or autonomous robots
- Provision smart meters in energy monitoring project

### Sensors

**Purpose**  
Describes individual **measurement points** or **data channels** on a device — each sensor has a specific physical quantity it measures (temperature, pressure, acceleration, etc.).

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `device`    | string    | yes      | Parent device reference                               | —                                                |
| `name`      | string    | no       | Sensor channel name                                   | "Ambient Temp", "Engine RPM", "Door Contact"     |
| `type`      | string    | no       | Sensor category                                       | `temperature`, `accelerometer`, `contact`        |
| `state`     | enum      | no       | Operational state                                     | `active`, `faulty`, `calibrating`                |
| `status`    | enum      | no       | Current health                                        | `ok`, `out-of-range`, `no-signal`                |
| `unit`      | string    | no       | Measurement unit                                      | `°C`, `m/s²`, `%`, `ppm`                         |
| `metric`    | string    | no       | Canonical metric name/key                             | `temperature`, `vibration_z`, `co2`              |
| `createdAt` | Date      | yes      | —                                                     | —                                                |
| `updatedAt` | Date      | yes      | —                                                     | —                                                |

**Relationships & Integrations**

- ← `thing.devices` (many sensors per device)
- → `thing.metrics` (data produced by this sensor)
- → `general.activities` (sensor fault events)
- Used in alerting rules & dashboard visualization

**Typical Use Cases**

- One device with multiple sensors (temp + humidity + light)
- Vibration sensor on industrial motor
- Door open/close contact in security monitoring
- Fuel level sensor in vehicle telematics

### Metrics

**Purpose**  
Time-series storage of **raw or aggregated measurements** produced by sensors — optimized for ingestion speed, latest-value queries, and historical trend analysis.

**Key Fields**

| Field       | Type      | Required | Description                                           | Example / Notes                                  |
|-------------|-----------|----------|-------------------------------------------------------|--------------------------------------------------|
| `id`        | string    | yes      | MongoDB ObjectId                                      | —                                                |
| `sensor`    | string    | yes      | Producing sensor reference                            | —                                                |
| `key`       | string    | no       | Optional sub-key / channel identifier                 | `avg`, `max`, `min` (for aggregates)             |
| `state`     | enum      | no       | Data quality / validity state                         | `valid`, `outlier`, `missing`                    |
| `device`    | string    | no       | Denormalized device reference (for faster queries)    | —                                                |
| `value`     | number / number[] | yes | Measured value(s) — scalar or vector                  | `23.7`, `[0.12, -0.45, 9.81]` (3-axis accel)     |
| `ts`        | Date      | yes      | Measurement timestamp                                 | High-precision required                          |
| `createdAt` | Date      | yes      | Ingestion timestamp                                   | —                                                |

**Relationships & Integrations**

- ← `thing.sensors` (data source)
- ← `thing.devices` (denormalized for query performance)
- → time-series databases / downsampling jobs (long-term storage)
- → `touch.notices` (threshold breach alerts)
- → analytics / BI pipelines

**Typical Use Cases**

- Store temperature reading every 5 minutes
- Record 3-axis acceleration at 100 Hz for vibration analysis
- Capture GPS coordinates + speed from vehicle tracker
- Ingest battery voltage trend for predictive replacement
