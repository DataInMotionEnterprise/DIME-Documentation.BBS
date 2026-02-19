```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX03 — OPC-UA CLIENT READS                                             DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads OPC-UA nodes from an OPC server using username/password authentication.         │
  │  Demonstrates the OPC-UA source connector with namespace-based node addressing,        │
  │  per-item RBE overrides, and a Lua item_script that unwraps OPC DataValue objects.     │
  │  Multi-file YAML config with three files: source, sink, and main.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   OPC-UA Source          │          ┌──────────────────┐
      │   (opcUaSource1)         │     ┌───▶│  Console Sink    │  stdout
      │                          │     │    │  (consoleSink1)  │
      │   server: localhost      │     │    └──────────────────┘
      │   port:   49320          ├─────┘
      │   auth:   user/pass      │
      │                          │
      │   Items:                 │
      │   · DateTime   (ns:2)    │
      │   · Random1-8  (ns:2)    │
      │   · Sine1-4    (ns:2)    │
      │   · Ramp1-8    (ns:2)    │
      │                          │
      │   scan: 2000ms           │
      └──────────────────────────┘
             SOURCE                        RING BUFFER               SINK
       (OPC-UA polling)                  (4096 slots)          (console output)

  CONFIGURATION — 3 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── opcUaSource1.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  opcUaSource1: &opcUaSource1                                                           │
  │    name: opcUaSource1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 2000                     # Poll every 2 seconds                │
  │    connector: OpcUA                              # OPC-UA client connector             │
  │    rbe: !!bool true                              # Source-level RBE default            │
  │    address: localhost                             # OPC server hostname                │
  │    port: !!int 49320                             # OPC server port                     │
  │    timeout: !!int 1000                           # Connection timeout (ms)             │
  │    anonymous: !!bool false                       # Require authentication              │
  │    username: chris                               # OPC-UA username                     │
  │    password: passwordpassword                    # OPC-UA password                     │
  │    init_script: ~                                # No init needed                      │
  │    item_script: |                                # Runs for EVERY item                 │
  │      return result.Value;                        # Unwrap OPC DataValue                │
  │    items:                                                                              │
  │      - name: DateTime                                                                  │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                          # Per-item RBE override               │
  │        namespace: !!int 2                        # OPC-UA namespace index              │
  │        address: _System._DateTime                # Node path within namespace          │
  │        script: ~                                 # Uses item_script above              │
  │      - name: Random1                                                                   │
  │        enabled: !!bool false                     # Disabled — enable as needed         │
  │        namespace: !!int 2                                                              │
  │        address: Simulation Examples.Functions.Random1                                  │
  │      - name: Sine1                                                                     │
  │        enabled: !!bool false                                                           │
  │        namespace: !!int 2                                                              │
  │        address: Simulation Examples.Functions.Sine1                                    │
  │      - name: Ramp1                                                                     │
  │        enabled: !!bool false                                                           │
  │        namespace: !!int 2                                                              │
  │        address: Simulation Examples.Functions.Ramp1                                    │
  │      # ... additional Random2-8, Sine2-4, Ramp2-8, User1-4 items follow                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink1.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink1: &consoleSink1                                                           │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Write to console every 1s           │
  │    connector: Console                            # stdout output                       │
  │    use_sink_transform: !!bool true               # Apply sink transform                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin REST API                      │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *consoleSink1                               # Anchor from consoleSink1.yaml       │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *opcUaSource1                               # Anchor from opcUaSource1.yaml       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • OPC-UA Connector — DIME's OpcUA connector is a polling client that reads nodes      │
  │    from any OPC-UA server. Each item specifies a namespace index and node address.     │
  │    Supports both anonymous and authenticated connections.                              │
  │                                                                                        │
  │  • item_script vs script — item_script runs for EVERY item in the source and is        │
  │    ideal for common transformations. Each item can also have its own script that       │
  │    runs after item_script. Here, item_script unwraps the OPC DataValue wrapper to      │
  │    extract the raw .Value property.                                                    │
  │                                                                                        │
  │  • Namespace Addressing — OPC-UA nodes live in namespaces identified by integer        │
  │    index. Namespace 0 is the OPC standard namespace; higher indices (here ns:2) are    │
  │    vendor-specific. The address field holds the node's string identifier.              │
  │                                                                                        │
  │  • Per-Item RBE — RBE can be set at source level (applies to all items) and            │
  │    overridden per item. The DateTime item sets rbe: !!bool true explicitly, but        │
  │    since it changes every scan, every value is published anyway.                       │
  │                                                                                        │
  │  • Disabled Items — Setting enabled: !!bool false lets you pre-configure items         │
  │    without activating them. Useful for keeping a library of known tags that can be     │
  │    toggled on as needed without editing addresses.                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
