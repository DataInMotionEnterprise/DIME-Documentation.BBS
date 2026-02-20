
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF31 — Splunk EH SDK                                               CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Writes data to Splunk via Splunk EdgeHub SDK. Includes V1 and V2 variants.               │
  │                                                                                           │
  │  Connector Types: SplunkEhSdk1, SplunkEhSdk2          Source ✗    Sink ✓                  │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES (V1)
  ────────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SplunkEhSdk1".              │
  │  address                string   http://ho…  Internal address.                            │
  │  port                   int      50051       Internal port.                               │
  │  numbers_to_metrics     bool     FALSE       Write numbers as metrics.                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE (V1)
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: splunkEhSdk                                                                      │
  │    connector: SplunkEhSDK1                                                                │
  │    address: http://host.docker.internal                                                   │
  │    port: !!int 50051                                                                      │
  │    numbers_to_metrics: !!bool true                                                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES (V2)
  ────────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SplunkEhSdk2".              │
  │  address                string   http://ho…  Internal address.                            │
  │  port                   int      50051       Internal port.                               │
  │  topic                  string   Empty       EdgeHub SDK ingestion topic.                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE (V2)
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: splunkEhSdk                                                                      │
  │    connector: SplunkEhSDK2                                                                │
  │    address: http://host.docker.internal                                                   │
  │    port: !!int 50051                                                                      │
  │    topic: dime/dev                                                                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
