
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF01 — ActiveMQ                                                    CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Subscribes to ActiveMQ topics and queues.                                                │
  │                                                                                           │
  │  Connector Type: ActiveMQ                            Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "ActiveMQ".                  │
  │  address                string   Empty       Broker URI.                                  │
  │  username               string   Empty       Broker username.                             │
  │  password               string   Empty       Broker password.                             │
  │  itemized_read          bool     FALSE       Match streaming data against items list.     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: amq                                                                              │
  │    connector: ActiveMQ                                                                    │
  │    address: activemq:tcp://172.24.56.104:61616                                            │
  │    username: artemis                                                                      │
  │    password: artemis                                                                      │
  │    items:                                                                                 │
  │      - name: FooBar                                                                       │
  │        address: topic://FOO.BAR                                                           │
  │      - name: BarFoo                                                                       │
  │        address: queue://BAR.FOO                                                           │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  ActiveMQ NMS OpenWire Github: https://github.com/apache/activemq-nms-openwire            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
