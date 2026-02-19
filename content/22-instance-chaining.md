```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        22 — Instance Chaining                         │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Scale from one machine                         │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          to an entire enterprise.                       │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SINGLE INSTANCE — THE BUILDING BLOCK                                                           │
│   ────────────────────────────────────                                                           │
│                                                                                                  │
│   One DIME instance is a complete data pipeline: sources merge into one ring buffer,             │
│   and sinks fork out to any number of destinations.                                              │
│                                                                                                  │
│   ┌──────────────┐                                 ┌──────────────┐                              │
│   │  Source A    │ ──┐                          ┌──│  Sink X      │                              │
│   └──────────────┘   │   ┌────────────────┐     │  └──────────────┘                              │
│                      ├──▶│                │─────┤                                                │
│   ┌──────────────┐   │   │  Ring Buffer   │     │  ┌──────────────┐                              │
│   │  Source B    │───┤   │  (merge)       │─────├──│  Sink Y      │                              │
│   └──────────────┘   │   │                │     │  └──────────────┘                              │
│                      │   └────────────────┘     │                                                │
│   ┌──────────────┐   │         (fork)           │  ┌──────────────┐                              │
│   │  Source C    │───┘                          └──│  Sink Z      │                              │
│   └──────────────┘                                 └──────────────┘                              │
│                                                                                                  │
│   Many-to-one on the left (merge).  One-to-many on the right (fork).                             │
│   Everything flows through one lock-free ring buffer at sub-ms latency.                          │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   INSTANCE CHAINING — THE SCALING PATTERN                                                        │
│   ───────────────────────────────────────                                                        │
│                                                                                                  │
│   Connect two DIME instances by making one's sink speak the same protocol as the                 │
│   other's source.  The network becomes the wire between ring buffers.                            │
│                                                                                                  │
│   ┌──────────────────────────────┐         ┌──────────────────────────────┐                      │
│   │          DIME-A              │         │          DIME-B              │                      │
│   │                              │         │                              │                      │
│   │  [Sources] ──▶ Ring ──▶ SINK │───────▶ │ SOURCE ──▶ Ring ──▶ [Sinks]  │                      │
│   │                      (MQTT)  │  MQTT   │ (MQTT)                       │                      │
│   │                              │ publish │                              │                      │
│   └──────────────────────────────┘         └──────────────────────────────┘                      │
│                                                                                                  │
│   DIME-A publishes via an MQTT sink.  DIME-B subscribes via an MQTT source.                      │
│   Any shared protocol works.  Each instance has its own config, its own process.                 │
│                                                                                                  │
│   CHAINING PROTOCOLS                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌────────────────┬──────────────────────────────────────────────────────────────────────┐      │
│   │ Protocol       │ Use Case                                                             │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ MQTT           │ Lightweight, reliable, broker-based. Most common for chaining.       │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ SparkplugB     │ Industrial MQTT with birth/death and typed metrics.                  │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ MTConnect      │ Manufacturing standard. Agent on DIME-A, client on DIME-B.           │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ SHDR           │ Pipe delimited, low overhead. Great for edge forwarding.             │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ HTTP           │ REST push/pull. Works through firewalls and proxies.                 │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ WebSocket      │ Persistent, full-duplex. Low-latency streaming.                      │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ Redis          │ Pub/Sub channel. In-memory speed. Same-network linking.              │      │
│   ├────────────────┼──────────────────────────────────────────────────────────────────────┤      │
│   │ ActiveMQ       │ JMS queuing. Durable subscriptions across restarts.                  │      │
│   └────────────────┴──────────────────────────────────────────────────────────────────────┘      │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THREE-TIER TOPOLOGY                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Chain instances into layers: Edge → Aggregator → Analytics.                                    │
│                                                                                                  │
│    EDGE TIER                    AGGREGATOR TIER               ANALYTICS TIER                     │
│    (factory floor)              (plant server)                (cloud / data center)              │
│                                                                                                  │
│    ┌──────────────┐                                                                              │
│    │  DIME Edge 1 │──┐                                                                           │
│    │  PLCs, CNCs  │  │         ┌──────────────────┐                                              │
│    └──────────────┘  │         │                  │          ┌──────────────────┐                │
│                      ├─ MQTT ─▶│  DIME Aggregator │ ─ MQTT ─▶│  Splunk          │                │
│    ┌──────────────┐  │         │                  │          └──────────────────┘                │
│    │  DIME Edge 2 │──┤         │  Merges all edge │                                              │
│    │  Sensors     │  │         │  streams. Serves │          ┌──────────────────┐                │
│    └──────────────┘  │         │  local dashboard.│── MQTT ─▶│  InfluxDB        │                │
│                      │         │                  │          └ ─────────────────┘                │
│    ┌──────────────┐  │         │  Forwards to     │                                              │
│    │  DIME Edge 3 │──┘         │  cloud via MQTT. │          ┌──────────────────┐                │
│    │  Robots      │            │                  │── HTTP ─▶│  MongoDB         │                │
│    └──────────────┘            └──────────────────┘          └──────────────────┘                │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   EDGE INSTANCE                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   Each edge DIME collects from local devices, normalizes, and forwards upstream.                 │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   # Edge: PLC → MQTT                                                                     │   │
│   │   sources:                                                                               │   │
│   │     - name: plc1                                                                         │   │
│   │       connector: S7                                                                      │   │
│   │       address: 192.168.1.10                                                              │   │
│   │       scan_interval: !!int 1000                                                          │   │
│   │       items:                                                                             │   │
│   │         - name: Temperature                                                              │   │
│   │           address: DB1.DBD0                                                              │   │
│   │         - name: Pressure                                                                 │   │
│   │           address: DB1.DBD4                                                              │   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: upstream                                                                     │   │
│   │       connector: MQTT                                                                    │   │
│   │       address: aggregator.local                                                          │   │
│   │       port: !!int 1883                                                                   │   │
│   │       base_topic: edge/line1                                                             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   AGGREGATOR INSTANCE                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Merges all edge streams, serves a local dashboard, and forwards to cloud.                      │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   # Aggregator: MQTT → Dashboard + Cloud                                                 │   │
│   │   sources:                                                                               │   │
│   │     - name: edge_data                                                                    │   │
│   │       connector: MQTT                                                                    │   │
│   │       address: localhost                                                                 │   │
│   │       port: !!int 1883                                                                   │   │
│   │       base_topic: edge/#                                                                 │   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: dashboard                                                                    │   │
│   │       connector: WebSocketServer                                                         │   │
│   │       port: !!int 8092                                                                   │   │
│   │                                                                                          │   │
│   │     - name: cloud                                                                        │   │
│   │       connector: MQTT                                                                    │   │
│   │       address: cloud-broker.com                                                          │   │
│   │       port: !!int 8883                                                                   │   │
│   │       tls: !!bool true                                                                   │   │
│   │       base_topic: plant/floor1                                                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HOT RECONFIGURATION AT RUNTIME                                                                 │
│   ──────────────────────────────                                                                 │
│                                                                                                  │
│   Add a new sink to a running instance without restarting. Zero downtime.                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   $ curl -X POST http://localhost:9999/connector/add/sink \                              │   │
│   │       -H "Content-Type: application/json" \                                              │   │
│   │       -d '{                                                                              │   │
│   │             "name": "debug_console",                                                     │   │
│   │             "connector": "Console"                                                       │   │
│   │           }'                                                                             │   │
│   │                                                                                          │   │
│   │   ┌───────────────────────────────────────────────────────────────────────────┐          │   │
│   │   │  Before:   [plc1] ──▶ Ring ──▶ [upstream_mqtt]                            │          │   │
│   │   │                                                                           │          │   │
│   │   │  After:    [plc1] ──▶ Ring ──▶ [upstream_mqtt]                            │          │   │
│   │   │                             ──▶ [debug_console]  ◀── added live           │          │   │
│   │   └───────────────────────────────────────────────────────────────────────────┘          │   │
│   │                                                                                          │   │
│   │   Existing connectors unaffected. New sink starts receiving immediately.                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE MATH — SCALING WITH INSTANCE CHAINING                                                      │
│   ─────────────────────────────────────────                                                      │
│                                                                                                  │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │  N EDGE           │  │  1 YAML           │  │  1 AGGREGATOR     │  │  M ANALYTICS      │     │
│   │  INSTANCES        │  │  PER EDGE         │  │  INSTANCE         │  │  DESTINATIONS     │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │  One per machine  │  │  Same template.   │  │  Merges N edge    │  │  Splunk, Influx,  │     │
│   │  or cell. Each    │  │  Change address   │  │  streams into     │  │  MongoDB, custom  │     │
│   │  runs its own     │  │  and name per     │  │  one view.        │  │  dashboards —     │     │
│   │  DIME process.    │  │  deployment.      │  │  Serves local     │  │  each a sink on   │     │
│   │                   │  │                   │  │  dashboards.      │  │  the aggregator.  │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘     │
│                                                                                                  │
│   N edges × M devices.  One YAML per edge.  One aggregator to rule them all.                     │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
