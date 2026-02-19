```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX08 — OPC-UA SERVER SINK                                              DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  DIME as an OPC-UA server. A Lua script generates random data, and an OPC-UA Server    │
  │  sink exposes it to external OPC-UA clients (UaExpert, Ignition, Kepware, etc.).       │
  │  This turns DIME into a standards-compliant OPC-UA endpoint — any OPC-UA client        │
  │  can browse and subscribe to live data on port 4840.                                   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────┐
      │   Script Source       │          ┌───────────────────────┐
      │                       │     ┌───▶│  Console Sink         │  stdout
      │  random1 =            │     │    └───────────────────────┘
      │    math.random(200)   │     │
      │                       ├─────┤
      │  scan: 2000ms         │     │    ┌───────────────────────┐
      │  RBE: true            │     └───▶│  OPC-UA Server        │  opc.tcp://localhost:4840
      └───────────────────────┘          │  namespace: Production│
                                         │  root: Production     │
             SOURCE                      └───────────────────────┘
       (Lua random data)           RING BUFFER          SINKS
                                  (4096 slots)     (2 destinations)

  CONFIGURATION — 4 files                                                         [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin API                           │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │  sinks:                                                                                │
  │    - *console                                     # Console for debugging              │
  │    - *opcUa                                       # OPC-UA Server endpoint             │
  │  sources:                                                                              │
  │    - *script                                      # Lua data generator                 │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── script.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  script: &script                                                                       │
  │    name: script                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 2000                      # Generate data every 2 seconds      │
  │    connector: Script                              # Lua script connector               │
  │    rbe: !!bool true                               # Only publish on change             │
  │    items:                                                                              │
  │      - name: random1                                                                   │
  │        enabled: !!bool true                                                            │
  │        script: |                                  # Random int 1-200                   │
  │          return math.random(200);                                                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                             # Print to stdout                    │
  │    use_sink_transform: !!bool false                                                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── opcUa.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  opcUa: &opcUa                                                                         │
  │    name: opcUa                                                                         │
  │    connector: opcuaserver                         # OPC-UA Server sink                 │
  │    enabled: true                                                                       │
  │    port: 4840                                     # Standard OPC-UA port               │
  │    application_name: "DIME Production Data Server"                                     │
  │    application_uri: "urn:dime:production:server"                                       │
  │    namespace_uri: "urn:dime:production:data"      # Custom namespace URI               │
  │    root_folder: "Production"                      # Browse tree root node              │
  │    max_sessions: 50                               # Concurrent client limit            │
  │    session_timeout: 60000                          # Session timeout (ms)              │
  │    max_subscriptions: 20                           # Subscription limit per session    │
  │    exclude_filter:                                                                     │
  │      - /\$SYSTEM                                  # Hide system messages from clients  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * OPC-UA Server Sink — DIME becomes the server. External clients browse and           │
  │    subscribe to nodes. Each ring buffer item becomes an OPC-UA node under the          │
  │    root_folder in the configured namespace.                                            │
  │                                                                                        │
  │  * Server Identity — application_name and application_uri identify the server in       │
  │    client discovery. namespace_uri scopes the data nodes to avoid collisions with      │
  │    other OPC-UA servers on the network.                                                │
  │                                                                                        │
  │  * Session Management — max_sessions limits concurrent clients. session_timeout        │
  │    (60s) cleans up idle connections. max_subscriptions bounds per-session data         │
  │    subscriptions for resource control.                                                 │
  │                                                                                        │
  │  * System Message Filtering — The exclude_filter regex /\$SYSTEM hides DIME            │
  │    internal system messages ($SYSTEM) from OPC-UA clients. Only real data items        │
  │    appear in the browse tree.                                                          │
  │                                                                                        │
  │  * OPC-UA vs OPC-DA — This uses OPC-UA (Unified Architecture), the modern              │
  │    platform-independent standard. See EX10 for legacy COM-based OPC-DA.                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
