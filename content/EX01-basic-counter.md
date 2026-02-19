```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX01 — BASIC COUNTER                                                 DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  The "hello world" of DIME. A Lua script source increments a counter every second      │
  │  and publishes to three sinks: Console, HTTP Server, and WebSocket Server.             │
  │  Single-file YAML config — the simplest possible DIME integration.                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌────────────────────┐
       │   Script Source    │         ┌─────────────────┐
       │                    │    ┌───▶│  Console Sink   │  stdout
       │  counter = 0       │    │    └─────────────────┘
       │  counter = counter │    │
       │    + 1             │    │    ┌─────────────────┐
       │  return counter    ├────┼───▶│  HTTP Server    │  http://localhost:8080
       │                    │    │    └─────────────────┘
       │  scan: 1000ms      │    │
       │  RBE: true         │    │    ┌─────────────────┐
       └────────────────────┘    └───▶│  WebSocket Srv  │  ws://0.0.0.0:8092
                                      └─────────────────┘
              SOURCE                    RING BUFFER                SINKS
         (Lua scripting)             (4096 slots)           (3 destinations)

  CONFIGURATION — main.yaml                                                    [single file]
  ─────────────────────────

  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin API                           │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - name: consoleSink                                                                 │
  │      enabled: !!bool true                                                              │
  │      scan_interval: !!int 1000                                                         │
  │      connector: console                           # Prints to stdout                   │
  │                                                                                        │
  │    - name: httpServerSink                                                              │
  │      enabled: !!bool true                                                              │
  │      scan_interval: !!int 1000                                                         │
  │      connector: httpServer                        # REST endpoint                      │
  │      uri: http://localhost:8080/                                                       │
  │      use_sink_transform: !!bool false                                                  │
  │                                                                                        │
  │    - name: websocketServerSink                                                         │
  │      connector: websocketServer                   # Real-time push                     │
  │      uri: ws://0.0.0.0:8092/                                                           │
  │      use_sink_transform: !!bool false                                                  │
  │                                                                                        │
  │  sources:                                                                              │
  │    - name: scriptSource                                                                │
  │      enabled: !!bool true                                                              │
  │      scan_interval: !!int 1000                    # Poll every 1 second                │
  │      connector: script                            # Lua script connector               │
  │      rbe: !!bool true                             # Report By Exception                │
  │      init_script: counter = 0                     # Runs once at startup               │
  │      items:                                                                            │
  │        - name: Counter1                                                                │
  │          enabled: !!bool true                                                          │
  │          script: |                                # Runs every scan_interval           │
  │            counter = counter + 1                                                       │
  │            return counter                                                              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Script Connector — Lua scripting without external hardware. Ideal for testing,      │
  │    simulation, and data generation. init_script runs once, item scripts run every      │
  │    scan_interval.                                                                      │
  │                                                                                        │
  │  • Three Sink Types — Console for debugging, HTTP for REST API consumers, WebSocket    │
  │    for real-time push to browser dashboards.                                           │
  │                                                                                        │
  │  • Report By Exception (RBE) — When rbe: true, the source only publishes when the      │
  │    value changes. The counter increments every cycle so every scan produces output.    │
  │                                                                                        │
  │  • Ring Buffer — All sources publish to a shared 4096-slot Disruptor ring buffer.      │
  │    Every sink gets its own independent reader. No sink blocks another.                 │
  │                                                                                        │
  │  • YAML Types — !!int and !!bool tags ensure correct type coercion. Without them,      │
  │    "true" is a string, not a boolean.                                                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
