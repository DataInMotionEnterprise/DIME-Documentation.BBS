```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX04 — SIEMENS S7 PLC                                                  DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads inputs and outputs from a Siemens S7-1200 PLC using the native S7 protocol.    │
  │  Demonstrates the SiemensS7 source connector with bool data types, I/O addressing,    │
  │  rack/slot configuration, and system message filtering on the console sink.            │
  │  Multi-file YAML config with three files: source, sink, and main.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Siemens S7 Source      │          ┌──────────────────┐
      │   (s7Source1)            │     ┌───▶│  Console Sink    │  stdout
      │                          │     │    │  (console)       │
      │   PLC:  S7-1200          │     │    └──────────────────┘
      │   addr: 192.168.1.90     ├─────┘
      │   port: 102 (ISO-TSAP)   │
      │   rack: 0  slot: 0       │
      │                          │
      │   Items:                 │
      │   · input0   I0.0 bool   │
      │   · output0  Q0.0 bool   │
      │                          │
      │   scan: 500ms            │
      └──────────────────────────┘
             SOURCE                        RING BUFFER               SINK
       (S7 native protocol)              (4096 slots)          (console output)

  CONFIGURATION — 3 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── s7Source1.yaml ────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  s7Source1: &s7Source1                                                                  │
  │    name: s7Source1                                                                     │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                      # Poll every 500ms                    │
  │    connector: SiemensS7                          # Native S7 protocol connector        │
  │    rbe: !!bool true                              # Only publish on change              │
  │    type: S71200                                  # PLC family: S71200 or S71500        │
  │    address: 192.168.1.90                         # PLC IP address                      │
  │    port: !!int 102                               # ISO-TSAP port (always 102)          │
  │    rack: !!int 0                                 # Hardware rack number                │
  │    slot: !!int 0                                 # CPU slot number                     │
  │    init_script: ~                                # No init needed                      │
  │    enter_script: ~                               # No pre-scan logic                   │
  │    exit_script: ~                                # No post-scan logic                  │
  │    deinit_script: ~                              # No cleanup needed                   │
  │    items:                                                                              │
  │      - name: input0                                                                    │
  │        enabled: !!bool true                                                            │
  │        type: bool                                # PLC data type                       │
  │        address: I0.0                             # Input byte 0, bit 0                 │
  │      - name: output0                                                                   │
  │        enabled: !!bool true                                                            │
  │        type: bool                                # PLC data type                       │
  │        address: Q0.0                             # Output byte 0, bit 0                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Write to console every 1s           │
  │    connector: Console                            # stdout output                       │
  │    exclude_filter:                                                                     │
  │      - s7Source1/$SYSTEM                         # Suppress system heartbeat msgs      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin REST API                     │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *console                                    # Anchor from console.yaml            │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *s7Source1                                   # Anchor from s7Source1.yaml          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • S7 Protocol — The SiemensS7 connector uses the native S7comm protocol (ISO-TSAP    │
  │    on port 102). No OPC server required. Talks directly to the PLC CPU.                │
  │    Supports S71200 and S71500 via the type field.                                      │
  │                                                                                        │
  │  • I/O Addressing — S7 uses area-based addressing. I0.0 = Input byte 0 bit 0.         │
  │    Q0.0 = Output byte 0 bit 0. DB addresses use DB1.DBX0.0 format for data            │
  │    blocks. The type field (bool, int, word, real) tells DIME how to decode.            │
  │                                                                                        │
  │  • Rack and Slot — Physical hardware location of the CPU. For S7-1200 and S7-1500,    │
  │    rack=0 slot=0 is almost always correct. Older S7-300/400 may use slot=2.            │
  │                                                                                        │
  │  • System Message Filtering — Every source publishes $SYSTEM messages with             │
  │    connection health (IsConnected, IsFaulted, etc.). The exclude_filter on the         │
  │    console sink suppresses these so only data items are printed.                       │
  │                                                                                        │
  │  • Script Lifecycle — init/enter/exit/deinit scripts are all set to ~ (null) here,    │
  │    showing the full lifecycle hook surface. Use them when you need initialization,     │
  │    pre-scan logic, post-scan cleanup, or shutdown behavior.                            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
