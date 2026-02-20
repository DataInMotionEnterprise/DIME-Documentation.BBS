
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF34 — Splunk HEC                                                  CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Writes data to Splunk via Splunk HEC.                                                    │
  │                                                                                           │
  │  Connector Type: SplunkHEC                             Source ✗    Sink ✓                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SplunkHEC".                 │
  │  address                string   Empty       Splunk hostname or IP address.               │
  │  port                   int      8088        Splunk HEC port.                             │
  │  use_ssl                bool     FALSE       Use HTTP or HTTPS.                           │
  │  token                  string   Empty       Splunk HEC token.                            │
  │  event_or_metric        string   event       Send as 'event' or 'metric'.                 │
  │  source                 string   Empty       Source.                                      │
  │  source_type            string   _json       Source type.                                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: splunkHecSink1                                                                   │
  │    connector: SplunkHEC                                                                   │
  │    address: localhost                                                                     │
  │    port: 8088                                                                             │
  │    use_ssl: false                                                                         │
  │    token: abc123                                                                          │
  │    event_or_metric: event                                                                 │
  │    source: source1                                                                        │
  │    source_type: _json                                                                     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
