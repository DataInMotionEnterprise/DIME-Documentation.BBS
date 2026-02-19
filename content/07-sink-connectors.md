```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        07 — Sink Connectors                           │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Where data goes.                               │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Fan-out to every destination.                  │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE KEY INSIGHT                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   Every sink receives EVERY message from the ring buffer.                                        │
│   Filters determine what each sink keeps. This is fan-out, not routing.                          │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TIME-SERIES & ANALYTICS                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│   │                          │  │                          │  │                          │       │
│   │  InfluxDB (Line Proto)   │  │  Splunk HEC              │  │  Splunk Edge Hub SDK     │       │
│   │                          │  │                          │  │                          │       │
│   │  Writes InfluxDB line    │  │  HTTP Event Collector.   │  │  v1 and v2 SDK modes.    │       │
│   │  protocol over HTTP.     │  │  Pushes JSON events to   │  │  Direct Edge Hub         │       │
│   │                          │  │  Splunk via REST.        │  │  integration.            │       │
│   │  address: url            │  │                          │  │                          │       │
│   │  bucket: my_bucket       │  │  address: url            │  │  address: url            │       │
│   │  org: my_org             │  │  token: HEC-token        │  │  token: ...              │       │
│   │  token: my_token         │  │  index: main             │  │                          │       │
│   │                          │  │  source_type: dime       │  │                          │       │
│   │                          │  │                          │  │                          │       │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                                                  │
│   InfluxDB is the most common time-series destination. DIME formats data as line protocol        │
│   automatically. Splunk HEC enables enterprise analytics and alerting.                           │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DATABASES                                                                                      │
│   ─────────                                                                                      │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│   │                          │  │                          │  │                          │       │
│   │  MongoDB                 │  │  SQL Server              │  │  PostgreSQL              │       │
│   │                          │  │                          │  │                          │       │
│   │  Document store. Each    │  │  Relational DB. Batch    │  │  Relational DB.          │       │
│   │  message becomes a       │  │  inserts for throughput. │  │  Parameterized queries.  │       │
│   │  document.               │  │                          │  │                          │       │
│   │                          │  │  connection_string: ...  │  │  connection_string: ...  │       │
│   │  connection_string: ...  │  │  table: Readings         │  │  query: INSERT INTO ...  │       │
│   │  database: plant_data    │  │                          │  │                          │       │
│   │  collection: readings    │  │                          │  │                          │       │
│   │                          │  │                          │  │                          │       │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MESSAGE BROKERS                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                   │
│   │                      │  │                      │  │                      │                   │
│   │  MQTT Publish        │  │  SparkplugB Publish  │  │  ActiveMQ            │                   │
│   │                      │  │                      │  │                      │                   │
│   │  Publishes data to   │  │  Industrial MQTT     │  │  Publishes to JMS    │                   │
│   │  an MQTT broker.     │  │  with SparkplugB     │  │  queues/topics on    │                   │
│   │  Topic from message  │  │  metric encoding.    │  │  an ActiveMQ broker. │                   │
│   │  path or configured. │  │                      │  │                      │                   │
│   │                      │  │  address: broker     │  │  address: broker     │                   │
│   │  address: broker     │  │  group_id: plant1    │  │  port: 61616         │                   │
│   │  port: 1883          │  │  edge_node: line1    │  │  topic: output       │                   │
│   │  qos: 1              │  │                      │  │                      │                   │
│   │                      │  │                      │  │                      │                   │
│   └──────────────────────┘  └──────────────────────┘  └──────────────────────┘                   │
│                                                                                                  │
│   ┌──────────────────────┐                                                                       │
│   │                      │     Broker sinks republish data to messaging infrastructure.          │
│   │  Redis               │     Use include/exclude filters to control which messages             │
│   │                      │     get published. MQTT sink topic can mirror the message path.       │
│   │  address: host       │                                                                       │
│   │  port: 6379          │     Common pattern: MQTT source from one broker, MQTT sink            │
│   │  channel: output     │     to a different broker — DIME bridges the two.                     │
│   │                      │                                                                       │
│   └──────────────────────┘                                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MANUFACTURING — MTConnect                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐     │
│   │                                          │  │                                          │     │
│   │  MTConnect Agent Sink                    │  │  MTConnect SHDR Sink                     │     │
│   │                                          │  │                                          │     │
│   │  DIME becomes a full MTConnect agent.    │  │  Streams SHDR data to an external        │     │
│   │  Serves XML current/sample responses     │  │  MTConnect agent. DIME acts as an        │     │
│   │  on an HTTP port.                        │  │  adapter feeding SHDR text lines.        │     │
│   │                                          │  │                                          │     │
│   │  port: 5000                              │  │  port: 7878                              │     │
│   │  device: MyMachine                       │  │                                          │     │
│   │  sender: DIME                            │  │  Items mapped via emit_mtconnect()       │     │
│   │                                          │  │  or direct SHDR formatting.              │     │
│   │  Requires items mapped with              │  │                                          │     │
│   │  emit_mtconnect() in Lua scripts.        │  │                                          │     │
│   │                                          │  │                                          │     │
│   └──────────────────────────────────────────┘  └──────────────────────────────────────────┘     │
│                                                                                                  │
│   DIME can read from any protocol and expose data as MTConnect. This makes legacy                │
│   devices visible to any MTConnect-compatible monitoring system.                                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SERVERS — DIME AS A DATA ENDPOINT                                                              │
│   ─────────────────────────────────                                                              │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│   │                          │  │                          │  │                          │       │
│   │  OPC-UA Server           │  │  HTTP Server             │  │  WebSocket Server        │       │
│   │                          │  │                          │  │                          │       │
│   │  DIME becomes an OPC-UA  │  │  Serves data via HTTP    │  │  Pushes live data to     │       │
│   │  server. Clients browse  │  │  REST endpoints. Can     │  │  connected WebSocket     │       │
│   │  and subscribe to data   │  │  serve static files for  │  │  clients. Powers live    │       │
│   │  from any source.        │  │  self-contained UIs.     │  │  dashboards.             │       │
│   │                          │  │                          │  │                          │       │
│   │  port: 4840              │  │  port: 8080              │  │  port: 8092              │       │
│   │  endpoint: opc.tcp://... │  │  address: 0.0.0.0        │  │  address: 0.0.0.0        │       │
│   │                          │  │                          │  │                          │       │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                                                  │
│   Server sinks turn DIME into a data endpoint. Read from any protocol, serve via HTTP,           │
│   WebSocket, or OPC-UA. Build self-contained dashboards with zero external dependencies.         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FILE OUTPUT & DEBUG                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│   │                          │  │                          │  │                          │       │
│   │  CSV Writer              │  │  Logger (NLog)           │  │  Console                 │       │
│   │                          │  │                          │  │                          │       │
│   │  Writes data to CSV      │  │  Structured logging      │  │  Prints every message    │       │
│   │  files. Auto-headers.    │  │  via NLog. Routes to     │  │  to stdout. Your best    │       │
│   │  One row per message.    │  │  any NLog target.        │  │  friend for debugging.   │       │
│   │                          │  │                          │  │                          │       │
│   │  filename: output.csv    │  │  Uses nlog.config for    │  │  connector: Console      │       │
│   │  filter_duplicate_paths  │  │  target configuration.   │  │  No config needed.       │       │
│   │                          │  │                          │  │                          │       │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                                                  │
│   The Console sink is essential during development. Add one to every config while building.      │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FAN-OUT: ONE RING BUFFER → MANY SINKS                                                          │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   SinkDispatcher pushes every message to every registered sink.                                  │
│   Each sink decides what to keep with its own local filters.                                     │
│                                                                                                  │
│                          ┌──────────────────────────────────┐                                    │
│                          │                                  │                                    │
│                          │         Ring Buffer              │                                    │
│                          │     (all messages from all       │                                    │
│                          │      sources land here)          │                                    │
│                          │                                  │                                    │
│                          └────────────────┬─────────────────┘                                    │
│                                           │                                                      │
│                                    SinkDispatcher                                                │
│                                    fans out to ALL                                               │
│                                           │                                                      │
│               ┌───────────────┬───────────┼───────────┬───────────────┐                          │
│               │               │           │           │               │                          │
│               ▼               ▼           ▼           ▼               ▼                          │
│        ┌────────────┐  ┌────────────┐ ┌────────┐ ┌────────────┐ ┌──────────┐                     │
│        │ InfluxDB   │  │ Splunk     │ │ MQTT   │ │ MTConnect  │ │ Console  │                     │
│        │            │  │            │ │        │ │            │ │          │                     │
│        │ include:   │  │ exclude:   │ │ include│ │ include:   │ │ (all)    │                     │
│        │ plc/.*     │  │ .*\$SYS.*  │ │ robot/ │ │ cnc/.*     │ │          │                     │
│        │            │  │            │ │ .*     │ │            │ │ Raw      │                     │
│        │ Only PLC   │  │ Everything │ │        │ │ Only CNC   │ │ debug    │                     │
│        │ data.      │  │ minus sys. │ │ Robots │ │ data.      │ │ output.  │                     │
│        │            │  │            │ │ only.  │ │            │ │          │                     │
│        └────────────┘  └────────────┘ └────────┘ └────────────┘ └──────────┘                     │
│                                                                                                  │
│   No routing tables. No message brokers. Every sink sees everything and picks what it needs.     │
│   Add a new sink? It immediately receives every message. Remove a sink? Nothing else changes.    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   UNIVERSAL SINK CONFIG PATTERN                                                                  │
│   ─────────────────────────────                                                                  │
│                                                                                                  │
│   Every sink follows the same structure. Filters and templates are optional.                     │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: my_sink              # unique name for this sink                             │   │
│   │       connector: InfluxLP        # connector type (see catalog above)                    │   │
│   │       scan_interval: 5000        # ms between write flushes                              │   │
│   │       enabled: !!bool true       # disable without deleting                              │   │
│   │       address: https://influx    # protocol-specific endpoint                            │   │
│   │       bucket: plant_data         # protocol-specific config                              │   │
│   │       org: my_org                                                                        │   │
│   │       token: my_token                                                                    │   │
│   │       include_filter: plc/.*     # regex: only keep matching paths                       │   │
│   │       exclude_filter: .*\$SYS.* # regex: drop matching paths                             │   │
│   │       use_sink_transform: true   # apply source-side transform on sink                   │   │
│   │       template: >                # output formatting template                            │   │
│   │         {{ Message.Path }}: {{ Message.Data }}                                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   include_filter and exclude_filter are regex patterns matching the message Path.                │
│   If both are set, include is applied first, then exclude removes from the result.               │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
