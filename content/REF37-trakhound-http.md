
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF37 — TrakhoundHTTP                                               CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Writes data to a Trakhound server.                                                       │
  │                                                                                           │
  │  Connector Type: TrakhoundHTTP                          Source ✗    Sink ✓                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "TrakhoundHTTP".             │
  │  address                string   Empty       Trakhound hostname or IP address.            │
  │  port                   int      8472        Trakhound port.                              │
  │  use_ssl                bool     FALSE       Use HTTPS or HTTP.                           │
  │  router                 string   Empty       Router name.                                 │
  │  host_path              string   Empty       Host path.                                   │
  │  base_path              string   Empty       Base path.                                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: trakhoundHttpSink1                                                               │
  │    enabled: !!bool false                                                                  │
  │    scan_interval: !!int 1000                                                              │
  │    connector: TrakHoundHTTP                                                               │
  │    address: localhost                                                                     │
  │    port: 8472                                                                             │
  │    use_ssl: false                                                                         │
  │    router: default                                                                        │
  │    base_path: Ladder99:/DIME/HttpSink                                                     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
