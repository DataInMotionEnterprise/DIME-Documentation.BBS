```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX11 — MQTT TO WEBSOCKET BRIDGE                                        DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Bridge MQTT topics to WebSocket clients. Subscribes to MQTT topics using wildcard     │
  │  patterns, parses JSON payloads with Lua, and pushes data to both console and a        │
  │  WebSocket server. Uses itemized_read: false for event-driven MQTT message handling.   │
  │  Demonstrates MQTT wildcards (+/#) and real-time data bridging to browser clients.     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────────┐
      │   MQTT Source             │
      │                           │        ┌──────────────────┐
      │  Broker: wss.sharc.tech   │   ┌───▶│  Console Sink    │  stdout
      │  Port:   1883             │   │    └──────────────────┘
      │                           │   │
      │  Subscribe:               │   │
      │  · sharc/+/evt/#          ├───┤
      │    (wildcard pattern)     │   │
      │                           │   │    ┌──────────────────┐
      │  Lua: from_json(result)   │   └───▶│  WebSocket Srv   │  ws://127.0.0.1:8082
      │                           │        └──────────────────┘
      │  scan: 500ms              │
      │  RBE: true                │
      │  itemized_read: false     │
      └───────────────────────────┘
             SOURCE                       RING BUFFER             SINKS
       (MQTT subscriber)                (4096 slots)         (2 destinations)

  CONFIGURATION — 4 files                                                         [multi-file]
  ───────────────────────

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *consoleSink1                                # Debug output                       │
  │    - *websocketServerSink1                        # WebSocket push to browsers         │
  │  sources:                                                                              │
  │    - *mqttSource1                                 # MQTT subscription                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── mqttSource1.yaml ───────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mqttSource1: &mqttSource1                                                             │
  │    name: mqttSource1                                                                   │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                       # Check for messages every 500ms     │
  │    connector: MQTT                                # MQTT source connector              │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                    # Event-driven (queuing mode)        │
  │    address: wss.sharc.tech                        # MQTT broker hostname               │
  │    port: !!int 1883                               # Standard MQTT port                 │
  │    qos: !!int 0                                   # At most once delivery              │
  │    init_script: |                                                                      │
  │      -- Load JSON parsing library (bundled with DIME)                                  │
  │      json = require('json');                                                           │
  │    item_script: |                                                                      │
  │      return from_json(result);                    # Parse all items as JSON            │
  │    items:                                                                              │
  │      - name: AllSharcs                                                                 │
  │        enabled: !!bool true                                                            │
  │        address: sharc/+/evt/#                     # MQTT wildcard subscription         │
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
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── wsServerSink.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  websocketServerSink1: &websocketServerSink1                                           │
  │    name: websocketServerSink1                                                          │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: WebsocketServer                     # Push to WebSocket clients          │
  │    uri: ws://127.0.0.1:8082/                      # WebSocket endpoint                 │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * MQTT Wildcards — The topic address sharc/+/evt/# uses two MQTT wildcard types:      │
  │    + matches exactly one level (any device ID), # matches all remaining levels         │
  │    (any event path). This subscribes to all events from all SHARC devices.             │
  │                                                                                        │
  │  * itemized_read: false — Switches the MQTT connector to queuing (event-driven)        │
  │    mode. Messages arrive asynchronously from the broker. scan_interval controls        │
  │    how often queued messages are drained and published to the ring buffer.             │
  │                                                                                        │
  │  * JSON Parsing with Lua — init_script loads the json library once at startup.         │
  │    item_script applies from_json(result) to every incoming message, converting         │
  │    raw JSON strings into structured Lua tables that sinks receive as objects.          │
  │                                                                                        │
  │  * item_script vs script — item_script runs for ALL items in the source (shared        │
  │    transform). Per-item script runs only for that specific item. Use item_script       │
  │    when all items need the same processing (like JSON parsing).                        │
  │                                                                                        │
  │  * Protocol Bridge — MQTT (pub/sub) to WebSocket (push) is a common IoT pattern.       │
  │    DIME acts as the bridge: factory-floor devices publish MQTT, browser dashboards     │
  │    consume WebSocket. No custom code needed — just YAML configuration.                 │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
