```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX18 — MONGODB DOCUMENTS                                               DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads PLC data from a Rockwell MicroLogix via EthernetIP and stores it as             │
  │  documents in MongoDB Atlas (cloud). Demonstrates the MongoDB sink connector           │
  │  with Atlas connection strings, database/collection targeting, and                     │
  │  use_sink_transform for data formatting. Console sink for debugging.                   │
  │  Multi-file YAML — 4 files with anchors.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Rockwell EthernetIP   │          ┌───────────────────┐
      │   (MicroLogix PLC)      │     ┌───▶│  MongoDB Atlas    │  mongodb+srv://
      │                         │     │    │  DB: DIME         │
      │   192.168.111.20        │     │    │  Collection: TS   │
      │   scan: 1500ms          ├─────┤    └───────────────────┘
      │                         │     │
      │   Items:                │     │    ┌──────────────────┐
      │   · boolFromCache       │     └───▶│  Console Sink    │  stdout
      │   · Execution           │          └──────────────────┘
      │   · GoodPartCount       │
      └─────────────────────────┘
              SOURCE                        RING BUFFER              SINKS
        (EthernetIP PLC)                  (4096 slots)       (MongoDB + Console)

  CONFIGURATION — 4 files                                                     [multi-file]
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
  │          Message.Data                            # Extract raw data value              │
  │    items:                                                                              │
  │      - name: boolToCache                         # Read bit, store in cache            │
  │        enabled: !!bool true                                                            │
  │        type: bool                                                                      │
  │        address: B3:0/2                                                                 │
  │        script: |                                                                       │
  │          set('boolTag', result);                                                       │
  │          return nil;                              # Suppress publish                   │
  │      - name: boolFromCache                       # Retrieve cached value               │
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

  ── mongo.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mongo: &mongo                                                                         │
  │    name: mongo                                                                         │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MongoDB                            # MongoDB document sink               │
  │    use_sink_transform: !!bool true               # Apply source transform              │
  │    address: mongodb+srv://user:pa55w0rd@cluster0.h7xod.mongodb.net/                    │
  │             ?retryWrites=true&w=majority&appName=Cluster0                              │
  │    database: DIME                                # Target database name                │
  │    collection: TS                                # Target collection name              │
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
  │    use_sink_transform: !!bool true                                                     │
  │    exclude_filter:                                                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                    # Debug output                        │
  │    - *mongo                                      # MongoDB Atlas                       │
  │  sources:                                                                              │
  │    - *rockwell                                   # EthernetIP PLC                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • MongoDB Sink — The MongoDB connector writes each incoming message as a document     │
  │    to the specified database and collection. Each document includes the item path,     │
  │    value, and timestamp. Ideal for event logs and time-series document storage.        │
  │                                                                                        │
  │  • Atlas Connection String — Uses the mongodb+srv:// protocol for MongoDB Atlas        │
  │    cloud clusters. The connection string includes authentication credentials,          │
  │    retry settings, and write concern. Keep credentials out of version control.         │
  │                                                                                        │
  │  • use_sink_transform — When true on a sink, it applies the source's                   │
  │    sink.transform.template to extract just the data value (Message.Data) before        │
  │    writing. Without it, the full MessageBoxMessage envelope is stored.                 │
  │                                                                                        │
  │  • Cache-and-Forward Pattern — Same as EX17: cache raw PLC bits with set/return nil,   │
  │    then read with cache() in derived items. This separates data acquisition from       │
  │    data transformation cleanly.                                                        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
