
═══════════════════════════════════════════════════════════════════════════════════════════════
  REFOUT — Sink                                                        CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Common properties shared by all sink connectors.                                         │
  │                                                                                           │
  │  Each connector reference page lists only the properties specific to that connector.      │
  │  The properties below apply to every sink connector and do not need to be repeated.       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  name                   string   "Unnamed"   Unique connector name.                       │
  │  enabled                boolean  TRUE        Is connector enabled.                        │
  │  connector              string   "Undefined" Connector type.                              │
  │  scan_interval          int      1000        Scanning frequency in milliseconds.          │
  │  exclude_filter         list     Empty       Message path exclusion filter.               │
  │  include_filter         list     Empty       Message path inclusion filter.               │
  │  use_sink_transform     boolean  FALSE       Execute transform defined on the source      │
  │                                              connector.                                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: console1                                                                         │
  │    enabled: !!bool true                                                                   │
  │    connector: Console                                                                     │
  │    scan_interval: !!int 1000                                                              │
  │    exclude_filter:                                                                        │
  │      - script1/$SYSTEM                                                                    │
  │    #include_filter:                                                                       │
  │    #  - script1/randomNumber1                                                             │
  │    use_sink_transform: !!bool true                                                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  A Gentle Introduction to the YAML Format:                                                │
  │    https://dev.to/kalkwst/a-gentle-introduction-to-the-yaml-format-bi6                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
