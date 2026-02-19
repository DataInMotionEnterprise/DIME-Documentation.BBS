```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX17 — INFLUXDB TIME-SERIES                                            DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Collects data from industrial sources (Rockwell EthernetIP PLC and Modbus TCP)        │
  │  and writes to InfluxDB Cloud using the InfluxLP (Line Protocol) sink connector.       │
  │  Demonstrates token-based authentication, cloud endpoints, exclude filters, and        │
  │  Lua scripting for data caching and transformation.                                    │
  │  Multi-file YAML — 5 files with anchors.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Rockwell EthernetIP   │
      │   (MicroLogix PLC)      │          ┌──────────────────┐
      │                         │     ┌───▶│  InfluxDB Cloud  │  InfluxLP over HTTPS
      │   192.168.111.20        │     │    │  us-east-1-1     │
      │   scan: 1500ms          │     │    │  bucket: DIME    │
      │   Items:                ├─────┤    └──────────────────┘
      │   · boolFromCache       │     │
      │   · Execution           │     │    ┌──────────────────┐
      │   · GoodPartCount       │     └───▶│  Console Sink   │  stdout
      └─────────────────────────┘          └──────────────────┘

      ┌─────────────────────────┐
      │   Modbus TCP            │
      │   (disabled by default) │
      │                         │
      │   192.168.111.20:502    │
      │   slave: 1              │
      │   Items:                │
      │   · DO0, DO1            │
      │   · holdingTags         │
      └─────────────────────────┘
             SOURCES                        RING BUFFER              SINKS
       (industrial PLCs)                  (4096 slots)       (InfluxDB + Console)

  CONFIGURATION — 5 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── rockwell.yaml ─────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  rockwell: &rockwell                                                                   │
  │    name: rockwell                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1500                     # Poll PLC every 1.5 seconds          │
  │    connector: EthernetIP                         # Allen-Bradley EthernetIP/CIP        │
  │    rbe: !!bool true                              # Only publish changes                │
  │    type: micrologix                              # PLC family type                     │
  │    address: 192.168.111.20                                                             │
  │    path: 1,0                                     # Backplane routing path              │
  │    log: !!int 0                                                                        │
  │    timeout: !!int 1000                                                                 │
  │    bypass_ping: !!bool false                                                           │
  │    strip_path_prefix: !!bool false                                                     │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: >-                                                                    │
  │          Message.Data                            # Extract raw data for sinks          │
  │    items:                                                                              │
  │      - name: boolToCache                         # Read bit, store in cache            │
  │        enabled: !!bool true                                                            │
  │        type: bool                                                                      │
  │        address: B3:0/2                           # PLC memory address                  │
  │        script: |                                                                       │
  │          set('boolTag', result);                  # Cache for other items               │
  │          return nil;                              # Don't publish this item             │
  │      - name: boolFromCache                       # Read from cache instead             │
  │        enabled: !!bool true                                                            │
  │        script: |                                                                       │
  │          return cache('boolTag', false);                                               │
  │      - name: Execution                           # Map bool to string state            │
  │        enabled: !!bool true                                                            │
  │        type: bool                                                                      │
  │        address: B3:0/3                                                                 │
  │        script: |                                                                       │
  │          local m = { [0]='Ready', [1]='Active' };                                      │
  │          return m[result and 1 or 0];                                                  │
  │      - name: GoodPartCount                       # Direct integer read                 │
  │        enabled: !!bool true                                                            │
  │        type: int                                                                       │
  │        address: N7:1                                                                   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── modbus.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  modbus: &modbus                                                                       │
  │    name: modbus                                                                        │
  │    enabled: !!bool false                         # Disabled — enable with hardware     │
  │    scan_interval: !!int 1000                                                           │
  │    connector: ModbusTCP                          # Modbus TCP/IP protocol              │
  │    rbe: !!bool true                                                                    │
  │    address: 192.168.111.20                                                             │
  │    port: !!int 502                               # Standard Modbus TCP port            │
  │    slave: !!int 1                                # Modbus slave/unit ID                │
  │    timeout: !!int 1000                                                                 │
  │    init_script: |                                                                      │
  │      struct = require('struct')                  # Binary packing library              │
  │    items:                                                                              │
  │      - name: DigitalOutputsSetUserCache                                                │
  │        type: !!int 1                             # Coils                               │
  │        address: !!int 16                                                               │
  │        count: !!int 12                                                                 │
  │        script: |                                                                       │
  │          set('outputs', result);                  # Cache array for sub-items           │
  │          return nil;                                                                   │
  │      - name: DO0                                                                       │
  │        script: return cache('outputs', nil)[0];                                        │
  │      - name: DO1                                                                       │
  │        script: return cache('outputs', nil)[1];                                        │
  │      - name: holdingTags                         # Multi-register float decode         │
  │        type: !!int 3                             # Holding registers                   │
  │        address: !!int 24                                                               │
  │        count: !!int 2                                                                  │
  │        script: |                                                                       │
  │          return struct.unpack('<I',                                                     │
  │            struct.pack('<HH', result[0], result[1]));                                   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── influx.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  influx: &influx                                                                       │
  │    name: influx                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: InfluxLP                           # InfluxDB Line Protocol sink         │
  │    address: https://us-east-1-1.aws.cloud2.influxdata.com   # Cloud endpoint           │
  │    token: holjd83YjHjuQg7n...Yy4Lg==             # API token (truncated)              │
  │    bucket_name: DIME                             # Target bucket                       │
  │    exclude_filter:                                                                     │
  │      - rockwell/$SYSTEM                          # Skip system messages                │
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
  │    use_sink_transform: !!bool true               # Apply source transform              │
  │    exclude_filter:                                                                     │
  │      - rockwell/$SYSTEM                                                                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                    # Debug output                        │
  │    - *influx                                     # InfluxDB Cloud                      │
  │  sources:                                                                              │
  │    - *modbus                                     # Modbus TCP (disabled)               │
  │    - *rockwell                                   # EthernetIP PLC (active)             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • InfluxLP Connector — Writes data using InfluxDB Line Protocol over HTTPS. Each      │
  │    item becomes a measurement with the source/item path as the measurement name.       │
  │    Timestamps are generated automatically.                                             │
  │                                                                                        │
  │  • Token Authentication — The InfluxLP sink uses a token property for API auth.        │
  │    This is the standard InfluxDB v2/Cloud authentication mechanism. Keep tokens        │
  │    in separate YAML files away from version control.                                   │
  │                                                                                        │
  │  • Cache-and-Forward Pattern — The Rockwell source caches raw PLC bits with            │
  │    set('boolTag', result) and return nil (suppressing direct publish). Other items     │
  │    read from cache('boolTag', false) to transform and publish derived values.          │
  │                                                                                        │
  │  • Multiple Sources, One Sink — Both Modbus and Rockwell sources feed the same        │
  │    InfluxDB sink. The ring buffer merges all source data; the sink writes it all.      │
  │    This is the standard DIME fan-in pattern.                                           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
