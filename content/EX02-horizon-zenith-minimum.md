```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX02 — HORIZON & ZENITH MINIMUM                                     DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Minimum viable Horizon/Zenith configuration. A 5-axis CNC machine simulator           │
  │  generates real-time position data (X, Y, Z, A, B axes) via Lua scripting, then        │
  │  publishes to HTTP, WebSocket, and a static WebServer for browser visualization.       │
  │  Multi-file YAML with anchors (&/*) — the standard DIME modular config pattern.        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Machine Simulator     │          ┌──────────────────┐
      │   (Script connector)    │     ┌───▶│  HTTP Server     │  http://0.0.0.0:8080
      │                         │     │    │  (REST endpoint) │
      │   5-axis CNC state      │     │    └──────────────────┘
      │   machine: face mill    │     │
      │   + chamfer cycle       │     │    ┌──────────────────┐
      │                         ├─────┼───▶│  WebSocket Srv   │  ws://0.0.0.0:8092
      │   Items:                │     │    │  (real-time)     │
      │   · XPositionCurrent    │     │    └──────────────────┘
      │   · YPositionCurrent    │     │
      │   · ZPositionCurrent    │     │    ┌──────────────────┐
      │   · ARotationCurrent    │     └───▶│  Web Server      │  http://0.0.0.0:8090
      │   · BRotationCurrent    │          │  (static files)  │
      │                         │          └──────────────────┘
      │   scan: 20ms (50Hz)     │
      └─────────────────────────┘
              SOURCE                       RING BUFFER                SINKS
        (Lua state machine)              (4096 slots)           (3 destinations)

  CONFIGURATION — 5 files                                                      [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://0.0.0.0:9999/                                               │
  │    ws_server_uri: ws://0.0.0.0:9998/                                                   │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *machineSimulator                            # Anchor from machineSimulator.yaml  │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *httpServerSink                              # Anchor from httpServerSink.yaml    │
  │    - *websocketSink                               # Anchor from websocketSink.yaml     │
  │    - *webServerSink                               # Anchor from webServerSink.yaml     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── machineSimulator.yaml ──────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  machineSimulator: &machineSimulator                                                   │
  │    name: machineSimulator                                                              │
  │    connector: Script                                                                   │
  │    scan_interval: !!int 20                        # 50Hz for smooth animation          │
  │    rbe: !!bool false                              # Always send (animation needs it)   │
  │    lang_script: Lua                                                                    │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: Message.Data                                                          │
  │    init_script: |                                                                      │
  │      -- Initialize 5-axis CNC position simulator                                       │
  │      -- Face Milling and Chamfer Operations                                            │
  │      math.randomseed(os.time())                                                        │
  │      -- OPERATION states: RAPID_TO_START, PLUNGE, FACE_MILLING,                        │
  │      --   RETRACT, CHAMFER_POSITION, CHAMFER_CUT, CYCLE_COMPLETE                       │
  │      set("./current_operation", 1)                                                     │
  │      set("./XPosition", 0.0)                                                           │
  │      set("./YPosition", 0.0)                                                           │
  │      set("./ZPosition", 100.0)                    # Start at safe height               │
  │      set("./ARotation", 0.0)                                                           │
  │      set("./BRotation", 0.0)                                                           │
  │    enter_script: |                                                                     │
  │      -- State machine: smooth interpolation between target positions                   │
  │      -- Cycles through: rapid → plunge → face mill → retract → chamfer → repeat        │
  │      -- ~300 lines of Lua state machine logic (see full file)                          │
  │    items:                                                                              │
  │      - name: XPositionCurrent                                                          │
  │        script: return cache("./XPosition") or 0.0                                      │
  │      - name: YPositionCurrent                                                          │
  │        script: return cache("./YPosition") or 0.0                                      │
  │      - name: ZPositionCurrent                                                          │
  │        script: return cache("./ZPosition") or 0.0                                      │
  │      - name: ARotationCurrent                                                          │
  │        script: return cache("./ARotation") or 0.0                                      │
  │      - name: BRotationCurrent                                                          │
  │        script: return cache("./BRotation") or 0.0                                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── httpServerSink.yaml ────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  httpServerSink: &httpServerSink                                                       │
  │    name: httpServerSink                                                                │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: HTTPServer                                                               │
  │    uri: http://0.0.0.0:8080/                                                           │
  │    use_sink_transform: !!bool false                                                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── websocketSink.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  websocketSink: &websocketSink                                                         │
  │    name: websocketSink                                                                 │
  │    connector: WebsocketServer                                                          │
  │    uri: ws://0.0.0.0:8092/                                                             │
  │    scan_interval: !!int 20                        # Match source for smooth updates    │
  │    use_sink_transform: !!bool false                                                    │
  │    include_filter:                                # Only send position data            │
  │      - "machineSimulator/XPositionCurrent"                                             │
  │      - "machineSimulator/YPositionCurrent"                                             │
  │      - "machineSimulator/ZPositionCurrent"                                             │
  │      - "machineSimulator/ARotationCurrent"                                             │
  │      - "machineSimulator/BRotationCurrent"                                             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── webServerSink.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  webServerSink: &webServerSink                                                         │
  │    name: webServerSink                                                                 │
  │    connector: WebServer                                                                │
  │    uri: http://0.0.0.0:8090/                                                           │
  │    web_root: ./Configs/web                        # Serves static HTML/JS/CSS          │
  │    exclude_filter:                                                                     │
  │      - ".*"                                       # No data — static files only        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Multi-File YAML — Each connector lives in its own file with an anchor (&name).      │
  │    The main.yaml uses aliases (*name) to compose the full config. DIME merges all      │
  │    YAML files in the directory automatically; main.yaml is loaded last.                │
  │                                                                                        │
  │  • YAML Anchors & Aliases — The &machineSimulator anchor defines the source config.    │
  │    In main.yaml, *machineSimulator references it. This lets you reuse connector        │
  │    definitions across multiple configs without duplication.                            │
  │                                                                                        │
  │  • High-Frequency Scanning — scan_interval: 20 gives 50Hz update rate. The WebSocket   │
  │    sink matches this rate for smooth browser animation. The HTTP sink stays at 1000ms  │
  │    since REST polling doesn't need 50Hz.                                               │
  │                                                                                        │
  │  • Include/Exclude Filters — The WebSocket sink uses include_filter to send only       │
  │    position items. The WebServer sink uses exclude_filter: ".*" to block all data      │
  │    (it only serves static files).                                                      │
  │                                                                                        │
  │  • Cache API — The Lua set()/cache() functions store and retrieve state between scan   │
  │    cycles. The state machine uses "./" prefix paths for source-scoped cache entries.   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
