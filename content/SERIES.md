# DIME Platform — ASCII Infographic Series

A series of 30 ASCII infographics for users and integrators of the DIME platform: Connector, Horizon, and Zenith. Each infographic is a standalone, visually rich ASCII illustration suitable for documentation, README files, terminal display, and as reference art for marketing image generation.

---

## Series Overview

| #  | File                                | Title                                    | Status  |
|----|-------------------------------------|------------------------------------------|---------|
| 01 | `01-what-is-dime.md`               | What Is DIME?                            | done    |
| 02 | `02-the-dime-ecosystem.md`         | The DIME Ecosystem                       | pending |
| 03 | `03-installation.md`               | Installation & First Run                 | done    |
| 04 | `04-yaml-basics.md`                | YAML Configuration Basics                | pending |
| 05 | `05-architecture.md`               | Architecture — How Data Flows            | done    |
| 06 | `06-source-connectors.md`          | Source Connectors Catalog                | pending |
| 07 | `07-sink-connectors.md`            | Sink Connectors Catalog                  | pending |
| 08 | `08-message-paths-filtering.md`    | Message Paths, Filtering & Routing       | pending |
| 09 | `09-scripting.md`                  | Scripting (Lua & Python)                  | pending |
| 10 | `10-cache-api.md`                  | The Cache API — Cross-Connector State    | pending |
| 11 | `11-templates-formatting.md`       | Templates & Output Formatting            | pending |
| 12 | `12-plc-to-dashboard.md`          | Walkthrough: PLC to Dashboard            | pending |
| 13 | `13-recipe-mqtt.md`                | Recipe: MQTT Broker Integration          | pending |
| 14 | `14-recipe-database.md`            | Recipe: Database Logging                 | pending |
| 15 | `15-recipe-mtconnect.md`           | Recipe: MTConnect & CNC Machines         | pending |
| 16 | `16-admin-api.md`                  | The Admin REST API                       | pending |
| 17 | `17-websocket-monitoring.md`       | WebSocket Live Monitoring                | pending |
| 18 | `18-health-faults.md`              | Health, Faults & Auto-Recovery           | pending |
| 19 | `19-connector-ux.md`               | Connector UX — Desktop App               | pending |
| 20 | `20-report-by-exception.md`        | Report By Exception                      | pending |
| 21 | `21-multi-file-configs.md`         | Multi-File Configs & YAML Anchors        | pending |
| 22 | `22-instance-chaining.md`          | Scaling: Instance Chaining               | pending |
| 23 | `23-deploy-service.md`             | Deploying as a Service                   | pending |
| 24 | `24-deploy-docker.md`              | Docker & Container Deployment            | pending |
| 25 | `25-horizon-gateway.md`            | DIME Horizon — Site Gateway              | pending |
| 26 | `26-zenith-cloud.md`               | DIME Zenith — Cloud Command Center       | pending |
| 27 | `27-zenith-ux.md`                  | Zenith UX — Fleet Console                | pending |
| 28 | `28-edge-to-cloud.md`              | Three-Tier Architecture — Edge to Cloud  | pending |
| 29 | `29-performance-tuning.md`         | Performance Tuning & Ring Buffer         | pending |
| 30 | `30-troubleshooting.md`            | Troubleshooting & Common Pitfalls        | pending |

---

## Section Map

```
GETTING STARTED          CORE CONCEPTS            DATA TRANSFORMATION
  01  What Is DIME?        05  Architecture          09  Scripting
  02  The Ecosystem        06  Source Connectors      10  Cache API
  03  Installation         07  Sink Connectors        11  Templates
  04  YAML Basics          08  Filtering & Routing

WALKTHROUGHS & RECIPES   MONITORING & MANAGEMENT  SCALING & DEPLOYMENT
  12  PLC to Dashboard     16  Admin REST API         20  Report By Exception
  13  MQTT Integration     17  WebSocket Monitoring   21  Multi-File Configs
  14  Database Logging     18  Health & Faults        22  Instance Chaining
  15  MTConnect & CNC      19  Connector UX App       23  Service Deployment
                                                      24  Docker Deployment

ENTERPRISE FLEET         ADVANCED
  25  Horizon Gateway      29  Performance Tuning
  26  Zenith Cloud         30  Troubleshooting
  27  Zenith UX Console
  28  Edge to Cloud
```

---

## GETTING STARTED

---

## 01 — What Is DIME?

**Goal:** First-contact infographic. Someone who has never heard of DIME should understand the value in 30 seconds.

**Content:**
- The integration problem: N devices x M destinations = N*M custom integrations
- The DIME solution: N devices + M destinations = N+M simple configs
- Before/after comparison showing spaghetti wiring vs single hub
- Key stats: 50+ connectors, <1ms latency, 1M+ msg/sec, zero code
- One-liner: "Connect Once. Use Everywhere."
- Supported deployment: Windows, Linux, Docker, ARM64

---

## 02 — The DIME Ecosystem

**Goal:** Show the three products and two desktop apps as one unified platform. First time Horizon and Zenith are introduced.

**Content:**
- The three tiers displayed as a vertical stack:
  - DIME Connector (Edge) — collects data from 50+ protocols on the factory floor
  - DIME Horizon (Gateway) — manages connectors at a site, bridges edge to cloud
  - DIME Zenith (Cloud) — centralized fleet command and control across all sites
- Two desktop apps shown alongside:
  - Connector UX — local management of one or more connector instances
  - Zenith UX — fleet-wide monitoring and configuration console
- Communication arrows: Connector <-> Horizon <-> Zenith
- Key insight: Horizon pulls from Zenith (no inbound firewall rules needed)
- Scale illustration: 1 Zenith manages 100s of Horizons, each Horizon manages dozens of Connectors
- Licensing callout: each tier can be used standalone or together

---

## 03 — Installation & First Run

**Goal:** Get someone from zero to running DIME in one infographic.

**Content:**
- Platform matrix: Windows x86/x64, Linux x64/ARM64, Docker
- Windows: download -> extract -> run DIME.exe / install as service
- Linux: download -> extract -> run / install as systemd service
- Docker: docker run with volume mount for configs
- First run: what happens at startup (loads YAML, initializes connectors, starts admin server)
- Verify it works: curl http://localhost:9999/status or open Swagger UI
- Config directory: --config flag to point at custom configs

---

## 04 — YAML Configuration Basics

**Goal:** Demystify the YAML config structure. Make it feel approachable.

**Content:**
- The three top-level sections: app, sources, sinks
- app section: license, ring_buffer size, http_server_uri, ws_server_uri
- Source anatomy: name, connector, scan_interval, rbe, items[]
- Sink anatomy: name, connector, include_filter, exclude_filter
- Item anatomy: name, address, script, enabled
- Single-file vs multi-file: YAML anchors (&name) and references (*name)
- File loading order: all *.yaml merged, main.yaml loaded last
- Minimal working example: Script source -> Console sink (12 lines)
- The enabled flag: disable any connector or item without deleting it

---

## CORE CONCEPTS

---

## 05 — Architecture — How Data Flows

**Goal:** Show how data moves through a DIME Connector instance end-to-end.

**Content:**
- Source -> Ring Buffer -> Sink pipeline
- The Disruptor lock-free ring buffer at the center
- ConnectorRunner lifecycle: Initialize -> Create -> Connect -> Read/Write -> Disconnect -> Deinitialize
- Message anatomy: path, data, timestamp, connector item ref
- AdminServer: REST API (port 9999) + WebSocket (port 9998)
- How SinkDispatcher fans out every message to every registered sink
- Double-buffer pattern: receive buffer accumulates, write buffer processes, atomic swap

---

## 06 — Source Connectors Catalog

**Goal:** Show the breadth of what DIME can read from. Organized visual catalog.

**Content:**
- Industrial PLCs: Siemens S7 (300/400/1200/1500), Rockwell EtherNet/IP, Beckhoff ADS, Modbus TCP
- Standards: OPC-UA, OPC-DA, MTConnect Agent, Haas SHDR
- Robotics: FANUC, Yaskawa, ROS2
- Message Queues: MQTT, SparkplugB, ActiveMQ, Redis Pub/Sub
- Databases: SQL Server, PostgreSQL (batch polling)
- Web/REST: JSON Scraper, XML Scraper, HTTP Client
- Network: UDP Server, TCP ASCII, SNMP
- Specialized: NWS Weather, Smart PAC, I3X
- Scripting: Script (Lua/Python — no external source needed)
- Source type hierarchy: Polling, Queuing, BatchPolling, Database
- Key config properties per category (address, port, authentication, items)

---

## 07 — Sink Connectors Catalog

**Goal:** Show where DIME can send data. Emphasize the fan-out capability.

**Content:**
- Time-Series: InfluxDB (line protocol)
- Analytics: Splunk HEC, Splunk Edge Hub SDK v1/v2
- Databases: MongoDB, SQL Server, PostgreSQL
- Message Brokers: MQTT, SparkplugB, ActiveMQ, Redis
- Manufacturing: MTConnect Agent, MTConnect SHDR
- Servers: OPC-UA Server, HTTP Server, WebSocket Server
- File: CSV Writer, Logger (NLog)
- Debug: Console
- Per-sink features: include/exclude filters, sink transforms, templates
- The key insight: every sink gets every message, filters determine what stays

---

## 08 — Message Paths, Filtering & Routing

**Goal:** Explain how to control what data goes where. The routing logic.

**Content:**
- Message path anatomy: sourceName/itemName (e.g., "plc1/temperature")
- $SYSTEM paths: automatic metadata (IsConnected, IsFaulted, etc.)
- exclude_filter: regex blacklist — drop matching paths
- include_filter: regex whitelist — only keep matching paths
- How filters create virtual sub-streams from one ring buffer
- strip_path_prefix: removes source name from path for cleaner downstream keys
- Practical routing example: PLC data to InfluxDB, robot data to MQTT, everything to Splunk
- Visual diagram: one ring buffer, three sinks with different filter masks
- itemized_read: true vs false — when items are processed individually vs batch

---

## DATA TRANSFORMATION

---

## 09 — Scripting (Lua & Python)

**Goal:** Show the scripting power without making it feel complex.

**Content:**
- Where scripts run in the lifecycle:
  - init_script: once at startup
  - loop_enter_script: before each scan cycle
  - loop_item_script: per item in the scan loop
  - item-level script: per individual item read
  - loop_exit_script: after each scan cycle
  - deinit_script: once at shutdown
- The `result` variable: raw data from the source connector
- Basic transforms: return result * 2, return from_json(result).value
- emit() function: fork one message into many output paths
- emit_mtconnect(): emit with MTConnect semantic mapping
- Helper functions: from_json(), to_json(), string manipulation
- Python alternative: lang_script: python, CLR interop, module imports
- Practical examples: unit conversion, state machine, JSON parsing
- Key insight: scripts are optional — most connectors work without them

---

## 10 — The Cache API — Cross-Connector State

**Goal:** Show how connectors share state and remember values across cycles.

**Content:**
- The problem: sources run independently, but sometimes you need data from another source
- cache(path, default): read the last known value for any message path
- cache_ts(path, default): read value + its timestamp as a tuple
- set(path, value): write a custom value into the user cache
- Cross-connector access: a Lua script in source A can read cache("sourceB/temperature")
- Use cases:
  - Combine PLC data with weather data in one output
  - Track running averages across scan cycles
  - Build state machines that persist between loops
  - Correlate events from multiple devices
- Cache vs emit: cache stores silently, emit publishes to the ring buffer
- Diagram: two sources feeding cache, one sink script reading both cached values
- wait_for_connectors: ensure a source runs only after dependencies have data

---

## 11 — Templates & Output Formatting

**Goal:** Show how to reshape data for specific sink formats using templates.

**Content:**
- The use_sink_transform flag: apply source-side transforms on the sink
- Template engines: Liquid and Scriban expression support
- Template context variables: Connector, Configuration, Message
- Message object: Path, Data, Timestamp — available inside templates
- JSON reshaping: take flat key-value pairs, output nested JSON structures
- Custom text formats: build CSV lines, log strings, or protocol-specific payloads
- Practical examples:
  - Format data as InfluxDB line protocol
  - Build a JSON payload for a REST API webhook
  - Create custom SHDR strings for MTConnect
- When to use templates vs Lua scripts: templates for formatting, scripts for logic
- Diagram: raw message -> template engine -> formatted output -> sink

---

## WALKTHROUGHS & RECIPES

---

## 12 — Walkthrough: PLC to Dashboard

**Goal:** Complete end-to-end example with actual YAML. The "aha" moment.

**Content:**
- Scenario: Read temperature + pressure from OPC-UA PLC, display on live web dashboard, store in InfluxDB
- Step 1: OPC-UA source config (address, port, auth, namespace, items)
- Step 2: Lua transform (extract .Value, unit conversion)
- Step 3: InfluxDB sink config (url, token, bucket, org)
- Step 4: WebSocket sink config (port, filters)
- Step 5: Console sink for debugging
- The complete YAML side-by-side with the data flow diagram
- What it looks like running: console output sample
- Adding a second machine: copy the source, change the address

---

## 13 — Recipe: MQTT Broker Integration

**Goal:** Show MQTT as both source and sink. The most common integration pattern.

**Content:**
- Scenario: Subscribe to sensor topics, republish transformed data to a different broker
- MQTT source config: address, port, client_id, username/password, base_topic, QoS
- Topic mapping: MQTT topic becomes the message path
- TLS/SSL: tls flag, tls_insecure for self-signed certs
- MQTT sink config: publish transformed data to new topic structure
- SparkplugB variant: industrial MQTT with birth/death certificates and metrics
- Clean session: true for stateless, false for durable subscriptions
- Retain flag: keep last value for late subscribers
- Practical pattern: edge MQTT broker -> DIME -> cloud MQTT broker
- Diagram: devices -> local broker -> DIME source -> ring buffer -> DIME sink -> cloud broker

---

## 14 — Recipe: Database Logging

**Goal:** Show how to capture time-series data into databases for historical analysis.

**Content:**
- InfluxDB sink: url, bucket, org, token — automatic line protocol formatting
- SQL Server sink: connection string, table mapping, batch inserts
- PostgreSQL sink: connection string, query templates
- MongoDB sink: connection string, collection, document structure
- Database as source: BatchPolling pattern for SQL Server and PostgreSQL
  - query field: SELECT statement executed each scan cycle
  - Result set mapped to items
- CSV Writer sink: filename, auto-headers, filter_duplicate_paths
- Logger sink: NLog-based structured logging to files
- When to use which: InfluxDB for time-series, SQL for relational, MongoDB for documents
- Diagram: multiple sources -> ring buffer -> fan out to InfluxDB + SQL + CSV simultaneously

---

## 15 — Recipe: MTConnect & CNC Machines

**Goal:** Show DIME as an MTConnect adapter and agent for CNC machine monitoring.

**Content:**
- What is MTConnect: open standard for manufacturing equipment monitoring
- Reading from MTConnect: MTConnect source connector polls an existing agent
- Reading via SHDR: Haas SHDR source for direct machine connections
- Writing MTConnect: MTConnect Agent sink — DIME becomes an MTConnect agent
- Writing SHDR: SHDR sink for feeding external MTConnect agents
- emit_mtconnect(): Lua function for semantic MTConnect data mapping
- Practical scenario: read Siemens S7 PLC -> transform with Lua -> expose as MTConnect agent
- FANUC and Yaskawa sources: direct robot data into MTConnect format
- MTConnect data types: Samples (numeric), Events (state), Conditions (alarms)
- Diagram: CNC machines -> DIME -> MTConnect Agent -> monitoring dashboards

---

## MONITORING & MANAGEMENT

---

## 16 — The Admin REST API

**Goal:** Show the built-in REST API for managing a running DIME instance.

**Content:**
- Default endpoint: http://localhost:9999/
- Swagger UI: http://localhost:9999/swagger — interactive API browser
- Key endpoints:
  - GET /status — all connector health and metrics at a glance
  - GET /config/yaml — retrieve the running YAML configuration
  - POST /config/yaml — push a new configuration (hot reload)
  - POST /service/restart — restart the entire service
  - POST /connector/start/{name} — start a single connector
  - POST /connector/stop/{name} — stop a single connector
  - POST /connector/add/source — add a new source at runtime
  - POST /connector/add/sink — add a new sink at runtime
- Status response anatomy: connection state, fault info, performance metrics
- Hot reconfiguration: add sinks at runtime with zero downtime
- Diagram: operator's browser -> Swagger UI -> DIME REST API -> connector control

---

## 17 — WebSocket Live Monitoring

**Goal:** Show real-time data streaming for dashboards and monitoring tools.

**Content:**
- Default endpoint: ws://localhost:9998/
- What streams over the WebSocket:
  - Real-time connector status changes
  - Performance metrics updates
  - Fault notifications
  - Live data values as they flow through the ring buffer
- Building a live dashboard: connect a web app to the WebSocket
- WebSocket sink: DIME can also push data to external WebSocket consumers
- HTTP Server sink: serve static files alongside the WebSocket for self-contained dashboards
- Use case: factory floor TV showing live machine status, zero external dependencies
- Diagram: DIME instance -> WebSocket -> browser dashboard with live gauges and charts

---

## 18 — Health, Faults & Auto-Recovery

**Goal:** Explain how DIME monitors itself and recovers from failures.

**Content:**
- Connector states: Initialized, Connected, Disconnected, Faulted
- $SYSTEM messages: every connector emits IsConnected, IsFaulted, ConnectCount, etc.
- Fault tracking: FaultReason (exception detail), FaultCount (accumulator)
- Auto-recovery: DIME automatically retries connections on failure
- Performance metrics per connector:
  - MinReadTime, MaxReadTime, LastReadTime
  - ScriptTime — Lua/Python execution duration
  - TotalLoopTime — full cycle time
  - MessagesAttempted vs MessagesAccepted — RBE effectiveness
- ConnectCount / DisconnectCount / FaultCount — connection stability
- Monitoring $SYSTEM paths: route them to Splunk or InfluxDB for alerting
- Diagram: connector lifecycle state machine with transitions and recovery paths

---

## 19 — Connector UX — Desktop Management App

**Goal:** Introduce the desktop application for managing local DIME instances.

**Content:**
- What it is: cross-platform desktop app (Windows, macOS, Linux) built with Tauri + React
- Multi-instance management: connect to several DIME instances at once
- Live dashboard: real-time status cards with health indicators and throughput
- Configuration editor: built-in Monaco editor with YAML syntax highlighting
- Schema browser: interactive navigator of all configuration options
- Live data stream: watch messages flowing through the ring buffer in real time
- Event log: filterable, searchable history with export capability
- Adapter control: start/stop individual connectors from the UI
- Connection setup: point at the Admin API address (http://host:9999)
- Diagram: desktop app connected to multiple DIME instances across the network

---

## SCALING & DEPLOYMENT

---

## 20 — Report By Exception

**Goal:** Explain RBE as a standalone concept — the single most important optimization.

**Content:**
- The problem: a PLC reports temperature every second, but it only changes once a minute
- Without RBE: 60 messages per minute, 59 are duplicates
- With RBE: 1 message per minute — 98% reduction in data volume
- Connector-level RBE: rbe: true on the source — applies to all items
- Item-level RBE: rbe: true on individual items — fine-grained control
- How it works: DIME caches the last value and compares before publishing
- Override with emit(path, value, true): the force flag bypasses RBE for critical data
- When NOT to use RBE: event streams where every message matters (alarms, production counts)
- execute_every: run an item only every N scan cycles (complementary throttling)
- Impact diagram: bar chart showing messages with vs without RBE across a timeline

---

## 21 — Multi-File Configs & YAML Anchors

**Goal:** Show how to organize complex configurations cleanly.

**Content:**
- Single-file works for simple setups: everything in main.yaml
- Multi-file: split sources and sinks into separate YAML files
- Loading order: all *.yaml files in the config directory are merged, main.yaml last
- main.yaml as override: set app-level settings here, they win over other files
- YAML anchors (&name) and references (*name): define once, reuse everywhere
- Practical pattern: define shared MQTT settings once, reference in 10 sinks
- File organization examples:
  - By protocol: mqtt.yaml, opcua.yaml, influx.yaml
  - By machine: lathe-01.yaml, mill-02.yaml, robot-03.yaml
  - By role: sources.yaml, sinks.yaml, transforms.yaml
- The enabled flag: disable a connector without deleting its file
- Diagram: multiple YAML files merging into one running configuration

---

## 22 — Scaling: Instance Chaining

**Goal:** Show how DIME scales from one machine to an entire enterprise.

**Content:**
- Single instance: merge + fork within one ring buffer
- Instance chaining: one DIME's sink protocol feeds another DIME's source protocol
- Chaining protocols table: MQTT, SparkplugB, MTConnect, SHDR, HTTP, WebSocket, Redis, ActiveMQ
- Three-tier topology: Edge (factory floor) -> Aggregator (plant server) -> Analytics (cloud)
- Edge instances: collect from devices, normalize, forward via MQTT or SHDR
- Aggregator: merge all edge streams, serve dashboards, forward to cloud
- Cloud: fan out to analytics platforms (Splunk, InfluxDB, MongoDB)
- Hot reconfiguration: POST /connector/add/sink to add sinks at runtime, zero downtime
- Multi-platform deployment: Windows service + Linux Docker + ARM64 edge gateway
- The math: N edges x M devices, one YAML per edge, one aggregator config

---

## 23 — Deploying as a Service

**Goal:** Production deployment on Windows and Linux without Docker.

**Content:**
- Windows service installation:
  - DIME.exe install — registers as a Windows service
  - net start DIME / net stop DIME
  - Runs under Local System by default
  - Config directory next to the executable or via --config
- Linux systemd service:
  - install-dime-connector.sh script: extracts, installs, creates systemd unit
  - Custom config directory with -d flag
  - systemctl start/stop/status dime-connector
  - Logs in /opt/dime-connector/Logs/
  - Uninstall with -U flag
- Service health: systemd watchdog or Windows service recovery options
- Log rotation and management
- Running multiple instances on one machine: different ports, different config dirs
- Diagram: OS service manager -> DIME process -> config directory -> log output

---

## 24 — Docker & Container Deployment

**Goal:** Show containerized deployment for cloud and edge scenarios.

**Content:**
- Docker image: multi-stage build for minimal image size
- Running a container: docker run with volume mount for Configs directory
- Docker Compose: define DIME + InfluxDB + Grafana in one file
- Configuration volume: mount your YAML files into /app/Configs
- Port mapping: expose 9999 (REST), 9998 (WebSocket), plus protocol ports
- Non-root execution: container runs as unprivileged user
- Restart policy: unless-stopped for production resilience
- ARM64 support: deploy on Raspberry Pi and edge gateways
- Kubernetes: StatefulSet for persistent config, ConfigMap for YAML
- Diagram: Docker host with DIME container, volume mounts, port mappings, and companion containers

---

## ENTERPRISE FLEET

---

## 25 — DIME Horizon — Site Gateway

**Goal:** Explain Horizon as the bridge between edge connectors and cloud management.

**Content:**
- What Horizon does: manages all DIME Connectors at a physical site
- Pull-based architecture: Horizon reaches out to Zenith — no inbound firewall rules
- Configuration: zenith URI, authentication key, check-in interval, list of local connectors
- Connector registration: each local DIME instance identified by admin_http_uri and admin_ws_uri
- Check-in cycle:
  1. Horizon contacts Zenith on schedule
  2. Sends local connector status summary
  3. Receives pending tasks from Zenith
  4. Executes tasks on local connectors via their Admin API
  5. Reports results back to Zenith
- Supported tasks: get_connector_status, get_connector_config, set_connector_config, restart_connector, get_connector_data
- Horizon self-management: get_horizon_config, set_horizon_config, restart_horizon
- Deployment: Windows service, Linux systemd, or Docker
- Diagram: factory floor with multiple DIME instances -> Horizon gateway -> outbound to Zenith

---

## 26 — DIME Zenith — Cloud Command Center

**Goal:** Explain Zenith as the centralized fleet management server.

**Content:**
- What Zenith does: command and control for hundreds of Horizons and thousands of Connectors
- Architecture: ASP.NET Core minimal API backed by MongoDB
- Key-based authentication: each Horizon has a unique key
- MongoDB collections:
  - Horizons — metadata and check-in timestamps
  - Connectors — per-connector metadata across all sites
  - Connectors-Configuration — YAML configs stored centrally
  - Connectors-Status — live health and performance metrics
  - Connectors-Data — current data points
  - Tasks — task queue for Horizon execution
- API endpoints:
  - POST /horizon/{key}/checkin — Horizon check-in and task retrieval
  - POST /horizon/{key}/task/{id} — report task results
- Automatic stale detection: if a Horizon misses check-ins, Zenith generates data-refresh tasks
- Fleet-wide queries: aggregated health across all sites
- Diagram: cloud server with MongoDB, receiving check-ins from multiple Horizons across sites

---

## 27 — Zenith UX — Fleet Management Console

**Goal:** Show the desktop application for fleet-wide monitoring and management.

**Content:**
- What it is: desktop app (Tauri + React) for fleet operators
- Fleet tree view: hierarchical navigation — Zenith -> Horizons -> Connectors
- Live dashboard: fleet-wide metrics at a glance — connected, faulted, offline counts
- Deep-dive detail: click any connector to see its config, status, and live data
- Integrated YAML editor: view and edit configurations, push changes through Zenith -> Horizon -> Connector
- Task management: issue manual tasks, track execution status and results
- Adapter-level control: start/stop individual connectors remotely from the console
- Configurable polling: tune refresh rates per view type (dashboard fast, config slow)
- Dark industrial theme: purpose-built for control rooms and operations centers
- Diagram: operator at Zenith UX -> Zenith server -> Horizon gateways -> DIME Connectors

---

## 28 — Three-Tier Architecture — Edge to Cloud

**Goal:** The big-picture enterprise deployment showing all three tiers working together.

**Content:**
- Tier 1 — Edge (DIME Connector):
  - Runs on factory floor, directly connected to machines
  - Collects from PLCs, robots, sensors via industrial protocols
  - Normalizes data with Lua scripts
  - Forwards via MQTT, SHDR, or HTTP to the next tier
  - Runs on Windows, Linux, ARM64, Docker
- Tier 2 — Gateway (DIME Horizon):
  - One per site (factory, plant, warehouse)
  - Manages all local DIME Connectors
  - Bridges to Zenith in the cloud
  - Pull-based: no inbound firewall rules needed
  - Executes remote tasks (config push, restart, data retrieval)
- Tier 3 — Cloud (DIME Zenith + Zenith UX):
  - Centralized fleet management for all sites
  - MongoDB-backed for scalability
  - Automatic health monitoring and stale detection
  - Zenith UX for human operators
- Communication flow: devices -> Connector -> Horizon -> Zenith -> Zenith UX
- Scale numbers: 1 Zenith, 50 Horizons, 500 Connectors, 50,000 data points
- Diagram: three-tier tower with devices at bottom, cloud at top, data flowing up, commands flowing down

---

## ADVANCED

---

## 29 — Performance Tuning & Ring Buffer

**Goal:** Help integrators optimize DIME for high-throughput or resource-constrained environments.

**Content:**
- Ring buffer sizing: app.ring_buffer — must be power of 2 (e.g., 4096, 8192, 16384)
- Larger buffer: handles burst traffic, uses more memory
- Smaller buffer: lower latency, less memory, risk of backpressure
- scan_interval tuning: balance between freshness and CPU load
  - 100ms for real-time dashboards
  - 1000ms for typical monitoring
  - 5000ms+ for slow-changing data
- execute_every: run expensive items less frequently (every 5th or 10th cycle)
- RBE impact: enabling Report By Exception reduces ring buffer pressure dramatically
- Double-buffer pattern: how sinks decouple receive speed from write speed
- Backpressure: what happens when a slow sink can't keep up
- Lua script optimization: keep scripts fast — avoid heavy computation in item scripts
- Monitoring performance: use $SYSTEM metrics (TotalLoopTime, ScriptTime) to find bottlenecks
- Diagram: ring buffer with producers and consumers, showing buffer utilization and flow rates

---

## 30 — Troubleshooting & Common Pitfalls

**Goal:** Save integrators hours by covering the most frequent issues and how to fix them.

**Content:**
- "No data flowing" checklist:
  1. Is the connector enabled? (enabled: !!bool true)
  2. Is the source connected? (check $SYSTEM/IsConnected or GET /status)
  3. Are items configured with correct addresses?
  4. Is RBE hiding unchanged values? (try rbe: false temporarily)
  5. Are sink filters too restrictive? (check include_filter/exclude_filter regex)
- "Connector keeps faulting" — check FaultReason in status, verify network/credentials
- "Lua script errors" — check ScriptTime metric, use Console sink to debug script output
- "Messages not reaching sink" — verify path format (sourceName/itemName), check strip_path_prefix setting
- "High CPU usage" — scan_interval too low, script too complex, too many items
- "Memory growing" — ring_buffer too large, sink not consuming fast enough
- Common YAML mistakes: missing !!bool, !!int type tags, indentation errors, anchor/reference mismatches
- The Console sink: your best friend for debugging — always add one during development
- GET /status: the single most useful diagnostic command
- Diagram: decision tree / flowchart for diagnosing the top 5 issues
