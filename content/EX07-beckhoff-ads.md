```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX07 — BECKHOFF ADS                                                    DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads PLC variables from a Beckhoff TwinCAT runtime via ADS (Automation Device        │
  │  Specification) protocol. Demonstrates the BeckhoffADS source connector with AMS Net   │
  │  ID addressing, typed PLC variables, and multiple source instances reading the same     │
  │  controller. Multi-file YAML config with four files: two sources, sink, and main.      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   ADS Source 1            │
      │   (adsSource1)            │          ┌──────────────────┐
      │                           │     ┌───▶│  Console Sink    │  stdout
      │   target: 192.168.111.191 │     │    │  (console)       │
      │   AMS:  192.168.111.191   │     │    └──────────────────┘
      │         .1.1              ├─────┤
      │   port: 851 (TC3 runtime) │     │
      │                           │     │
      │   Items:                  │     │
      │   · bool1  MAIN.testBool1 │     │
      │   · int1   MAIN.testDint1 │     │
      └───────────────────────────┘     │
                                        │
      ┌──────────────────────────┐      │
      │   ADS Source 2            │      │
      │   (adsSource2)            │      │
      │                           │      │
      │   target: 192.168.111.191 ├──────┘
      │   AMS:  192.168.111.191   │
      │         .1.1              │
      │   port: 851               │
      │                           │
      │   Items:                  │
      │   · bool1  MAIN.testBool1 │
      │   · int1   MAIN.testDint1 │
      └───────────────────────────┘
          2 SOURCES                       RING BUFFER               SINK
      (ADS connections)                 (4096 slots)          (console output)

  CONFIGURATION — 4 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── adsSource1.yaml ───────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  adsSource1: &adsSource1                                                               │
  │    name: adsSource1                                                                    │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                      # Poll every 500ms                    │
  │    connector: BeckhoffADS                        # TwinCAT ADS protocol connector      │
  │    rbe: !!bool true                              # Only publish on change              │
  │    local_netid: 1.1.1.1.1.1                      # Local AMS Net ID (this machine)    │
  │    target_ip: 192.168.111.191                    # TwinCAT runtime IP address          │
  │    address: 192.168.111.191.1.1                  # Target AMS Net ID                   │
  │    port: !!int 851                               # ADS port (851 = TC3 Runtime 1)      │
  │    init_script: ~                                                                      │
  │    enter_script: ~                                                                     │
  │    exit_script: ~                                                                      │
  │    deinit_script: ~                                                                    │
  │    items:                                                                              │
  │      - name: bool1                                                                     │
  │        enabled: !!bool true                                                            │
  │        type: bool                                # PLC BOOL type                       │
  │        address: MAIN.testBool1                   # TwinCAT symbol path                 │
  │      - name: int1                                                                      │
  │        enabled: !!bool true                                                            │
  │        type: int                                 # PLC DINT type                       │
  │        address: MAIN.testDint1                   # TwinCAT symbol path                 │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── adsSource2.yaml ───────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  adsSource2: &adsSource2                                                               │
  │    name: adsSource2                              # Second ADS connection                │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                                                            │
  │    connector: BeckhoffADS                                                              │
  │    rbe: !!bool true                                                                    │
  │    local_netid: 1.1.1.1.1.1                                                           │
  │    target_ip: 192.168.111.191                                                          │
  │    address: 192.168.111.191.1.1                                                        │
  │    port: !!int 851                                                                     │
  │    init_script: ~                                                                      │
  │    enter_script: ~                                                                     │
  │    exit_script: ~                                                                      │
  │    deinit_script: ~                                                                    │
  │    items:                                                                              │
  │      - name: bool1                                                                     │
  │        enabled: !!bool true                                                            │
  │        type: bool                                                                      │
  │        address: MAIN.testBool1                                                         │
  │      - name: int1                                                                      │
  │        enabled: !!bool true                                                            │
  │        type: int                                                                       │
  │        address: MAIN.testDint1                                                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    exclude_filter:                                                                     │
  │      - adsSource1/$SYSTEM                        # Suppress ADS source 1 system msgs   │
  │      - adsSource2/$SYSTEM                        # Suppress ADS source 2 system msgs   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin REST API                     │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *console                                    # Anchor from console.yaml            │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *adsSource1                                 # Anchor from adsSource1.yaml         │
  │    - *adsSource2                                 # Anchor from adsSource2.yaml         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • ADS Protocol — Beckhoff ADS (Automation Device Specification) is TwinCAT's native   │
  │    communication protocol. It uses AMS Net IDs (6-octet addresses like                 │
  │    192.168.111.191.1.1) to route messages between ADS devices on a network.            │
  │                                                                                        │
  │  • AMS Net ID — Every TwinCAT device has a unique AMS Net ID. The address field        │
  │    holds the target's AMS Net ID. The local_netid field identifies the DIME host.      │
  │    These must match the ADS routing table entries on both machines.                     │
  │                                                                                        │
  │  • ADS Port — Port 851 targets TwinCAT 3 Runtime 1 (the first PLC instance).          │
  │    Port 852 = Runtime 2, etc. Port 801 targets TwinCAT 2 Runtime 1. Each runtime      │
  │    is an independent PLC execution environment.                                        │
  │                                                                                        │
  │  • Symbol Addressing — Items use TwinCAT symbol paths: MAIN.testBool1 accesses         │
  │    variable testBool1 in program MAIN. The type field (bool, int) tells DIME how       │
  │    to interpret the raw bytes from the PLC memory.                                     │
  │                                                                                        │
  │  • Multiple Source Instances — This config creates two ADS connections to the same      │
  │    PLC. Each has its own scan loop and ring buffer publisher. Messages arrive as        │
  │    adsSource1/bool1 and adsSource2/bool1 — unique paths despite identical addresses.   │
  │    Useful for separating fast-scan and slow-scan variable groups.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
