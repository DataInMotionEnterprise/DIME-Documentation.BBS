```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX14 — ACTIVEMQ ENTERPRISE BROKER                                      DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Connect to Apache ActiveMQ Artemis for enterprise messaging. Subscribes to both a     │
  │  topic (pub/sub) and a queue (point-to-point) on the same broker. Uses the ActiveMQ    │
  │  connector with OpenWire protocol. Demonstrates the two fundamental messaging           │
  │  patterns — topics for broadcast and queues for load-balanced consumption.              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   ActiveMQ Source         │
      │                           │        ┌──────────────────┐
      │  Broker:                  │        │  Console Sink     │  stdout
      │  tcp://172.24.56.104:61616│        │                   │
      │  User: artemis            │   ┌───▶│  exclude_filter:  │
      │                           │   │    │  activemq/$SYSTEM │
      │  Subscriptions:           │   │    │  activemq         │
      │  · topic://FOO.BAR       ├───┘    └──────────────────┘
      │    (pub/sub broadcast)    │
      │  · queue://BAR.FOO       │
      │    (point-to-point)       │
      │                           │
      │  scan: 500ms              │
      │  itemized_read: false     │
      │  RBE: true                │
      └──────────────────────────┘
             SOURCE                       RING BUFFER            SINK
       (ActiveMQ OpenWire)              (4096 slots)        (1 destination)

  CONFIGURATION — 3 files                                                         [multi-file]
  ───────────────────────

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                     # Console output                     │
  │  sources:                                                                              │
  │    - *activemq                                    # ActiveMQ subscription              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── activemq.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  activemq: &activemq                                                                   │
  │    name: activemq                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                       # Drain queue every 500ms            │
  │    connector: ActiveMQ                            # Apache ActiveMQ connector          │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                    # Event-driven queuing mode          │
  │    address: activemq:tcp://172.24.56.104:61616    # OpenWire protocol URI              │
  │    username: artemis                              # Broker credentials                 │
  │    password: artemis                                                                   │
  │    init_script: |                                                                      │
  │      print("hello world from lua");               # Startup confirmation               │
  │    items:                                                                              │
  │      - name: FooBar                                                                    │
  │        enabled: !!bool true                                                            │
  │        address: topic://FOO.BAR                   # Topic subscription (pub/sub)       │
  │      - name: BarFoo                                                                    │
  │        enabled: !!bool true                                                            │
  │        address: queue://BAR.FOO                   # Queue subscription (point-to-point)│
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    exclude_filter:                                                                     │
  │      - activemq/$SYSTEM                           # Hide system heartbeat              │
  │      - activemq                                   # Hide raw messages (debug toggle)   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Topics vs Queues — ActiveMQ supports two messaging patterns. topic://FOO.BAR        │
  │    is pub/sub: all subscribers receive every message. queue://BAR.FOO is point-to-     │
  │    point: only one consumer gets each message (load balanced). Both can coexist in      │
  │    the same DIME source connector.                                                     │
  │                                                                                        │
  │  * OpenWire Protocol — The address uses activemq:tcp:// prefix for Apache's native     │
  │    OpenWire protocol on port 61616. This is the default binary protocol for Artemis     │
  │    and Classic ActiveMQ, offering better performance than AMQP or STOMP.               │
  │                                                                                        │
  │  * Event-Driven Mode — itemized_read: false switches to queuing mode. Messages from    │
  │    the broker are queued internally. scan_interval: 500 controls how often DIME         │
  │    drains the queue and publishes to the ring buffer.                                  │
  │                                                                                        │
  │  * Enterprise Messaging — ActiveMQ Artemis supports message persistence, clustering,   │
  │    transactions, and dead-letter queues. DIME acts as a lightweight consumer that       │
  │    bridges enterprise broker messages into the DIME ring buffer for further routing.    │
  │                                                                                        │
  │  * Console Filter as Debug Toggle — The exclude_filter includes both system messages   │
  │    and the activemq source itself. Removing the "activemq" entry from the filter        │
  │    turns on raw message display for debugging.                                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
