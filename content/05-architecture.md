```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        05 — Architecture Overview                     │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          How data moves through DIME,                   │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          from device to destination.                    │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE BIG PICTURE                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   DIME is three layers: read, route, write. Everything else is detail.                           │
│                                                                                                  │
│        READ                         ROUTE                          WRITE                         │
│   ┌─────────────┐          ┌───────────────────────┐          ┌─────────────┐                    │
│   │             │          │                       │          │             │                    │
│   │   Sources   │─────────▶│  Disruptor Ring Buffer│─────────▶│    Sinks    │                    │
│   │             │          │                       │          │             │                    │
│   │  47+ types  │          │  Lock-free. < 1ms.    │          │  20+ types  │                    │
│   │  Any device │          │  1M+ msg/sec.         │          │  Any dest.  │                    │
│   │ Any protocol│          │  Single hub for all.  │          │  Any format │                    │
│   │             │          │                       │          │             │                    │
│   └─────────────┘          └───────────────────────┘          └─────────────┘                    │
│         │                             │                              │                           │
│         │                             │                              │                           │
│    Each source                  SinkDispatcher                  Each sink                        │
│    runs on its own              pushes every message             runs on its own                 │
│    timer. Independent.          to every sink.                  timer. Independent.              │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DETAILED DATA FLOW                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   Follow a single data point from a physical device to its final destination.                    │
│                                                                                                  │
│    ┌─────────┐      ┌──────────────┐      ┌────────────┐      ┌─────────────┐                    │
│    │ Physical│      │   Source     │      │    Lua     │      │             │                    │
│    │ Device  │─────▶│  Connector   │─────▶│  Transform │─────▶│  Ring       │                    │
│    │         │      │              │      │  (optional)│      │  Buffer     │                    │
│    │ PLC     │ OPC  │ Reads data   │ raw  │            │ msg  │             │                    │
│    │ CNC     │ UA   │ on timer     │ data │ Reshape,   │      │  4096 slots │                    │
│    │ Robot   │ S7   │ or on event  │      │ filter,    │      │  (default)  │                    │
│    │ Sensor  │ MQTT │              │      │ enrich     │      │             │                    │
│    └─────────┘      └──────────────┘      └────────────┘      └──────┬──────┘                    │
│                                                                      │                           │
│                                                            SinkDispatcher                        │
│                                                          fans out to ALL sinks                   │
│                                                                      │                           │
│                      ┌───────────────────────────┬───────────────────┼───────────────────┐       │
│                      │                           │                   │                   │       │
│                      ▼                           ▼                   ▼                   ▼       │
│               ┌─────────────┐             ┌─────────────┐     ┌─────────────┐     ┌──────────┐   │
│               │ Sink A      │             │ Sink B      │     │ Sink C      │     │ Sink D   │   │
│               │             │             │             │     │             │     │          │   │
│               │ include:    │             │ exclude:    │     │ template:   │     │  (all)   │   │
│               │  plc/.*     │             │  .*\$SYS.*  │     │  custom fmt │     │          │   │
│               │             │             │             │     │             │     │          │   │
│               │ InfluxDB    │             │ Splunk      │     │ MQTT Pub    │     │ Console  │   │
│               └─────────────┘             └─────────────┘     └─────────────┘     └──────────┘   │
│                                                                                                  │
│               Only PLC data.              Everything                Reformatted          Raw     │
│                                           minus system msgs.       for republish.       debug.   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE MESSAGE                                                                                    │
│   ───────────                                                                                    │
│                                                                                                  │
│   Every piece of data flowing through DIME is a MessageBoxMessage with four fields.              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────┐                           │
│   │                     MessageBoxMessage                            │                           │
│   │                                                                  │                           │
│   │   Path ─────────── "opcua_source/Temperature"                    │                           │
│   │                     ^               ^                            │                           │
│   │                     │               │                            │                           │
│   │                  source name     item name                       │                           │
│   │                                                                  │                           │
│   │   Data ─────────── 72.5                                          │                           │
│   │                    The actual value. Any type.                   │                           │
│   │                                                                  │                           │
│   │   Timestamp ────── 1708300800000                                 │                           │
│   │                    Epoch milliseconds. When it was read.         │                           │
│   │                                                                  │                           │
│   │   ConnectorItemRef  Metadata: RBE flag, sink mappings,           │                           │
│   │                     MTConnect path, original item config.        │                           │
│   │                                                                  │                           │
│   └──────────────────────────────────────────────────────────────────┘                           │
│                                                                                                  │
│   The Path is how sinks filter.  "opcua_source/Temp.*" matches this message.                     │
│   The Path is how dashboards subscribe.  The Path is how data is routed.                         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR LIFECYCLE                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Every connector — source or sink — follows the same six-stage lifecycle.                       │
│   ConnectorRunner manages each stage and tracks faults.                                          │
│                                                                                                  │
│     ┌────────────┐     ┌────────────┐     ┌────────────┐                                         │
│     │            │     │            │     │            │                                         │
│     │ INITIALIZE │────▶│   CREATE   │────▶│  CONNECT   │                                         │
│     │            │     │            │     │            │                                         │
│     │ Load config│     │ Build      │     │ Open       │                                         │
│     │ Run init   │     │ internal   │     │ connection │                                         │
│     │ script     │     │ resources  │     │ to device  │                                         │
│     │            │     │            │     │            │                                         │
│     └────────────┘     └────────────┘     └─────┬──────┘                                         │
│                                                 │                                                │
│                                                 v                                                │
│                                          ┌─────────────┐                                         │
│                                          │             │                                         │
│                                          │  READ/WRITE │<─────────────────┐                      │
│                                          │             │                  │                      │
│                                          │  Source:    │     Timer fires  │                      │
│                                          │   poll data │     every        │                      │
│                                          │   transform │     scan_interval│                      │
│                                          │   publish   │     (e.g. 1000ms)│                      │
│                                          │             │                  │                      │
│                                          │  Sink:      │                  │                      │
│                                          │   receive   │──────────────────┘                      │
│                                          │   filter    │                                         │
│                                          │   write     │                                         │
│                                          │             │                                         │
│                                          └─────┬───────┘                                         │
│                                                │  shutdown                                       │
│                                                v                                                 │
│     ┌────────────────┐     ┌────────────┐                                                        │
│     │                │     │            │                                                        │
│     │  DEINITIALIZE  │<────│ DISCONNECT │                                                        │
│     │                │     │            │                                                        │
│     │  Run deinit    │     │ Close      │                                                        │
│     │  script.       │     │ connection │                                                        │
│     │  Release all.  │     │ gracefully │                                                        │
│     │                │     │            │                                                        │
│     └────────────────┘     └────────────┘                                                        │
│                                                                                                  │
│   If a stage fails, ConnectorRunner tracks the fault and retries.                                │
│   Faults in one connector never affect others — full isolation.                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SOURCE CONNECTOR TYPES                                                                         │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   Four base classes. Pick the one that matches how your device delivers data.                    │
│                                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │   PollingSourceConnector                 The most common type.                          │    │
│   │   ──────────────────────                                                                │    │
│   │                                                                                         │    │
│   │   Timer fires every scan_interval ──▶ Read all items ──▶ Publish to ring buffer         │    │
│   │                                                                                         │    │
│   │   Used by: OPC-UA, Modbus, S7, EtherNet/IP, Beckhoff, FANUC, Script, HTTP, SNMP         │    │
│   │                                                                                         │    │
│   ├─────────────────────────────────────────────────────────────────────────────────────────┤    │
│   │                                                                                         │    │
│   │   QueuingSourceConnector                 For push-based protocols.                      │    │
│   │   ──────────────────────                                                                │    │
│   │                                                                                         │    │
│   │   Messages arrive asynchronously ──▶ Queue in inbox ──▶ Drain on timer ──▶ Publish      │    │
│   │                                                                                         │    │
│   │   Used by: MQTT, SparkplugB, ActiveMQ, WebSocket, UDP Server                            │    │
│   │                                                                                         │    │
│   ├─────────────────────────────────────────────────────────────────────────────────────────┤    │
│   │                                                                                         │    │
│   │   BatchPollingSourceConnector            For bulk reads.                                │    │
│   │   ───────────────────────────                                                           │    │
│   │                                                                                         │    │
│   │   Timer fires ──▶ Execute query ──▶ Iterate result set ──▶ Publish each row             │    │
│   │                                                                                         │    │
│   │   Used by: SQL Server source, PostgreSQL source                                         │    │
│   │                                                                                         │    │
│   ├─────────────────────────────────────────────────────────────────────────────────────────┤    │
│   │                                                                                         │    │
│   │   DatabaseSourceConnector                Structured result mapping.                     │    │
│   │   ───────────────────────                                                               │    │
│   │                                                                                         │    │
│   │   Timer fires ──▶ SQL query ──▶ Map columns to items ──▶ Publish with names             │    │
│   │                                                                                         │    │
│   │   Used by: Database connectors with column-level item mapping                           │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE ADMIN SERVER                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   Every DIME instance exposes two monitoring endpoints. Always on. No extra config.              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   REST API                                  WebSocket                        │               │
│   │   http://localhost:9999                      ws://localhost:9998             │               │
│   │                                                                              │               │
│   │   GET  /status ─── All connector states      Real-time event stream:         │               │
│   │   GET  /config ─── Running configuration                                     │               │
│   │   POST /sinks ──── Add sink at runtime         Connector state changes       │               │
│   │   GET  /cache ──── Cached values               Performance telemetry         │               │
│   │                                                 Loop timing (read, script,   │               │
│   │   Swagger UI included for exploration.          total per connector)         │               │
│   │                                                 Fault notifications          │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   The REST API is how you add sinks at runtime — zero downtime reconfiguration.                  │
│   The WebSocket is how DIME-Connector.UX (the web dashboard) gets live data.                     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PUTTING IT ALL TOGETHER                                                                        │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ┌─ DimeService ────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │  Loads YAML          Creates              Starts             Manages                     │   │
│   │  config files        connectors           ring buffer        admin server                │   │
│   │       │              via factories              │                  │                     │   │
│   │       v                   │                     v                  v                     │   │
│   │  ┌─────────┐              │             ┌──────────────┐    ┌────────────┐               │   │
│   │  │ YAML    │              │             │  Disruptor   │    │ Admin      │               │   │
│   │  │ Parser  │              │             │  Ring Buffer │    │ Server     │               │   │
│   │  └────┬────┘              │             └──────┬───────┘    │            │               │   │
│   │       │                   │                    │            │ REST :9999 │               │   │
│   │       v                   v                    v            │ WS   :9998 │               │   │
│   │  ┌─────────────────────────────────────────────────────┐    └────────────┘               │   │
│   │  │                                                     │                                 │   │
│   │  │  ConnectorRunner    ConnectorRunner    ConnectorRunner                                │   │
│   │  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    ...for each                   │   │
│   │  │  │ OPC-UA      │   │ MQTT        │   │ InfluxDB    │       connector                  │   │
│   │  │  │ Source      │   │ Source      │   │ Sink        │       in config                  │   │
│   │  │  │             │   │             │   │             │                                  │   │
│   │  │  │ scan: 1000ms│   │ scan: 200ms │   │ scan: 5000ms│                                  │   │
│   │  │  │ items: 10   │   │ items: 3    │   │ filter: yes │                                  │   │
│   │  │  └──────┬──────┘   └──────┬──────┘   └───────┬─────┘                                  │   │
│   │  │         │                 │                  │                                        │   │
│   │  │         │    publishes    │                  │    receives from                       │   │
│   │  │         +────────────────▶│<─────────────────+    SinkDispatcher                      │   │
│   │  │                   Ring Buffer                                                         │   │
│   │  │                                                                                       │   │
│   │  └──────────────────────────────────────────────────────────────────────────────────────┘│   │
│   │                                                                                          │   │
│   │  Each ConnectorRunner is independent. Different timers. Different protocols.             │   │
│   │  A fault in one never affects the others.                                                │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PERFORMANCE BY DESIGN                                                                          │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │   DISRUPTOR       │  │   ZERO-COPY       │  │   RBE             │  │   ISOLATION       │     │
│   │   RING BUFFER     │  │   FAN-OUT         │  │                   │  │                   │     │
│   │                   │  │                   │  │   Report By       │  │   Each connector  │     │
│   │   Lock-free.      │  │   SinkDispatcher  │  │   Exception.      │  │   on its own      │     │
│   │   No mutexes.     │  │   pushes the same │  │   Only publish    │  │   thread & timer. │     │
│   │   No contention.  │  │   message ref to  │  │   when the value  │  │   Fault in one    │     │
│   │   Predictable     │  │   every sink. No  │  │   actually        │  │   never blocks    │     │
│   │   sub-ms latency. │  │   copies made.    │  │   changes.        │  │   another.        │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘     │
│                                                                                                  │
│   Performance instrumentation is built in. Every source measures:                                │
│                                                                                                  │
│     Device read time  ──  How long the hardware took to respond.                                 │
│     Script exec time  ──  How long Lua/Python transforms took.                                   │
│     Total loop time   ──  End-to-end for one scan cycle.                                         │
│                                                                                                  │
│   Available in real time via the WebSocket admin endpoint.                                       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
