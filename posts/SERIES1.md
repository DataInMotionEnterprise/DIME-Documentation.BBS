# DIME LinkedIn Post Series 1 — The Complete Platform

**30 posts. One per documentation page. Each with AI image prompt.**

Series hashtags (use 5-8 per post, rotate):
`#IIoT #Industry40 #DataIntegration #Manufacturing #OPCUA #MQTT #IndustrialAutomation #EdgeComputing #SCADA #SmartFactory #DigitalTransformation #IndustrialIoT #MTConnect #FactoryAutomation #ConnectedFactory #DataEngineering #DevOps #Docker #TimeSeries #OTSecurity`

---

## Post 01 — What is DIME?

**Link:** https://dimebbs.com/#page-01

Every factory floor tells the same story:

5 devices. 4 destinations. 20 custom integrations to build, test, and maintain. Each one a unique codebase. Each one breaks independently. Add one new machine? Write 4 more integrations. The matrix grows quadratically.

DIME flips this on its head.

Every device connects to DIME. DIME connects to every destination. 5 devices + 4 destinations = 9 simple YAML configs. Linear scaling instead of quadratic. Zero custom code.

How it works:
- Configure a SOURCE — point it at your device
- Configure a SINK — point it at your destination
- Run DIME — data flows. Done.

Under the hood, a lock-free Disruptor ring buffer routes every message with sub-millisecond latency and handles 1M+ messages per second. 47+ connector types out of the box.

From PLC to database in 12 lines of YAML.

This is post 1 of 30 walking through DIME — Data In Motion Enterprise.

https://dimebbs.com/#page-01

#IIoT #Industry40 #DataIntegration #Manufacturing #OPCUA #MQTT #EdgeComputing

**IMAGE PROMPT:**
A dramatic wide-format digital illustration showing industrial data integration. On the left, five glowing industrial devices (CNC, PLC, robot arm, sensor array, MQTT antenna) connected by tangled chaotic red/orange neon wires creating a dense mesh of 20 crisscrossing connections going to four destinations. A bold "BEFORE / AFTER" divider. On the right, the same five devices each send a single clean cyan data stream into a central dark monolith labeled "DIME" with a glowing circular ring buffer inside it. From DIME, four clean organized streams flow to destinations. Dark background, industrial-tech aesthetic, neon glow (amber and cyan), blueprint feel. 16:9 aspect ratio. The contrast between chaotic left and elegant right should be striking.

---

## Post 02 — The DIME Ecosystem

**Link:** https://dimebbs.com/#page-02

DIME isn't just one tool. It's a three-tier architecture designed to scale from a single machine to an entire enterprise.

**Connector** (Edge) — The workhorse. Runs on the factory floor. 50+ protocols, sub-millisecond latency, zero-code YAML config. Windows, Linux, Docker, ARM64.

**Horizon** (Gateway) — One per site. Bridges edge to cloud using pull-based sync. Zero inbound firewall rules. Graceful offline operation. If the cloud goes down, the factory doesn't.

**Zenith** (Cloud) — Fleet command center. Hundreds of sites, thousands of connectors, one dashboard. MongoDB-backed config versioning and automated health monitoring.

Plus two desktop apps:
- **Zenith UX** — Fleet management console (Tauri + React)
- **Connector UX** — Local operations console with live WebSocket feed

Data flows up. Commands flow down. No VPNs. No port forwarding. Just pull-based HTTPS.

https://dimebbs.com/#page-02

#IIoT #EdgeComputing #Industry40 #SmartFactory #DigitalTransformation #CloudComputing

**IMAGE PROMPT:**
A vertical three-tier architecture diagram rendered as a glowing neon hologram floating in a dark industrial space. Bottom tier: a factory floor with glowing machines and edge devices connected to small DIME Connector cubes. Middle tier: a site server room with a Horizon gateway node pulsing with data. Top tier: a cloud layer with the Zenith command center radiating control signals downward. Cyan data streams flow upward, amber command streams flow downward. Each tier is labeled. Dark moody atmosphere, holographic projection aesthetic, teal and amber neon on black. 16:9.

---

## Post 03 — Installation

**Link:** https://dimebbs.com/#page-03

Getting DIME running takes about 60 seconds.

Windows: Download, unzip, run DIME.exe. That's it.
Linux: curl the install script, run it. Done.
Docker: `docker run` with a config volume mount.

DIME starts, loads every YAML file in the config directory, merges them together (main.yaml loaded last for overrides), and begins reading from sources and writing to sinks.

No dependencies. No runtime. No installer wizard. Just an executable and a config folder.

Runs on x86, x64, and ARM64. Windows Service, Linux systemd daemon, or Docker container. Even a Raspberry Pi.

Ports:
- 9999 — REST API (always on)
- 9998 — WebSocket (always on)

Zero to data flowing in under a minute.

https://dimebbs.com/#page-03

#IIoT #DevOps #EdgeComputing #Docker #Industry40 #Manufacturing

**IMAGE PROMPT:**
A split-screen showing three installation paths for industrial software. Left panel: a Windows terminal with a single command running, a green checkmark. Center panel: a Linux terminal with curl piping to bash, green checkmark. Right panel: a Docker terminal with docker run, green checkmark. All three converge into a glowing DIME logo at the bottom center with data streams flowing outward. A stopwatch showing "60 seconds" floats above. Dark background, monospace terminal font aesthetic, green-on-black CRT glow. 16:9.

---

## Post 04 — YAML Configuration

**Link:** https://dimebbs.com/#page-04

Every DIME integration is defined in YAML. No code. No compilation. No deployment pipeline.

Three sections:
- **app** — Global settings (ring buffer size, admin ports, logging)
- **sources** — What to read (device, protocol, items, scripts)
- **sinks** — Where to write (database, broker, API, file)

Each connector gets a name, a type, and its protocol-specific settings. Items define what data points to read. Scripts transform values inline.

YAML type tags matter: `!!bool true`, `!!int 1000`. Without them, DIME reads strings. With them, it reads the right type.

Multiple files merge together automatically. main.yaml loads last and wins on conflicts. YAML anchors let you define connection templates once and reuse them across dozens of connectors.

One file for simple setups. Ten files for complex plants. Same engine either way.

https://dimebbs.com/#page-04

#IIoT #DataIntegration #YAML #Manufacturing #IndustrialAutomation #DevOps

**IMAGE PROMPT:**
A stylized YAML configuration file floating as a 3D holographic document in a dark industrial control room. The YAML text glows in amber monospace font, with three distinct sections highlighted in different colors: "app" in white, "sources" in green, "sinks" in cyan. Arrows flow from the sources section through a central ring buffer graphic to the sinks section. Small icons of industrial devices (PLCs, sensors, robots) float near the sources, and database/cloud icons float near the sinks. Dark background, holographic document aesthetic. 16:9.

---

## Post 05 — Architecture

**Link:** https://dimebbs.com/#page-05

DIME's architecture is deceptively simple: Read, Route, Write.

**Sources** read data from devices on a configurable timer. Each read produces a MessageBoxMessage — a lightweight envelope containing path, data, timestamp, and metadata.

**Ring Buffer** routes every message to every sink using the Disruptor pattern. Lock-free. Pre-allocated. Zero garbage collection pressure. Sub-millisecond throughput.

**Sinks** receive every message and apply their own filters to decide what to keep. Fan-out, not routing — the buffer doesn't decide where data goes. Sinks do.

Every connector follows a six-stage lifecycle: Initialize, Create, Connect, Read/Write, Disconnect, Deinitialize. Faults trigger automatic disconnect-reconnect cycles. DIME never gives up on a connector.

Four source base classes handle every pattern:
- PollingSource — timer-driven reads
- QueuingSource — event-driven push
- BatchPollingSource — bulk database queries
- DatabaseSource — SQL result sets

All of this is managed by a REST API (port 9999) and WebSocket stream (port 9998) that are always on.

https://dimebbs.com/#page-05

#IIoT #DataEngineering #Industry40 #EdgeComputing #Manufacturing #SoftwareArchitecture

**IMAGE PROMPT:**
A cross-section schematic of the DIME engine rendered as a glowing technical blueprint. On the left, multiple source connectors (shown as glowing input ports) feed into a central circular ring buffer visualized as a spinning torus of data particles. On the right, multiple sink connectors (output ports) receive the data. The six-stage lifecycle (Initialize, Create, Connect, Read, Disconnect, Deinitialize) is shown as a circular state machine diagram below. Everything rendered in cyan and amber neon lines on a dark navy blueprint grid. Engineering schematic aesthetic. 16:9.

---

## Post 06 — Source Connectors

**Link:** https://dimebbs.com/#page-06

DIME ships with 30+ source connector types. If it has a network port or an API, DIME can probably read from it.

**Industrial PLCs:**
Siemens S7, Rockwell EtherNet/IP, Beckhoff ADS, Modbus TCP — point at the IP, list the tags, set a scan interval.

**Message Brokers:**
MQTT Subscribe, SparkplugB, ActiveMQ, Redis — subscribe to topics, parse payloads with Lua.

**Databases:**
SQL Server, PostgreSQL — parameterized queries on a timer, each row becomes a message.

**Web & IoT:**
JSON/XML web scrapers, HTTP server (receive webhooks), UDP server, SNMP.

**CNC & Robotics:**
MTConnect, SHDR, FANUC FOCAS, Yaskawa, Haas.

And the **Script Source** — no device required. Generate data with pure Lua or Python. Perfect for simulators, computed values, or aggregations.

Every source type inherits from one of four base classes: Polling, Queuing, BatchPolling, or Database. The base class handles the lifecycle. You just configure the connection.

https://dimebbs.com/#page-06

#IIoT #OPCUA #Manufacturing #Modbus #MQTT #IndustrialAutomation #PLC #EdgeComputing

**IMAGE PROMPT:**
A radial diagram showing DIME at the center as a glowing hub, with 30+ source connectors arranged in a circle around it. Each connector is represented by a small glowing icon with its protocol name: PLCs (Siemens, Rockwell, Beckhoff), message brokers (MQTT, SparkplugB), databases (SQL, PostgreSQL), web (HTTP, JSON), CNC (MTConnect, FANUC). Bright data streams flow from each connector into the center. Grouped by category with subtle color coding: industrial in amber, messaging in green, databases in blue, web in purple. Dark background, constellation/network diagram aesthetic. 16:9.

---

## Post 07 — Sink Connectors

**Link:** https://dimebbs.com/#page-07

Every sink in DIME receives every message from the ring buffer. Filters determine what each sink keeps.

This is fan-out, not routing. The buffer doesn't decide where data goes — sinks do, with regex include/exclude filters.

**Time-Series & Analytics:** InfluxDB Line Protocol, Splunk HEC, Splunk Edge Hub SDK
**Databases:** MongoDB, PostgreSQL Batch
**Message Brokers:** MQTT Publish, SparkplugB Publish, Redis
**Manufacturing:** MTConnect Agent, MTConnect SHDR
**Servers:** OPC-UA Server, HTTP Server, WebSocket Server
**File Output:** CSV Writer, Logger, Console

One source feeding five sinks means the same data point lands in your historian, your dashboard, your cloud broker, your MES, and your debug console — simultaneously. No extra configuration per destination beyond the sink definition itself.

Add a new destination? Add three lines of YAML. No restart needed — hot-add via the REST API.

https://dimebbs.com/#page-07

#IIoT #DataIntegration #InfluxDB #Splunk #MQTT #Manufacturing #TimeSeries

**IMAGE PROMPT:**
A dramatic visualization of data fan-out. A single glowing ring buffer at the top emits data downward through a "SinkDispatcher" node that splits into five parallel streams, each flowing to a different destination: InfluxDB (time-series chart icon), Splunk (search icon), MQTT cloud (cloud icon), MongoDB (document icon), and a live dashboard (monitor icon). Each stream is a different color but all originate from the same source. The fan-out pattern creates a beautiful tree-like structure of light. Dark background, data flow visualization aesthetic. 16:9.

---

## Post 08 — Filtering & Routing

**Link:** https://dimebbs.com/#page-08

Every message in DIME has a path: `sourceName/itemName`

`plc1/temperature`, `mqtt/sensors/pressure`, `opcua/ns=2;s=Speed`

Sinks use regex filters to control what they receive:

**exclude_filter** — Drop matching messages. `".*\\$SYSTEM.*"` removes health metadata. Everything else passes through.

**include_filter** — Accept ONLY matching messages. `"plc1/.*"` means this sink only gets data from plc1. Everything else is ignored.

**strip_path_prefix** — Remove the source name from the path before writing. Useful when republishing to MQTT where the topic structure shouldn't include the DIME source name.

Three sinks on the same ring buffer. One gets only PLC data. One gets everything except system messages. One gets only MQTT data with prefixes stripped. Same data stream, three completely different views.

No data is copied. Only references. The ring buffer stays intact.

https://dimebbs.com/#page-08

#IIoT #DataIntegration #DataRouting #Manufacturing #MQTT #EdgeComputing

**IMAGE PROMPT:**
A visualization of data stream filtering. A wide horizontal pipe (the ring buffer) carries a dense flow of multicolored data particles. Three vertical filter gates branch off the pipe, each with a different regex pattern displayed on a glowing label. Gate 1 passes only blue particles (PLC data), Gate 2 passes everything except red particles (system messages), Gate 3 passes only green particles (MQTT) but strips their outer shell. Each gate feeds a different destination. Dark background, particle physics / data pipeline aesthetic with neon glow. 16:9.

---

## Post 09 — Scripting

**Link:** https://dimebbs.com/#page-09

DIME configs are zero-code. But when you need logic — unit conversions, JSON parsing, state machines, conditional routing — scripts handle it.

Lua or Python, inline or from files. Five hooks in the connector lifecycle:

1. **init_script** — Runs once at startup. Load lookup tables, initialize state.
2. **enter_script** — Runs before each scan cycle. Reset accumulators.
3. **item script** — Runs per item, every cycle. This is where transforms happen.
4. **exit_script** — Runs after all items. Aggregations, summaries, batch emits.
5. **deinit_script** — Runs once at shutdown. Cleanup.

The `result` variable holds the raw value from the device. Return the transformed value.

`return (result - 32) * 5 / 9` — Fahrenheit to Celsius. One line.

`emit("computed/oee", efficiency)` — Fork a new message from a script. One input, many outputs.

Lua is preferred for performance. Python is available when you need libraries.

https://dimebbs.com/#page-09

#IIoT #Lua #Python #DataTransformation #Manufacturing #EdgeComputing #IndustrialAutomation

**IMAGE PROMPT:**
A stylized code editor floating in a dark industrial space, showing a Lua script transforming data. The script glows in amber text. To the left, raw sensor data flows in (temperature: 72.5 F). To the right, transformed data flows out (temperature: 22.5 C). Five hook points are shown as glowing nodes along a vertical connector lifecycle timeline: init, enter, item, exit, deinit. The "item" node is highlighted and enlarged, showing the transform happening inside it. Dark background, code-meets-industrial aesthetic. 16:9.

---

## Post 10 — Cache API

**Link:** https://dimebbs.com/#page-10

What if one connector needs data from another?

DIME's cache API makes every data point in the system readable from any script.

`cache("plc1/temperature")` — Read the last known value from any other connector.
`cache_ts("plc1/temperature")` — Same, but also get the timestamp (for freshness checks).
`set("computed/oee", 87.5)` — Write a custom value to the cache without publishing to the ring buffer.

Use cases:
- Combine data from multiple PLCs into a single computed metric
- Running averages across scan cycles
- State machines that persist between reads
- Cross-connector threshold alerts
- Batch counters and shift summaries

`wait_for_connectors` delays a source until its dependencies are connected. No race conditions. No nil values on startup.

The cache is the shared memory of the DIME instance. Every connector writes to it automatically. Scripts read from it on demand.

https://dimebbs.com/#page-10

#IIoT #DataIntegration #Manufacturing #EdgeComputing #IndustrialAutomation #SmartFactory

**IMAGE PROMPT:**
A network diagram showing multiple DIME connectors (PLC, MQTT, OPC-UA, Script) as glowing nodes in a circle, all connected to a central shared cache represented as a glowing crystalline memory structure. Dotted lines show cache() read operations and set() write operations flowing between connectors through the cache. One script connector is highlighted, reading from three other connectors simultaneously to compute a value. Dark background, neural network / shared memory visualization aesthetic. 16:9.

---

## Post 11 — Templates & Output Formatting

**Link:** https://dimebbs.com/#page-11

Raw data from a PLC looks nothing like what your REST API expects. Templates bridge the gap.

Defined on the SOURCE. Rendered by the SINK. Three engines:
- **Scriban** — Mustache-like syntax. `{{ Message.Path }}`
- **Liquid** — Shopify's template language. Loops and conditionals.
- **Script** — Full Lua/Python for complex transformations.

Context variables available in every template:
`Message.Path`, `Message.Data`, `Message.Timestamp`, `Connector.Name`, `Connector.Type`, `Configuration.Address`

One source definition. Multiple sinks with `use_sink_transform: true`. Each sink renders the same template into the format its destination expects — JSON for an API, CSV for a file, a custom payload for a broker.

Templates handle OUTPUT formatting. Lua/Python scripts handle DATA logic. They work together: scripts transform and enrich on the source side, templates format the final output per sink.

https://dimebbs.com/#page-11

#IIoT #DataIntegration #Manufacturing #JSON #API #DataTransformation

**IMAGE PROMPT:**
A data transformation pipeline shown as a series of glowing stages. Raw data enters from the left as a simple key-value pair. It passes through a "Template Engine" module in the center, shown as a prism that splits one input into three different output formats: JSON (curly braces icon), CSV (grid icon), and a custom protocol payload. Each output format glows in a different color and flows to its respective sink (API, File, Broker). The template syntax `{{ Message.Data }}` floats as holographic text above the prism. Dark background, optical prism / data refraction aesthetic. 16:9.

---

## Post 12 — PLC to Dashboard (End-to-End)

**Link:** https://dimebbs.com/#page-12

The most common DIME pattern, start to finish:

**Step 1: OPC-UA Source** — Point at your PLC. List the tags. Set scan_interval to 1000ms.

**Step 2: Lua Transform** — Convert Celsius to Fahrenheit. One line: `return result * 1.8 + 32`

**Step 3: InfluxDB Sink** — Time-series historian. Every data point, nanosecond precision.

**Step 4: WebSocket Sink** — Live dashboard. Browser connects, receives JSON in real-time.

**Step 5: Console Sink** — Debug output. See every message flowing through the system.

One source. Three sinks. All receiving the same data simultaneously through the ring buffer.

Need a second machine? Copy the source block, change the IP. Same sinks catch it automatically.

50 machines? 50 source blocks. Still the same three sinks. Linear scaling.

This entire integration is one YAML file. No code. No compilation.

https://dimebbs.com/#page-12

#IIoT #OPCUA #InfluxDB #Manufacturing #Dashboard #DataIntegration #SmartFactory

**IMAGE PROMPT:**
A step-by-step flow diagram showing the journey of a temperature reading from a physical PLC to a live dashboard. Step 1: a Siemens PLC on a factory floor, glowing data point rises. Step 2: a Lua script icon transforms the value (22.5C becomes 72.5F). Step 3: the value splits into three streams — one to an InfluxDB time-series chart, one to a live WebSocket dashboard on a monitor, one to a console terminal. Each step is numbered and connected by flowing neon lines. Industrial factory floor fading into digital space. 16:9.

---

## Post 13 — MQTT Integration

**Link:** https://dimebbs.com/#page-13

MQTT is the lingua franca of IoT. DIME speaks it fluently — as both subscriber and publisher.

**Source:** Subscribe to topics. Every message becomes a DIME data point with the topic as the path. Wildcards supported. QoS 0, 1, or 2.

**Sink:** Republish to any broker. Edge to cloud. Local to remote. DIME becomes an MQTT bridge with filtering, transformation, and protocol translation built in.

**TLS/SSL:** Certificate-based encryption. Client certificates for mutual auth. Port 8883 standard.

**SparkplugB:** The industrial MQTT standard. Protobuf payloads, birth/death certificates, structured datatypes. DIME handles the encoding/decoding — you just configure topics and items.

**Edge-to-Cloud:** Subscribe locally on port 1883. Transform with Lua. Republish to cloud broker on port 8883 with TLS. One YAML file.

Clean session, retain flags, QoS levels — all configurable per connector.

https://dimebbs.com/#page-13

#MQTT #IIoT #SparkplugB #EdgeComputing #IoT #Manufacturing #IndustrialAutomation

**IMAGE PROMPT:**
A split visualization showing MQTT data flow through DIME. Left side: a local factory with sensors publishing to a local MQTT broker (port 1883, amber glow). Center: DIME as a glowing bridge node, subscribing on one side and publishing on the other, with a Lua script icon showing transformation happening in transit. Right side: a cloud MQTT broker (port 8883, cyan glow) with a TLS lock icon. SparkplugB protocol symbols (birth/death certificates) float as small icons. Data streams flow left to right through the bridge. Dark background, IoT network topology aesthetic. 16:9.

---

## Post 14 — Database Logging

**Link:** https://dimebbs.com/#page-14

Every data point that flows through DIME can land in a database. Multiple databases. Simultaneously.

**InfluxDB** — Line Protocol sink. Nanosecond timestamps. Batch writes. The go-to for time-series historians.

**SQL Server & PostgreSQL** — Relational sinks. Connection strings, batch inserts, stored procedures. Schema-aware writes.

**MongoDB** — Document sink. Schema-free. Automatic BSON structure: path, value, timestamp, source, item.

**CSV Writer** — File-based output. Auto-generated headers. Optional deduplication per path.

**Logger** — NLog integration. Rolling files. Structured JSON output.

And it works the other direction too: **BatchPollingSource** reads FROM databases using parameterized SQL queries on a timer. Each row becomes a message.

One ring buffer. Five database sinks. All running in parallel with zero performance penalty. Fan-out architecture means adding a destination never slows down existing ones.

https://dimebbs.com/#page-14

#IIoT #InfluxDB #MongoDB #TimeSeries #DataEngineering #Manufacturing #SQL

**IMAGE PROMPT:**
A central DIME ring buffer radiating outward to five different database destinations arranged in a semicircle below it. Each database is represented by its iconic visual: InfluxDB (time-series chart), SQL Server (table grid), MongoDB (document), CSV (spreadsheet), Logger (scrolling text file). Glowing data streams flow from the ring buffer to each database simultaneously. A reverse arrow shows BatchPollingSource reading FROM a database back into DIME. Dark background, database architecture diagram aesthetic with neon accents. 16:9.

---

## Post 15 — MTConnect & CNC

**Link:** https://dimebbs.com/#page-15

CNC machines speak MTConnect. DIME is fluent.

**Read from machines:** Poll any existing MTConnect agent. Subscribe to SHDR streams. Connect directly to FANUC and Yaskawa robots via native protocols.

**Become the agent:** DIME's MTConnect Agent sink turns any data source into a standards-compliant MTConnect endpoint. Non-MTConnect devices suddenly speak MTConnect.

Three MTConnect data types:
- SAMPLES — numeric, time-varying (spindle speed, axis position)
- EVENTS — discrete states (execution mode, program name)
- CONDITIONS — alarms and warnings

`emit_mtconnect()` maps raw device data to MTConnect semantic types in Lua. A Modbus register becomes a properly-typed SpindleSpeed sample. A digital input becomes an execution state EVENT.

DIME bridges the gap between what your machines actually speak and what your MES/analytics platform expects.

FANUC FOCAS, Yaskawa native, Haas SHDR — direct connections without an intermediate MTConnect agent.

https://dimebbs.com/#page-15

#MTConnect #CNC #Manufacturing #IIoT #SmartFactory #FactoryAutomation #MachineMonitoring

**IMAGE PROMPT:**
A factory floor scene with three CNC machines in a row (lathe, mill, robot arm). Each machine has a glowing data stream rising upward into a central DIME node. From DIME, a standards-compliant MTConnect XML document icon emerges, glowing with structured data (SAMPLES, EVENTS, CONDITIONS labeled). The MTConnect logo is visible. On the far right, an MES dashboard displays the standardized data. The scene transitions from physical industrial on the left to digital/data on the right. Dark factory atmosphere with cyan and amber neon accents. 16:9.

---

## Post 16 — Admin REST API

**Link:** https://dimebbs.com/#page-16

Every DIME instance ships with a REST API. Always on. No extra configuration. Port 9999.

`GET /status` — Full health snapshot. Every connector's state, fault count, message throughput, read/script/loop timing in milliseconds.

`GET /config/yaml` — The running configuration, exactly as DIME sees it.

`POST /connector/add/source/new_plc` — Hot-add a connector at runtime. No restart.

`POST /connector/stop/source/old_plc` — Stop one connector. Everything else keeps running.

`POST /config/reload` — Reload all YAML files. Zero downtime reconfiguration.

Swagger UI at `/swagger` — interactive API explorer in the browser. Try every endpoint, see every response schema.

This is how Connector UX, Horizon, and Zenith all communicate with DIME instances. The same API is available to your own scripts, monitoring tools, and CI/CD pipelines.

Zero downtime operations. Add, remove, restart connectors without touching the service.

https://dimebbs.com/#page-16

#IIoT #API #REST #DevOps #Manufacturing #IndustrialAutomation #EdgeComputing

**IMAGE PROMPT:**
A Swagger UI interface rendered as a glowing holographic panel floating in a server room. The panel shows REST endpoints listed vertically: GET /status (green), POST /connector/add (blue), POST /config/reload (amber). Each endpoint has a small response preview showing JSON data. Behind the panel, a rack of DIME instances hums with activity, status LEDs glowing. A hand interacts with the holographic panel, adding a new connector at runtime. Dark server room, holographic UI aesthetic. 16:9.

---

## Post 17 — WebSocket Monitoring

**Link:** https://dimebbs.com/#page-17

Every DIME instance streams live data over WebSocket. Port 9998. Always on.

Connect from a browser: `new WebSocket("ws://localhost:9998")`

Every message arrives as JSON: `{path: "plc1/temperature", data: 72.5, timestamp: 1708300800000}`

But DIME goes further. The **WebSocket Server** sink lets you create custom WebSocket endpoints on any port, with include/exclude filters. Only stream robot data on port 8092. Only stream PLC data on port 8093.

The **Web Server** sink serves static HTML/CSS/JS files from a folder. Combine it with a WebSocket Server sink and you have a complete, self-contained live dashboard — no external web server, no dependencies, no infrastructure.

DIME serves the page. DIME streams the data. The browser renders the chart. That's the entire stack.

From PLC to live chart with zero external dependencies.

https://dimebbs.com/#page-17

#IIoT #WebSocket #Dashboard #Manufacturing #RealTime #DataVisualization

**IMAGE PROMPT:**
A live industrial dashboard on a large monitor showing real-time charts and gauges. Glowing WebSocket connection lines flow from a DIME instance on the left into the browser on the right. The browser shows a dark-themed dashboard with live temperature charts, status indicators, and a message feed updating in real-time. Small JSON message packets are visible flowing along the WebSocket line: {path, data, timestamp}. A factory floor is visible through a window behind the monitor. Dark atmosphere, live data visualization aesthetic. 16:9.

---

## Post 18 — Health & Faults

**Link:** https://dimebbs.com/#page-18

DIME never gives up on a connector.

Every connector runs through a state machine: Initialized, Connected, Reading/Writing, and — when things go wrong — Faulted.

On fault: disconnect, wait, reconnect, resume. Automatically. Indefinitely. No human intervention required.

Every connector automatically publishes $SYSTEM health messages:
- `name/$SYSTEM/IsConnected`
- `name/$SYSTEM/IsFaulted`
- `name/$SYSTEM/Fault` (the error message)
- `name/$SYSTEM/ExecutionDuration`

These flow through the ring buffer like any other data. Route them to InfluxDB for health history. Route them to Splunk for alerting. Route them to a WebSocket dashboard for live status.

The Admin API adds per-connector metrics: MinimumReadMs, MaximumReadMs, LastLoopMs, MessagesAttempted, MessagesAccepted, FaultCount.

Your monitoring stack doesn't need a special integration for DIME. DIME IS the integration.

https://dimebbs.com/#page-18

#IIoT #Manufacturing #Monitoring #FaultTolerance #EdgeComputing #IndustrialAutomation

**IMAGE PROMPT:**
A connector state machine diagram rendered as a glowing circuit board layout. States shown as illuminated nodes: "Connected" (green), "Reading" (cyan), "Faulted" (red pulsing), "Reconnecting" (amber). Arrows show the auto-recovery cycle: fault triggers disconnect, disconnect triggers reconnect, reconnect restores to connected state. A continuous loop. Around the state machine, $SYSTEM health messages float as small data packets flowing into monitoring destinations (InfluxDB chart, Splunk dashboard, WebSocket feed). Dark background, circuit board / state machine aesthetic. 16:9.

---

## Post 19 — Connector UX

**Link:** https://dimebbs.com/#page-19

Managing DIME instances shouldn't require a terminal.

Connector UX is a cross-platform desktop app (Windows, macOS, Linux) built with Tauri and React. Connect to any DIME instance via its REST API and WebSocket.

**Live Dashboard** — Status cards for every connector. Green for connected, red for faulted, gray for offline. Health indicators update in real-time.

**Monaco YAML Editor** — Full syntax highlighting, validation, and autocomplete. Edit configs with the same editor that powers VS Code.

**Live Data Stream** — Real-time message viewer. See every data point as it flows through the ring buffer. Filter by path, search by value.

**Adapter Control** — Start, stop, add, remove connectors with a click. Hot reconfiguration without touching the service.

**Schema Browser** — Explore the structure of every connected device.

Multiple instances from one app. Factory floor to control room visibility.

https://dimebbs.com/#page-19

#IIoT #Manufacturing #DesktopApp #SCADA #HMI #IndustrialAutomation #SmartFactory

**IMAGE PROMPT:**
A sleek desktop application interface shown on a modern monitor in a factory control room. The app displays a dark industrial theme with a sidebar of DIME instances, a main area showing live connector health cards (green/red/gray status indicators), and a right panel showing a Monaco YAML editor with syntax-highlighted configuration. A smaller panel shows a real-time data stream scrolling with live values. The Tauri + React logo is subtly visible. Factory equipment is visible through a glass wall behind the workstation. Dark control room, modern industrial HMI aesthetic. 16:9.

---

## Post 20 — Report By Exception

**Link:** https://dimebbs.com/#page-20

A temperature sensor reads 72.5 every second. 60 messages per minute. 3,600 per hour. For a value that hasn't changed.

Report By Exception (RBE) fixes this.

DIME caches the last published value per item. If the new read matches the old value, it's suppressed. Only changes flow to sinks.

Result: 60 msg/min becomes 2 msg/min. 97% reduction.

10 sensors over one hour: 36,000 messages becomes ~600 messages. 98.3% reduction.

One flag: `rbe: !!bool true`

Set it on the source (applies to all items) or per item (override individually). Force-publish with `emit(path, value, true)` for heartbeats and watchdogs.

Combine with `every: !!int 10` to skip scan cycles entirely — a 1-second scan reads only every 10th cycle.

Less data. Less network traffic. Less storage. Less cost. Same information.

https://dimebbs.com/#page-20

#IIoT #DataOptimization #EdgeComputing #Manufacturing #TimeSeries #DataReduction

**IMAGE PROMPT:**
A before/after comparison. Left side: a dense waterfall of identical data points (all showing 72.5) flooding a network pipe, overwhelming databases below. The pipe is red and congested. Right side: the same time period but with RBE enabled — only 2-3 data points where the value actually changed pass through. The pipe is calm and cyan. A large "98% REDUCTION" label floats between the two sides. A gauge at the bottom shows bandwidth/storage savings. Dark background, data flow comparison aesthetic. 16:9.

---

## Post 21 — Multi-File Configs

**Link:** https://dimebbs.com/#page-21

One YAML file works for simple setups. But a plant with 50 machines, 10 databases, and 3 cloud brokers? That's where multi-file configs shine.

DIME loads every YAML file in the config directory. Alphabetical order. main.yaml loads last and wins on conflicts.

Source and sink arrays concatenate across files. One file per machine? Works. One file per protocol? Works. One file per role (sources vs sinks)? Works.

YAML anchors define templates once:
```
defaults: &plc_defaults
  connector: OpcUA
  scan_interval: !!int 1000
  rbe: !!bool true
```

Then reference them everywhere: `<<: *plc_defaults`

`enabled: !!bool false` disables a connector without deleting it. Comment-free, version-control-friendly.

Organize by what makes sense for your team. DIME doesn't care how you split the files — it merges them all into one running configuration.

https://dimebbs.com/#page-21

#IIoT #YAML #Configuration #DevOps #Manufacturing #IndustrialAutomation

**IMAGE PROMPT:**
Multiple YAML files shown as glowing document panes arranged in a fan pattern, each labeled (plcs.yaml, mqtt.yaml, sinks.yaml, main.yaml). Arrows from each file converge into a central merge point where they combine into a single unified configuration. The main.yaml file is highlighted as the "last loaded, wins" override. YAML anchor symbols (& and *) float as connecting nodes between files showing template reuse. Dark background, configuration management / version control aesthetic. 16:9.

---

## Post 22 — Instance Chaining

**Link:** https://dimebbs.com/#page-22

One DIME instance connects devices to databases. But what about an entire enterprise?

Instance chaining: the sink of one DIME becomes the source of another.

Edge DIME reads 10 PLCs via OPC-UA. Publishes to a local MQTT broker.
Aggregator DIME subscribes to that MQTT broker. Adds 5 more edge instances. Publishes to InfluxDB, Splunk, and a cloud broker.

Each instance is independent. Each has its own config. Each can be managed, restarted, and scaled independently.

Chaining protocols: MQTT, SparkplugB, MTConnect, SHDR, HTTP, WebSocket, Redis. Anything one DIME can sink, another DIME can source.

The math: N edges x 1 YAML per edge x 1 aggregator x M analytics destinations. Linear scaling at every tier.

Hot reconfiguration means you can add a new edge instance or a new analytics destination without restarting anything. `curl -X POST /connector/add/sink/new_destination`

https://dimebbs.com/#page-22

#IIoT #EdgeComputing #ScalableArchitecture #Manufacturing #Industry40 #DataIntegration

**IMAGE PROMPT:**
A three-tier network topology showing DIME instance chaining. Bottom tier: 5 small DIME edge nodes on a factory floor, each connected to industrial equipment. Middle tier: an aggregator DIME node collecting all edge data via MQTT links. Top tier: analytics destinations (InfluxDB, Splunk, Cloud). Glowing chain links connect each tier, representing the sink-to-source chaining pattern. Each DIME node is a glowing cube with data flowing through it. Dark background, enterprise network topology aesthetic with neon connections. 16:9.

---

## Post 23 — Service Deployment

**Link:** https://dimebbs.com/#page-23

DIME runs as a proper OS service. Start on boot. Restart on failure. No terminal window required.

**Windows Service:**
`DIME.exe install` — registered with Service Control Manager.
Named instances: `DIME.exe install /instance:PlantA` — run multiple on one machine with separate configs and ports.

**Linux systemd:**
`install-dime-connector.sh` — creates the unit file, enables the service.
`-d /path/to/configs` — custom config directory per instance.
`journalctl -u dime-connector -f` — live log tailing.

**Multiple instances on one machine:**
Each gets its own config directory and unique ports (REST 9001/9002/9003, WebSocket 9002/9003/9004). Each runs independently.

**Logging:** NLog-based. Daily rolling files. Configurable retention. JSON or text format. Change log levels at runtime without restart.

Production-grade deployment in one command.

https://dimebbs.com/#page-23

#IIoT #DevOps #WindowsService #Linux #Manufacturing #SystemAdmin #EdgeComputing

**IMAGE PROMPT:**
A split-screen server deployment visualization. Left: a Windows Server with the SCM (Service Control Manager) showing DIME services running with green status indicators. Three named instances listed: PlantA, PlantB, PlantC. Right: a Linux server with a terminal showing systemd status output for dime-connector, active (running) in green. Log files scroll in the background. Both sides converge at the bottom into a "PRODUCTION READY" banner. Dark server room aesthetic, ops dashboard feel. 16:9.

---

## Post 24 — Docker Deployment

**Link:** https://dimebbs.com/#page-24

```
docker run -v ./configs:/app/Configs -p 9999:9999 -p 9998:9998 dime-connector
```

One command. Config mounted. Ports exposed. Running.

Docker Compose takes it further: DIME + InfluxDB + Grafana in a single `docker-compose.yml`. A complete data collection and visualization stack.

Volume mounts: `/app/Configs`, `/app/Logs`, `/app/Scripts`
Ports: 9999 (REST), 9998 (WebSocket), plus any custom connector ports (MQTT, SHDR, HTTP).

Multi-arch images auto-select ARM64 for Raspberry Pi and industrial edge gateways. Same image, same config, different hardware.

ROS2 variants available: `latest-ros2-humble` and `latest-ros2-jazzy` for robotics applications.

Restart policy: `unless-stopped` — survives reboots, restarts on crash.

From a Raspberry Pi on the factory floor to a Kubernetes cluster in the cloud — same container, same YAML.

https://dimebbs.com/#page-24

#Docker #IIoT #EdgeComputing #Kubernetes #RaspberryPi #ROS2 #Manufacturing #DevOps

**IMAGE PROMPT:**
A Docker whale carrying a DIME container across a landscape that transitions from a factory floor on the left (with industrial machines and a Raspberry Pi) to a cloud data center on the right (with server racks). The container is transparent, showing YAML configs, log files, and scripts inside. Port numbers (9999, 9998) glow on the container surface. Multiple platforms float below: x86 chip, ARM64 chip, Kubernetes logo. Docker Compose connections link DIME to InfluxDB and Grafana containers nearby. Dark background, container orchestration aesthetic. 16:9.

---

## Post 25 — Horizon Gateway

**Link:** https://dimebbs.com/#page-25

Your factory needs to talk to the cloud. But opening inbound firewall ports to your OT network? No.

Horizon is DIME's site gateway. One per factory. It reaches OUT to Zenith in the cloud — never the other way around.

Pull-based architecture: Horizon contacts Zenith every 10 seconds, sends status, receives tasks, executes locally, reports results. All outbound HTTPS.

Zero inbound firewall rules. The cloud never initiates a connection to the factory floor.

Supported tasks:
- Get/set connector status
- Push configuration changes
- Retrieve live data
- Restart connectors
- Full config deployment

If the cloud goes down, Horizon keeps running. Connectors keep collecting data. Nothing stops. When the cloud comes back, Horizon resumes check-ins like nothing happened.

One Horizon manages multiple DIME Connector instances at a site. Each tracked by its unique REST/WebSocket ports.

https://dimebbs.com/#page-25

#IIoT #OTSecurity #EdgeComputing #CloudComputing #Manufacturing #CyberSecurity #Industry40

**IMAGE PROMPT:**
A secure gateway visualization. A factory building on the left (labeled "OT Network") is protected by a thick firewall wall with a large "NO INBOUND" sign. Inside the factory, a Horizon gateway node reaches OUTWARD through the firewall via a single encrypted HTTPS tunnel (shown as a glowing green arrow pointing right) to a Zenith cloud node on the right. The cloud sends commands back through the SAME outbound connection. No arrows point inward through the firewall. A clock shows "every 10 seconds" near the gateway. Dark, cybersecurity-themed aesthetic. 16:9.

---

## Post 26 — Zenith Cloud

**Link:** https://dimebbs.com/#page-26

One dashboard. Hundreds of sites. Thousands of connectors.

Zenith is DIME's cloud command center. ASP.NET Core Minimal API backed by MongoDB.

Every Horizon checks in, sends connector status, receives queued tasks. Zenith stores everything:
- Horizon registry
- Connector configurations
- Live status snapshots
- Current data values
- Task queue and history

Automatic stale detection: if a Horizon misses 3 consecutive check-ins, it's marked STALE. No false alarms from a single missed heartbeat.

Key-based authentication: each Horizon gets a unique GUID. Simple, secure, no token rotation.

Two endpoints. That's the entire API:
- `POST /horizon/{key}/checkin`
- `POST /horizon/{key}/task/{id}`

Fleet scale: 1 Zenith x 100s of Horizons x 1000s of Connectors = 50,000+ data points under one roof.

https://dimebbs.com/#page-26

#IIoT #CloudComputing #FleetManagement #Manufacturing #MongoDB #Industry40 #SCADA

**IMAGE PROMPT:**
A cloud command center visualization. A central Zenith server node sits in a cloud environment, connected to a MongoDB database below it. Radiating outward like spokes of a wheel, dozens of Horizon gateway connections reach out to factory icons at the edges. Each factory has a status indicator: green (online), red (faulted), amber (stale). A fleet dashboard overlay shows aggregate metrics: "247 Connectors Online, 3 Faulted, 1 Stale". The entire visualization has a fleet command center / mission control aesthetic. Dark background, cloud architecture diagram with status-colored indicators. 16:9.

---

## Post 27 — Zenith UX

**Link:** https://dimebbs.com/#page-27

Managing a fleet of industrial data connectors across hundreds of sites needs a proper console.

Zenith UX is a desktop app built with Tauri and React. Dark industrial theme designed for control rooms.

**Fleet Tree View** — Zenith at the top, Horizons below, Connectors at the leaves. Color-coded: green, red, gray, amber. Expand any branch to drill down.

**Live Dashboard** — Fleet-wide health at a glance. Connected count, faulted count, offline count. Auto-refreshing.

**Deep-Dive Detail** — Click any connector for three tabs: STATUS (metrics), CONFIG (YAML), DATA (current values).

**Remote YAML Editing** — Edit a connector's config in the built-in editor, push it through the chain: UX to Zenith to Horizon to Connector. Hot reload. Zero downtime.

**Task Management** — Issue commands to remote connectors. Track execution: pending, executing, done.

See everything. Control everything. From one seat.

https://dimebbs.com/#page-27

#IIoT #FleetManagement #DesktopApp #Manufacturing #SCADA #Industry40 #SmartFactory

**IMAGE PROMPT:**
A premium desktop application interface on an ultra-wide monitor in a dark operations center. The screen shows a hierarchical tree on the left (Zenith > Factory Sites > Connectors), a central dashboard with health status cards arranged in a grid (green/red/amber indicators), and a right panel showing a YAML editor with a "PUSH TO SITE" button glowing. A task management panel at the bottom shows pending/executing/done tasks. Multiple wall-mounted screens in the background show other fleet views. Dark, mission control / NOC aesthetic. 16:9.

---

## Post 28 — Edge to Cloud

**Link:** https://dimebbs.com/#page-28

This is the big picture. Three tiers working together.

**Edge** (Factory Floor):
~500 DIME Connectors across all sites. Windows, Linux, ARM64, Docker. 50+ protocols. ~50,000 data points. Reading PLCs, sensors, robots, CNCs.

**Gateway** (Site Level):
~50 Horizons. One per factory. Managing all local connectors. Pull-based bridge to the cloud. Offline-resilient. Zero inbound firewall rules.

**Cloud** (Enterprise):
1 Zenith. Hundreds of sites. Thousands of connectors. One dashboard. MongoDB-backed. Auto-stale detection.

Data flows UP: Device to Connector (read, transform) to Horizon (aggregate, forward) to Zenith (store, monitor) to UX (visualize).

Commands flow DOWN: UX to Zenith (queue) to Horizon (pull on check-in) to Connector (push, restart).

No VPNs. No port forwarding. No special networking. Just outbound HTTPS from every site.

1 Zenith x 50 Horizons x 10 Connectors x 100 items = 50,000 data points. All managed from one seat.

https://dimebbs.com/#page-28

#IIoT #EdgeToCloud #Industry40 #Manufacturing #DigitalTransformation #SmartFactory #Enterprise

**IMAGE PROMPT:**
A dramatic three-tier infographic spanning the full width. Bottom: a factory floor panorama with hundreds of glowing machines, each connected to small DIME Connector nodes. Middle: site-level Horizon gateways as glowing bridge structures, data streams flowing upward through encrypted tunnels. Top: a single Zenith cloud command center with a global map showing all factory locations as glowing dots. Upward arrows labeled "DATA" in cyan. Downward arrows labeled "COMMANDS" in amber. The whole image conveys massive scale — from individual sensors to global fleet. Dramatic dark background, enterprise architecture poster aesthetic. 16:9.

---

## Post 29 — Performance Tuning

**Link:** https://dimebbs.com/#page-29

DIME handles 1M+ messages per second out of the box. But every environment is different.

**Ring Buffer Sizing:**
Power-of-2 values. 1024 for low-memory edge devices. 4096 default. 32768 for burst-heavy workloads. Bitwise AND index wrapping — O(1) performance regardless of size.

**Scan Interval:**
50ms for vibration monitoring. 1000ms for standard PLC polling. 60000ms for slow config reads. Balance frequency against CPU load.

**RBE Impact:**
A 1-second scan on 100 items generates 6,000 msg/min. RBE drops it to ~300 msg/min. 95% reduction. Less ring buffer pressure, less network, less storage.

**Double-Buffer Pattern:**
Messages accumulate in a receive buffer while the write buffer drains. Decouples read speed from write speed.

**Backpressure Detection:**
Memory growth? High LastLoopMs? Stale data? The `/status` endpoint tells you exactly where the bottleneck is: LastReadMs, LastScriptMs, LastLoopMs, MessagesAttempted vs Accepted.

Built-in diagnostics. No external profiling tools needed.

https://dimebbs.com/#page-29

#IIoT #Performance #EdgeComputing #DataEngineering #Manufacturing #Optimization

**IMAGE PROMPT:**
A performance dashboard showing DIME metrics as a racing car telemetry display. Gauges show: Ring Buffer utilization (green zone), Messages/sec (1M+ needle), LastReadMs (sub-millisecond), CPU Load (low). A before/after comparison: left gauge showing 6000 msg/min without RBE, right gauge showing 300 msg/min with RBE (95% reduction arrow). A double-buffer diagram at the bottom shows read/write decoupling. Everything rendered in a high-performance racing/telemetry aesthetic with amber and cyan neon on dark background. 16:9.

---

## Post 30 — Troubleshooting

**Link:** https://dimebbs.com/#page-30

Something's not working? Five-step checklist:

1. Is the connector enabled? (`enabled: !!bool true` — not `enabled: true`, which is a string)
2. Is it connected? (`GET /status` — check IsConnected)
3. Are item addresses correct? (typos are the #1 cause of empty data)
4. Is RBE hiding unchanged values? (disable temporarily to verify)
5. Are sink filters too restrictive? (check include/exclude regex patterns)

**Faults:** Check FaultMessage in `/status`. Verify network connectivity and credentials. Watch FaultCount — if it's growing, the connector is retrying and failing.

**Lua errors:** Nil access, type mismatch, missing return statement. Add a Console sink and test your transform with known values.

**YAML gotchas:** Missing `!!bool` and `!!int` type tags. Indentation errors. Unquoted special characters. Anchor/alias mismatches.

The Console sink is your best debugging friend. Add it, see everything flowing through the system, remove it before production.

Three diagnostics that solve 90% of issues:
- Console sink (is data there?)
- `GET /status` (is it healthy?)
- `GET /config/yaml` (is the config right?)

https://dimebbs.com/#page-30

#IIoT #Troubleshooting #Manufacturing #DevOps #DataIntegration #IndustrialAutomation

**IMAGE PROMPT:**
A diagnostic/troubleshooting visual styled as a medical scan of the DIME system. A DIME instance is shown as a transparent body with internal organs visible: ring buffer (heart), connectors (limbs), cache (brain). A diagnostic scanner beam sweeps across, highlighting areas with issues in red (faulted connector, YAML error, nil script value) and healthy areas in green. A checklist floats to the side with 5 items being checked off. Console output scrolls at the bottom showing live debug data. Dark background, medical diagnostic / X-ray scan aesthetic with neon overlays. 16:9.

---

## Series Summary

| # | Topic | Link |
|---|-------|------|
| 01 | What is DIME? | https://dimebbs.com/#page-01 |
| 02 | The DIME Ecosystem | https://dimebbs.com/#page-02 |
| 03 | Installation | https://dimebbs.com/#page-03 |
| 04 | YAML Configuration | https://dimebbs.com/#page-04 |
| 05 | Architecture | https://dimebbs.com/#page-05 |
| 06 | Source Connectors | https://dimebbs.com/#page-06 |
| 07 | Sink Connectors | https://dimebbs.com/#page-07 |
| 08 | Filtering & Routing | https://dimebbs.com/#page-08 |
| 09 | Scripting | https://dimebbs.com/#page-09 |
| 10 | Cache API | https://dimebbs.com/#page-10 |
| 11 | Templates & Formatting | https://dimebbs.com/#page-11 |
| 12 | PLC to Dashboard | https://dimebbs.com/#page-12 |
| 13 | MQTT Integration | https://dimebbs.com/#page-13 |
| 14 | Database Logging | https://dimebbs.com/#page-14 |
| 15 | MTConnect & CNC | https://dimebbs.com/#page-15 |
| 16 | Admin REST API | https://dimebbs.com/#page-16 |
| 17 | WebSocket Monitoring | https://dimebbs.com/#page-17 |
| 18 | Health & Faults | https://dimebbs.com/#page-18 |
| 19 | Connector UX | https://dimebbs.com/#page-19 |
| 20 | Report By Exception | https://dimebbs.com/#page-20 |
| 21 | Multi-File Configs | https://dimebbs.com/#page-21 |
| 22 | Instance Chaining | https://dimebbs.com/#page-22 |
| 23 | Service Deployment | https://dimebbs.com/#page-23 |
| 24 | Docker Deployment | https://dimebbs.com/#page-24 |
| 25 | Horizon Gateway | https://dimebbs.com/#page-25 |
| 26 | Zenith Cloud | https://dimebbs.com/#page-26 |
| 27 | Zenith UX | https://dimebbs.com/#page-27 |
| 28 | Edge to Cloud | https://dimebbs.com/#page-28 |
| 29 | Performance Tuning | https://dimebbs.com/#page-29 |
| 30 | Troubleshooting | https://dimebbs.com/#page-30 |
