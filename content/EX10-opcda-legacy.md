```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX10 — OPC-DA LEGACY                                                   DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Classic OPC-DA (COM/DCOM-based) connectivity for legacy systems. Reads tags from a    │
  │  Kepware KEPServerEX OPC-DA server using the traditional Windows COM interface.        │
  │  This is the simplest OPC-DA config — one source, one sink, one tag. Essential for     │
  │  brownfield factories still running Kepware, Wonderware, or RSLinx OPC-DA servers.     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────────┐
      │   OPC-DA Source           │
      │                           │        ┌───────────────────┐
      │  Server ProgID:           │        │  Console Sink     │  stdout
      │  Kepware.KEPServerEX.V6   │        │                   │
      │                           │   ┌───▶│  use_sink_        │
      │  Tags:                    │   │    │  transform: true  │
      │  · _System._DateTime      ├───┘    └───────────────────┘
      │                           │
      │  COM/DCOM on localhost    │
      │                           │
      │  scan: 1000ms             │
      │  RBE: true                │
      └───────────────────────────┘
             SOURCE                       RING BUFFER            SINK
       (OPC-DA COM interface)           (4096 slots)        (1 destination)

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
  │    - *consoleSink1                                # Console output                     │
  │  sources:                                                                              │
  │    - *opcDaSource1                                # OPC-DA connection                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── opcDaSource1.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  opcDaSource1: &opcDaSource1                                                           │
  │    name: opcDaSource1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                      # Poll every 1 second                │
  │    connector: OpcDA                               # Classic OPC-DA connector           │
  │    rbe: !!bool true                               # Report by exception                │
  │    address: Kepware.KEPServerEX.V6                # COM ProgID of OPC-DA server        │
  │    init_script: ~                                 # No initialization needed           │
  │    items:                                                                              │
  │      - name: DateTime                                                                  │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                           # Per-item RBE override              │
  │        address: _System._DateTime                 # OPC-DA tag path                    │
  │        script: ~                                  # No transformation                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink1.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink1: &consoleSink1                                                           │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true                # Apply source transform             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * OPC-DA (Data Access) — The original OPC standard from the 1990s, built on Windows   │
  │    COM/DCOM. Still widely deployed in legacy Kepware, Wonderware InTouch, RSLinx, and  │
  │    FactoryTalk installations. Requires Windows and local or DCOM network access.       │
  │                                                                                        │
  │  * COM ProgID Addressing — The address field takes the server's COM ProgID, not a      │
  │    URL. Common examples: Kepware.KEPServerEX.V6, RSLinx.OPCServer,                     │
  │    InTouch.OPC. Use OPC-DA browser tools to discover available servers.                │
  │                                                                                        │
  │  * Tag Path Notation — Item addresses use the OPC-DA server's tag hierarchy with       │
  │    dot separators. The _System group contains built-in Kepware tags like _DateTime.    │
  │    User-defined tags follow the channel.device.group.tag pattern.                      │
  │                                                                                        │
  │  * Per-Item RBE — Both the source-level rbe and item-level rbe are set to true.        │
  │    Item-level RBE overrides the source default. For high-frequency tags, set           │
  │    item rbe: false to stream every read regardless of change.                          │
  │                                                                                        │
  │  * OPC-DA vs OPC-UA — OPC-DA is Windows-only (COM). OPC-UA (see EX08) is platform-     │
  │    independent. Use OPC-DA for legacy brownfield; OPC-UA for new deployments.          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
