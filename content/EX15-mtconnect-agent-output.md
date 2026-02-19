```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX15 — MTCONNECT AGENT OUTPUT                                          DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Publishes Lua-generated random data to an MTConnect Agent sink. Each script item      │
  │  maps to a specific MTConnect Device/Controller path using per-item sink.mtconnect     │
  │  annotations. A Console sink provides debug output alongside the agent.                │
  │  Multi-file YAML — 4 files with anchors.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   Script Source          │          ┌──────────────────┐
      │                          │     ┌───▶│  MTConnect Agent │  http://localhost:5000
      │   number1:               │     │    │  (SHDR protocol) │
      │     math.random(100)     │     │    └──────────────────┘
      │     → Device/Controller  │     │
      │       /Mass[Sample]      ├─────┤
      │                          │     │    ┌──────────────────┐
      │   number2:               │     └───▶│  Console Sink    │  stdout
      │     math.random(200)     │          └──────────────────┘
      │     → Device/Controller  │
      │       /Load[Sample]      │
      └──────────────────────────┘
              SOURCE                        RING BUFFER              SINKS
         (Lua scripting)                  (4096 slots)          (2 destinations)

  CONFIGURATION — 4 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── script.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  script: &script                                                                       │
  │    name: script                                                                        │
  │    connector: Script                                                                   │
  │    items:                                                                              │
  │      - name: number1                                                                   │
  │        script: return math.random(100);                                                │
  │        sink:                                     # Per-item MTConnect path mapping     │
  │          mtconnect: Device[name=device1]/Controller/Mass[category=Sample]              │
  │      - name: number2                                                                   │
  │        script: return math.random(200);                                                │
  │        sink:                                                                           │
  │          mtconnect: Device[name=device1]/Controller/Load[category=Sample]              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── agent.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  agent: &agent                                                                         │
  │    name: agent                                                                         │
  │    connector: MTConnectAgent                     # Built-in MTConnect Agent sink       │
  │    port: !!int 5000                              # Agent listens on this port          │
  │    exclude_filter:                                                                     │
  │      - script/$SYSTEM                            # Filter out system messages          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    connector: Console                            # Debug output to stdout              │
  │    exclude_filter:                                                                     │
  │      - script/$SYSTEM                            # Filter out system messages          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin API                           │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │  sinks:                                                                                │
  │    - *agent                                      # MTConnect Agent on port 5000        │
  │    - *console                                    # Debug to stdout                     │
  │  sources:                                                                              │
  │    - *script                                     # Lua random number generator         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • MTConnect Agent Sink — DIME embeds a full MTConnect Agent. The connector:           │
  │    MTConnectAgent type starts an HTTP server that speaks the MTConnect protocol.       │
  │    External MTConnect clients can read from it like any standard agent.                │
  │                                                                                        │
  │  • Per-Item Path Mapping — Each source item carries a sink.mtconnect annotation        │
  │    that defines where the value appears in the MTConnect device model:                 │
  │      Device[name=device1]/Controller/Mass[category=Sample]                             │
  │    This maps the value to the Mass DataItem under the Controller component.            │
  │                                                                                        │
  │  • Device Model Construction — The agent sink reads all sink.mtconnect paths from      │
  │    incoming items and automatically constructs the MTConnect device model XML.         │
  │    No separate Devices.xml file is needed.                                             │
  │                                                                                        │
  │  • Exclude Filters — Both sinks use exclude_filter to skip system messages             │
  │    (script/$SYSTEM). System messages contain connector health data (IsConnected,       │
  │    FaultCount) that don't belong in the MTConnect output.                              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
