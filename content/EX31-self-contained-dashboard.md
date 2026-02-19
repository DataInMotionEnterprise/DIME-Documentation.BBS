```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX31 — SELF-CONTAINED DASHBOARD                                     DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Builds a zero-dependency monitoring dashboard using DIME's WebServer and WebSocket    │
  │  sinks. A Script source simulates a sheet-metal press brake machine (GWB/Ultiform)     │
  │  with 50+ OPC-UA-style variables: machine state, job tracking, part quality,           │
  │  hydraulics, maintenance timers, and remote diagnostics. The browser connects to       │
  │  WebSocket for live data without any external web framework.                           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌────────────────────────────┐
       │  gwb00_simulator (Script)  │  1000ms
       │                            │
       │  50+ items simulating      │         ┌──────────────────────────────┐
       │  OPC-UA variable tree:     │         │                              │
       │                            │         │    Disruptor Ring Buffer     │
       │  Machine/Kind              │         │    4096 slots                │
       │  MachineStatus/Active      │─────┬──▶│                              │
       │  ActiveJob/Quantity/*      │     │   └──────────┬───────────────────┘
       │  Maintenance/*/Overdue     │     │              │
       │  RemoteDiagnosis/Hydr/*    │     │    ┌─────────┼────────────────┐
       │  RemoteDiagnosis/EFL/*     │     │    │         │        │       │
       └────────────────────────────┘     │    ▼         ▼        ▼       ▼
                                          │  ┌──────┐ ┌──────┐ ┌─────┐ ┌──────┐
            1 SOURCE                      │  │WebSrv│ │  WS  │ │HTTP │ │ Con- │
        (Lua state machine)               │  │:8080 │ │:8082 │ │:8081│ │ sole │
                                          │  └──────┘ └──────┘ └─────┘ └──────┘
                                          │   Static   Real-    REST    Debug
                                          │   HTML/JS  time     API
                                          │            push

  CONFIGURATION                                                    [7 files, 1 web/ folder]
  ─────────────

  ┌─ gwb00_simulator.yaml (abbreviated -- 50+ items) ────────────────────────────────────────┐
  │                                                                                          │
  │  gwb00_simulator: &gwb00_simulator                                                       │
  │    name: gwb00_simulator                                                                 │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 1000                                                             │
  │    rbe: !!bool true                                                                      │
  │    init_script: |                                                                        │
  │      set('./internal/machine_state', 1)   # Start with OFF                               │
  │      set('./job/total', 100)                                                             │
  │      set('./job/completed', 0)                                                           │
  │      set('./maintenance/last_lubrication', os.time() - (120*60*60))                      │
  │      set('./maintenance/last_audit', os.time() - (600*60*60))                            │
  │    items:                                                                                │
  │      # Machine Info                                                                      │
  │      - name: Machine/Kind                                                                │
  │        script: return "PBMACHINE"                                                        │
  │      - name: Machine/Name                                                                │
  │        script: return "38727"                                                            │
  │                                                                                          │
  │      # State Machine: OFF -> SETUP -> EXECUTING -> SETUP (90%) or DOWN (10%)             │
  │      - name: MachineStatus/Active                                                        │
  │        script: |                                                                         │
  │          local states = {"OFF","SETUP","STARVED","EXECUTING","DOWN"}                     │
  │          local current_state = cache('./internal/machine_state', 1)                      │
  │          -- Transitions every ~15 seconds based on execution count                       │
  │          ...                                                                             │
  │          return states[current_state]                                                    │
  │                                                                                          │
  │      # Cycle status: IDLE/WAIT PEDAL/DESCENDING/FORMING/ASCENDING/COMPLETE               │
  │      - name: MachineRt/Cycle/Status                                                      │
  │                                                                                          │
  │      # Job tracking: quantities, timing, estimated vs actual                             │
  │      - name: ActiveJob/Quantity/Completed                                                │
  │        script: |                          # 2% chance per scan during EXECUTING          │
  │          if machine_state == "EXECUTING" and math.random() < 0.02 then                   │
  │            completed = completed + 1      # 95% good rate                                │
  │          end                                                                             │
  │                                                                                          │
  │      # Maintenance timers: lubrication (168h), audit (720h), cartridge (2160h)           │
  │      - name: Maintenance/Lubrication/Overdue                                             │
  │        script: |                                                                         │
  │          local last = cache('./maintenance/last_lubrication', os.time())                 │
  │          return (os.time() - last) > 168 * 60 * 60                                       │
  │                                                                                          │
  │      # Remote diagnostics: hydraulics, PLC inputs, PCSS, EFL                             │
  │      - name: RemoteDiagnosis/Hydr/Hydr0/ControlOut                                       │
  │      - name: RemoteDiagnosis/PCSS/Condition                                              │
  │      - name: RemoteDiagnosis/EFL/Mode                                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ webserver_sink.yaml ────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  web_server: &web_server                                                                 │
  │    connector: WebServer                   # Built-in HTTP file server                    │
  │    uri: http://127.0.0.1:8080/                                                           │
  │    web_root: ./Configs/web                # Serves index.html, JS, CSS                   │
  │    exclude_filter:                                                                       │
  │      - ".*"                               # Block ALL data -- files only                 │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ websocket_sink.yaml ────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  websocket_stream: &websocket_stream                                                     │
  │    connector: WebsocketServer             # Real-time push to browsers                   │
  │    uri: ws://localhost:8082/              # Different port from HTTP server              │
  │    scan_interval: !!int 1000                                                             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ httpserver_sink.yaml / console_sink.yaml ───────────────────────────────────────────────┐
  │                                                                                          │
  │  http_server: &http_server                # REST API for latest values                   │
  │    connector: HTTPServer                                                                 │
  │    uri: http://localhost:8081/                                                           │
  │                                                                                          │
  │  console_output: &console_output          # Debug output                                 │
  │    connector: Console                                                                    │
  │    use_sink_transform: !!bool true                                                       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                      │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *gwb00_simulator                                                                    │
  │  sinks:                                                                                  │
  │    - *console_output                                                                     │
  │    - *http_server                                                                        │
  │    - *websocket_stream                                                                   │
  │    - *web_server                                                                         │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * WebServer + WebSocket Pattern -- The WebServer sink serves static files (HTML,      │
  │    JS, CSS) on one port. The WebSocket sink streams live data on another port. The     │
  │    browser loads the page from WebServer, then opens a WebSocket to receive updates.   │
  │    exclude_filter: ".*" on WebServer prevents it from processing data messages.        │
  │                                                                                        │
  │  * Hierarchical Item Names -- Items use path-like names (Machine/Kind,                 │
  │    ActiveJob/Quantity/Good, RemoteDiagnosis/Hydr/Hydr0/ControlOut). These map          │
  │    directly to OPC-UA variable structures. The browser receives them as                │
  │    "gwb00_simulator/Machine/Kind" paths.                                               │
  │                                                                                        │
  │  * Cache-Driven State Machine -- The simulator uses cache() and set() to manage        │
  │    execution counts and state transitions. Each item reads the cached machine state    │
  │    to determine its output, creating coordinated behavior across 50+ items.            │
  │                                                                                        │
  │  * Maintenance Timers -- Items calculate overdue status by comparing current time      │
  │    against cached last-maintenance timestamps with configurable intervals (168h,       │
  │    720h, 2160h). Real OPC-UA machines expose identical data structures.                │
  │                                                                                        │
  │  * Four Sink Architecture -- Console for development, HTTP for polling clients,        │
  │    WebSocket for real-time dashboards, WebServer for hosting the dashboard itself.     │
  │    Each sink serves a different consumption pattern from the same ring buffer.         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```