```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        06 — Source Connectors                         │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          50+ ways to read data.                         │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Every protocol, one YAML config.               │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   INDUSTRIAL PLCs                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                   │
│   │                      │  │                      │  │                      │                   │
│   │  Siemens S7          │  │  Rockwell            │  │  Beckhoff ADS        │                   │
│   │                      │  │  EtherNet/IP         │  │                      │                   │
│   │  S7-300 / 400        │  │                      │  │  address: host       │                   │
│   │  S7-1200 / 1500      │  │  address: host       │  │  port: 851           │                   │
│   │                      │  │  port: 44818         │  │  target_ams_net_id   │                   │
│   │  address: 10.0.0.1   │  │  slot: 0             │  │  target_ams_port     │                   │
│   │  port: 102           │  │                      │  │                      │                   │
│   │  rack: 0  slot: 1    │  │  Items addressed by  │  │  Items addressed by  │                   │
│   │  cpu: S71500         │  │  tag name.           │  │  symbol or index.    │                   │
│   │                      │  │                      │  │                      │                   │
│   └──────────────────────┘  └──────────────────────┘  └──────────────────────┘                   │
│                                                                                                  │
│   ┌──────────────────────┐                                                                       │
│   │                      │                                                                       │
│   │  Modbus TCP          │     All industrial connectors are PollingSourceConnector.             │
│   │                      │     Timer-driven. scan_interval sets the read frequency.              │
│   │  address: host       │     Each item has an address native to the protocol.                  │
│   │  port: 502           │                                                                       │
│   │  unit_id: 1          │     Supports RBE (Report By Exception) per connector or item.         │
│   │  Items: register     │                                                                       │
│   │  address + type      │                                                                       │
│   │                      │                                                                       │
│   └──────────────────────┘                                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STANDARDS & ROBOTICS                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│   │  OPC-UA          │ │  OPC-DA          │ │  MTConnect       │ │  Haas SHDR       │            │
│   │                  │ │                  │ │                  │ │                  │            │
│   │  address: url    │ │  Windows only.   │ │  Reads from an   │ │  Direct SHDR     │            │
│   │  port: 4840      │ │  COM/DCOM based. │ │  existing agent. │ │  stream from     │            │
│   │  user / password │ │  prog_id: ...    │ │  address: url    │ │  Haas machines.  │            │
│   │  security_policy │ │                  │ │  device_key: ... │ │  address: host   │            │
│   │                  │ │                  │ │                  │ │  port: 7878      │            │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                                                  │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                                 │
│   │  FANUC Robot     │ │  Yaskawa Robot   │ │  ROS2            │                                 │
│   │                  │ │                  │ │                  │                                 │
│   │  address: host   │ │  address: host   │ │  Subscribes to   │                                 │
│   │  Direct FANUC    │ │  Direct Yaskawa  │ │  ROS2 topics.    │                                 │
│   │  protocol read.  │ │  protocol read.  │ │  Requires ROS2   │                                 │
│   │                  │ │                  │ │  Docker image.   │                                 │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘                                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MESSAGE QUEUES & BROKERS                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                   │
│   │                      │  │                      │  │                      │                   │
│   │  MQTT                │  │  SparkplugB          │  │  ActiveMQ            │                   │
│   │                      │  │                      │  │                      │                   │
│   │  address: broker     │  │  Industrial MQTT.    │  │  address: broker     │                   │
│   │  port: 1883          │  │  Birth/death certs.  │  │  port: 61616         │                   │
│   │  base_topic: #       │  │  Metric payloads.    │  │  topic: queue.name   │                   │
│   │  qos: 0 | 1 | 2      │  │                      │  │                      │                   │
│   │  tls: true/false     │  │  address: broker     │  │  JMS protocol.       │                   │
│   │  client_id: dime     │  │  group_id: plant1    │  │  Durable subs.       │                   │
│   │  username / password │  │  edge_node: line1    │  │                      │                   │
│   │                      │  │                      │  │                      │                   │
│   └──────────────────────┘  └──────────────────────┘  └──────────────────────┘                   │
│                                                                                                  │
│   ┌──────────────────────┐                                                                       │
│   │                      │     All messaging connectors are QueuingSourceConnector.              │
│   │  Redis Pub/Sub       │     Messages arrive asynchronously, are queued in an inbox,           │
│   │                      │     and drained to the ring buffer on timer.                          │
│   │  address: host       │                                                                       │
│   │  port: 6379          │     MQTT is the most common source in IoT and IIoT.                   │
│   │  channels: ch1,ch2   │     SparkplugB adds industrial semantics on top of MQTT.              │
│   │                      │                                                                       │
│   └──────────────────────┘                                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DATABASES (BATCH POLLING)                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   SQL Server Source                         PostgreSQL Source                            │   │
│   │   ─────────────────                         ────────────────                             │   │
│   │                                                                                          │   │
│   │   connection_string: Server=...;Database=... connection_string: Host=...;Database=...    │   │
│   │   query: SELECT col1, col2 FROM table        query: SELECT col1, col2 FROM table         │   │
│   │          WHERE timestamp > @last_read               WHERE timestamp > $1                 │   │
│   │                                                                                          │   │
│   │   BatchPollingSourceConnector: timer fires, execute query, iterate result set,           │   │
│   │   publish each row as a message. Use parameterized queries for incremental reads.        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WEB, API & NETWORK                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐        │
│   │  JSON Scraper     │ │  XML Scraper      │ │  HTTP Client      │ │  TCP ASCII        │        │
│   │                   │ │                   │ │                   │ │                   │        │
│   │  Fetch JSON from  │ │  Fetch XML from   │ │  Generic HTTP     │ │  Raw TCP socket   │        │
│   │  a URL. Parse     │ │  a URL. Parse     │ │  GET/POST to any  │ │  reads. Line-     │        │
│   │  with JSONPath.   │ │  with XPath.      │ │  REST endpoint.   │ │  delimited text.  │        │
│   │                   │ │                   │ │                   │ │                   │        │
│   │  address: url     │ │  address: url     │ │  address: url     │ │  address: host    │        │
│   └───────────────────┘ └───────────────────┘ └───────────────────┘ └───────────────────┘        │
│                                                                                                  │
│   ┌───────────────────┐ ┌───────────────────┐                                                    │
│   │  UDP Server       │ │  SNMP             │     Web/API connectors are PollingSourceConnector  │
│   │                   │ │                   │     except UDP Server (QueuingSourceConnector).    │
│   │  Listens on a UDP │ │  SNMP GET on OIDs │                                                    │
│   │  port. Receives   │ │  from network     │     JSON/XML Scrapers are useful for pulling       │
│   │  datagrams as     │ │  devices. v1/v2c  │     data from web APIs and converting it into      │
│   │  messages.        │ │  community string │     DIME messages for downstream sinks.            │
│   │                   │ │                   │                                                    │
│   │  port: 5005       │ │  address: host    │                                                    │
│   └───────────────────┘ └───────────────────┘                                                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SCRIPTING — THE UNIVERSAL SOURCE                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   connector: Script                                                                      │   │
│   │                                                                                          │   │
│   │   No external device. The Lua or Python script IS the data source.                       │   │
│   │   Timer fires → script runs → script returns data → published to ring buffer.            │   │
│   │                                                                                          │   │
│   │   Use cases:                                                                             │   │
│   │     • Generate synthetic test data                                                       │   │
│   │     • Compute derived values from cache() of other connectors                            │   │
│   │     • Build custom protocol adapters in script                                           │   │
│   │     • Aggregate or correlate data from multiple sources via cache API                    │   │
│   │                                                                                          │   │
│   │   lang_script: lua  (or python)                                                          │   │
│   │   scan_interval: 1000                                                                    │   │
│   │                                                                                          │   │
│   │   items:                                                                                 │   │
│   │     - name: computed_value                                                               │   │
│   │       script: |                                                                          │   │
│   │         local temp = cache("plc/Temperature", 0)                                         │   │
│   │         return temp * 1.8 + 32                                                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SOURCE TYPE HIERARCHY                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   Four base classes. Pick the one that matches how your device delivers data.                    │
│                                                                                                  │
│           ┌───────────────────────────────────────────────────────────────┐                      │
│           │              SourceConnector (abstract)                       │                      │
│           └─────────┬────────────────┬───────────────┬───────────────────┘                       │
│                     │                │               │                                           │
│           ┌─────────▼──────┐ ┌───────▼────────┐ ┌───▼───────────────┐                            │
│           │                │ │                │ │                   │                            │
│           │   Polling      │ │   Queuing      │ │  BatchPolling     │                            │
│           │                │ │                │ │                   │                            │
│           │  Timer fires   │ │  Msgs arrive   │ │  Timer fires      │                            │
│           │  → read all    │ │  → queue inbox │ │  → run query      │                            │
│           │  → publish     │ │  → drain timer │ │  → iterate rows   │                            │
│           │                │ │  → publish     │ │  → publish each   │                            │
│           │  OPC-UA        │ │                │ │                   │                            │
│           │  Modbus        │ │  MQTT          │ │  SQL Server       │                            │
│           │  S7            │ │  SparkplugB    │ │  PostgreSQL       │                            │
│           │  EtherNet/IP   │ │  ActiveMQ      │ │                   │                            │
│           │  Beckhoff ADS  │ │  Redis Pub/Sub │ │  ┌───────────────┐│                            │
│           │  FANUC         │ │  UDP Server    │ │  │  Database     ││                            │
│           │  HTTP / SNMP   │ │  WebSocket     │ │  │  (subclass)   ││                            │
│           │  Script        │ │                │ │  │  column→item  ││                            │
│           │                │ │                │ │  └───────────────┘│                            │
│           └────────────────┘ └────────────────┘ └───────────────────┘                            │
│                                                                                                  │
│   Polling is the most common: timer → read → publish. Queuing is for push protocols.             │
│   BatchPolling is for SQL queries that return result sets.                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   UNIVERSAL CONFIG PATTERN                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   Every source follows the same structure, regardless of protocol:                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sources:                                                                               │   │
│   │     - name: my_source            # unique name → becomes path prefix                     │   │
│   │       connector: OpcUA           # connector type (see catalog above)                    │   │
│   │       scan_interval: 1000        # ms between reads (Polling/BatchPolling)               │   │
│   │       rbe: true                  # Report By Exception at connector level                │   │
│   │       enabled: !!bool true       # disable without deleting                              │   │
│   │       address: 10.0.0.1          # protocol-specific endpoint                            │   │
│   │       port: 4840                 # protocol-specific port                                │   │
│   │       init_script: |             # Lua/Python run once at startup                        │   │
│   │         log("starting up")                                                               │   │
│   │       items:                     # what to read                                          │   │
│   │         - name: Temperature      # item name → path = my_source/Temperature              │   │
│   │           address: ns=2;s=Temp   # protocol-specific address                             │   │
│   │           rbe: true              # per-item RBE override                                 │   │
│   │           script: |              # per-item transform                                    │   │
│   │             return result * 1.8 + 32                                                     │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   The name becomes the first segment of the message path: "my_source/Temperature".               │
│   Sinks filter on this path. Dashboards subscribe to it. It's how all routing works.             │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
