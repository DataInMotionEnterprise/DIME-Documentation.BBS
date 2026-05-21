```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX37 — MAXIMO MONITOR                                                  DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads execution, e-stop and X/Y/Z axis data from an MTConnect agent                   │
  │  and publishes it to IBM Maximo Monitor with the MaximoMonitor sink.                   │
  │  The sink builds one flat JSON event per cycle - no Script connector                   │
  │  is needed. Compare with EX16, which used a dataFormatter combiner.                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │  MTConnect Source        │       ┌──────────────────────┐
      │                          │   ┌──▶│  MaximoMonitor Sink  │ ─▶ IBM Maximo
      │  demo.mtconnect.org      │   │   │  iot-2/evt/status    │    Monitor
      │  :5000  device=Mazak     ├───┤   └──────────────────────┘
      │                          │   │   ┌──────────────────────┐
      │  11 items: execution,    │   └──▶│  Console Sink        │ ─▶ stdout
      │  estop, loads, temps     │       └──────────────────────┘
      └──────────────────────────┘
             SOURCE                    RING BUFFER           SINKS
      (remote MTConnect agent)         (4096 slots)    (Maximo + console)

  CONFIGURATION — 4 files                                          [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). main.yaml references them (*).

  ── mazakSource.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mazakSource: &mazakSource                                                             │
  │    name: mazakSource                                                                   │
  │    connector: MTConnectAgent              # Used as a source                           │
  │    scan_interval: !!int 1000                                                           │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool true                                                          │
  │    address: demo.mtconnect.org                                                         │
  │    port: !!int 5000                                                                    │
  │    device: Mazak                                                                       │
  │    items:                                                                              │
  │      - name: execution                                                                 │
  │        address: execution                                                              │
  │        script: |                                                                       │
  │          return result[0].Value;          # result is 0-indexed                        │
  │      - name: Xload                                                                     │
  │        address: Xload                                                                  │
  │        script: |                                                                       │
  │          return tonumber(result[0].Value);                                             │
  │      # ... estop, servotemp1-3, x/y/z load + axis state items                          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── maximoMonitorSink.yaml ────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  maximoMonitorSink: &maximoMonitorSink                                                 │
  │    name: maximoMonitorSink                                                             │
  │    connector: MaximoMonitor                                                            │
  │    scan_interval: !!int 1000              # Event publish cadence                      │
  │    address: vm-maxproxy.sms-inc.net                                                    │
  │    port: !!int 8883                                                                    │
  │    tls: !!bool true                                                                    │
  │    org_id: smsinst3                       # } client id =                              │
  │    device_type: CNC_Mazak                 # } d:smsinst3:                              │
  │    device_id: CNC_Mazak_001               # }  CNC_Mazak:CNC_Mazak_001                 │
  │    auth_token: your-device-auth-token     # user: use-token-auth                       │
  │    device: Mazak                          # payload "device" field                     │
  │    event_id: status                       # topic iot-2/evt/status/...                 │
  │    qos: !!int 1                                                                        │
  │    include_filter:                                                                     │
  │      - mazakSource/.*                     # only Mazak items                           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink: &consoleSink                                                             │
  │    name: consoleSink                                                                   │
  │    connector: Console                                                                  │
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
  │  sources:                                                                              │
  │    - *mazakSource                                                                      │
  │  sinks:                                                                                │
  │    - *consoleSink                         # Raw item stream, debug                     │
  │    - *maximoMonitorSink                   # Formats + publishes event                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Per-Cycle Snapshot — Every scan_interval the sink merges newly                      │
  │    received items into a running map and emits one JSON event with                     │
  │    the full device state. Unchanged items keep their last value.                       │
  │                                                                                        │
  │  • No Script Connector — The MaximoMonitor sink owns the payload                       │
  │    format, so the dataFormatter combiner from EX16 is not needed.                      │
  │                                                                                        │
  │  • Client Id Composition — org_id, device_type and device_id form                      │
  │    the IBM client id d:{org}:{type}:{id}; auth_token authenticates                     │
  │    as user "use-token-auth".                                                           │
  │                                                                                        │
  │  • Topic Structure — event_id sets the publish topic,                                  │
  │    iot-2/evt/{event_id}/fmt/json (here iot-2/evt/status/fmt/json).                     │
  │                                                                                        │
  │  • Metric Keys — Each source item name becomes one key in the                          │
  │    payload; timestamp and device are added automatically.                              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
