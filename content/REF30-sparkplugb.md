
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF30 — SparkplugB                                                  CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Subscribes to and publishes data via a SparkplugB host.                                  │
  │                                                                                           │
  │  Connector Type: SparkplugB                            Source ✓    Sink ✓                  │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SparkplugB".                │
  │  address                string   Empty       Host hostname or IP address.                 │
  │  port                   int      1883        Host port.                                   │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │  clean_session          bool     TRUE        Clean session.                               │
  │  qos                    int      0           Quality of service (0, 1, 2).                │
  │  items.address          string   Empty       SpB topic.                                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: spb                                                                              │
  │    connector: SparkplugB                                                                  │
  │    address: localhost                                                                     │
  │    port: !!int 1883                                                                       │
  │    username: user                                                                         │
  │    password: password                                                                     │
  │    clean_session: !!bool true                                                             │
  │    qos: !!int 0                                                                           │
  │    items:                                                                                 │
  │      - name: F1D1                                                                         │
  │        address: spBv1.0/Chicago/DDATA/Factory1/DIME1                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SparkplugB".                │
  │  address                string   Empty       Host hostname or IP address.                 │
  │  port                   int      1883        Host port.                                   │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │  host_id                string   dime        Host ID.                                     │
  │  group_id               string   dime        Group ID.                                    │
  │  node_id                string   dime        Node ID.                                     │
  │  device_id              string   dime        Device ID.                                   │
  │  reconnect_interval     int      15000       Reconnect interval in milliseconds.          │
  │  birth_delay            int      10000       Delay birth certificate in milliseconds.     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: sparkplugBSink1                                                                  │
  │    connector: SparkplugB                                                                  │
  │    address: localhost                                                                     │
  │    port: !!int 1883                                                                       │
  │    username: admin                                                                        │
  │    password: admin                                                                        │
  │    host_id: dime                                                                          │
  │    group_id: dime                                                                         │
  │    node_id: dime                                                                          │
  │    device_id: dime                                                                        │
  │    reconnect_interval: !!int 15000                                                        │
  │    birth_delay: !!int 10000                                                               │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  SparkplugNet Github: https://github.com/SeppPenner/SparkplugNet                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
