```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX16 — MTCONNECT AGGREGATION                                           DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads data from a remote MTConnect agent (Mazak demo server) and re-publishes it      │
  │  through a local MTConnect Agent sink. This is the agent-to-agent aggregation          │
  │  pattern — pull from one or more remote agents, combine, and serve locally.            │
  │  Uses strip_path_prefix and per-item sink.mtconnect path remapping.                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   MTConnect Source       │          ┌──────────────────┐
      │                          │     ┌───▶│  MTConnect Agent │  http://localhost:5000
      │   Remote agent:          │     │    │  (local agent)   │
      │   mtconnect.mazakcorp    │     │    └──────────────────┘
      │   .com:5719              ├─────┤
      │                          │     │    ┌──────────────────┐
      │   Items:                 │     └───▶│  Console Sink    │  stdout (commented out)
      │   · Availability         │          └──────────────────┘
      │   · Execution            │
      │   · XLoad                │
      │                          │
      │   strip_path_prefix:     │
      │     true                 │
      └──────────────────────────┘
              SOURCE                        RING BUFFER              SINKS
      (remote MTConnect agent)            (4096 slots)          (local agent)

  CONFIGURATION — 4 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── mtConnectSource1.yaml ─────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mtConnectSource1: &mtConnectSource1                                                   │
  │    name: mtConnectSource1                                                              │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Poll remote agent every 1s          │
  │    connector: MTConnectAgent                     # Same connector, used as source      │
  │    rbe: !!bool true                              # Only publish on value changes       │
  │    itemized_read: !!bool true                    # Read each item individually         │
  │    address: mtconnect.mazakcorp.com              # Remote agent hostname               │
  │    port: !!int 5719                              # Remote agent port                   │
  │    init_script: ~                                                                      │
  │    strip_path_prefix: !!bool true                # Remove source path prefix           │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: >-                              # Extract first value from response   │
  │          Message.Data[0].Value                                                         │
  │    items:                                                                              │
  │      - name: Availability                                                              │
  │        address: avail                            # MTConnect DataItem address          │
  │        sink:                                                                           │
  │          mtconnect: Device[Name=device1]/Availability[Category=Event]                  │
  │      - name: Execution                                                                 │
  │        address: execution                                                              │
  │        sink:                                                                           │
  │          mtconnect: Device[Name=device1]/Controller/Path/Execution[Category=Event]     │
  │      - name: XLoad                                                                     │
  │        address: Xload                                                                  │
  │        sink:                                                                           │
  │          mtconnect: Device[Name=device1]/Axes/Linear[Name=X]/Load[Category=Sample]     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── mtConnectSink1.yaml ───────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mtConnectSink1: &mtConnectSink1                                                       │
  │    name: mtConnectSink1                                                                │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MTConnectAgent                     # Local agent sink                    │
  │    port: !!int 5000                              # Serve locally on port 5000          │
  │    use_sink_transform: !!bool true               # Apply source transform              │
  │    exclude_filter:                                                                     │
  │      - mtConnectSource1/$SYSTEM                  # Skip system health messages         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink1.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink1: &consoleSink1                                                           │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true                                                     │
  │    exclude_filter:                                                                     │
  │      - mtConnectSource1/$SYSTEM                                                        │
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
  │    #- *consoleSink1                              # Uncomment for debug output          │
  │    - *mtConnectSink1                             # Local agent re-publishing data      │
  │  sources:                                                                              │
  │    - *mtConnectSource1                           # Remote Mazak agent                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Agent-to-Agent Pattern — The MTConnectAgent connector works as both source and      │
  │    sink. As a source it reads /current from a remote agent. As a sink it publishes     │
  │    values through a local agent. This enables data aggregation from multiple plants.   │
  │                                                                                        │
  │  • strip_path_prefix — When true, the source connector strips its own name prefix      │
  │    from item paths. Without it, items arrive as mtConnectSource1/Availability.         │
  │    With it, they arrive as just Availability, which simplifies path remapping.         │
  │                                                                                        │
  │  • Sink Transform — The source defines a transform template Message.Data[0].Value      │
  │    to extract the raw value from the MTConnect response array. The sink sets           │
  │    use_sink_transform: true to apply it before writing to the local agent.             │
  │                                                                                        │
  │  • itemized_read — When true, each item is read individually from the remote agent     │
  │    using its address field. This gives per-item control vs. bulk reads.                │
  │                                                                                        │
  │  • Path Remapping — Each source item's sink.mtconnect annotation defines where it      │
  │    appears in the local agent's device model, allowing complete restructuring.         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
