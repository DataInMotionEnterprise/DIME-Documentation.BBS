```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX09 — FANUC ROBOT                                                     DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Connect to a Fanuc industrial robot over Ethernet. Reads joint positions, cartesian   │
  │  coordinates, program state, string registers, and system variables. Lua scripts        │
  │  derive an execution state machine (ACTIVE/READY/STOPPED) from digital I/O signals.    │
  │  Multi-file YAML with JSON library for structured data extraction.                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────────┐
      │   Fanuc Robot Source       │
      │   (10.1.1.200)             │        ┌──────────────────┐
      │                            │        │  Console Sink     │  stdout
      │  Digital I/O:              │        │                   │
      │  · UO.0 (SysReady)        │   ┌───▶│  exclude_filter:  │
      │  · UO.1 (PgmRun)          │   │    │  fanuc1/$SYSTEM   │
      │  · UO.2 (PgmPause)        │   │    └──────────────────┘
      │  Derived: Execution state  │   │
      │                            │   │
      │  Position Registers:       │   │
      │  · CartesianPosition.X     ├───┘
      │  · JointsPosition.J1       │
      │                            │
      │  System Variables:         │
      │  · $MOR_GRP[1].$cur_prog   │
      │  · $MOR_GRP[1].$line_off   │
      │  · $MOR_GRP[1].$CUR_DIS    │
      │                            │
      │  World Position:           │
      │  · worldCartesianPos.X     │
      │  · worldJointPosition.J1   │
      │                            │
      │  scan: 1000ms  RBE: true   │
      └───────────────────────────┘
             SOURCE                        RING BUFFER            SINK
       (Fanuc SRTP protocol)             (4096 slots)        (1 destination)

  CONFIGURATION — 3 files                                                         [multi-file]
  ───────────────────────

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                     # Console output                     │
  │  sources:                                                                              │
  │    - *fanuc1                                      # Fanuc robot connection             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── fanuc1.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  fanuc1: &fanuc1                                                                       │
  │    name: fanuc1                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                      # Read robot every 1 second          │
  │    connector: FanucRobot                          # Fanuc SRTP connector               │
  │    rbe: !!bool true                               # Only publish changes               │
  │    address: 10.1.1.200                            # Robot IP address                   │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: Message.Data                     # Extract data value only            │
  │    init_script: |                                                                      │
  │      json = require('json');                      # Load JSON library                  │
  │    items:                                                                              │
  │      # --- Digital I/O → Cache (return nil = no publish) ---                           │
  │      - name: UO0                                                                       │
  │        address: UO.0                              # User Output bit 0                  │
  │        script: |                                                                       │
  │          set('./SysReady', result);                                                    │
  │          return nil;                              # Cache only, don't publish          │
  │      - name: UO1                                                                       │
  │        address: UO.1                                                                   │
  │        script: |                                                                       │
  │          set('./PgmRun', result);                                                      │
  │          return nil;                                                                   │
  │      - name: UO2                                                                       │
  │        address: UO.2                                                                   │
  │        script: |                                                                       │
  │          set('./PgmPause', result);                                                    │
  │          return nil;                                                                   │
  │      # --- Derived execution state from cached I/O ---                                 │
  │      - name: Execution                                                                 │
  │        script: |                                                                       │
  │          local ready = cache('./SysReady', 0);                                         │
  │          local run = cache('./PgmRun', 0);                                             │
  │          local pause = cache('./PgmPause', 0);                                         │
  │          if ready == 1 then                                                            │
  │            if run == 1 and pause == 0 then                                             │
  │              return "ACTIVE";                                                          │
  │            elseif run == 1 and pause == 1 then                                         │
  │              return "OPTIONAL_STOP";                                                   │
  │            else                                                                        │
  │              return "READY";                                                           │
  │            end                                                                         │
  │          else                                                                          │
  │            return "STOPPED";                                                           │
  │          end                                                                           │
  │      # --- Position registers ---                                                      │
  │      - name: XPos                                                                      │
  │        enabled: !!bool true                                                            │
  │        address: PositionRegisters.1               # Position register 1                │
  │        script: |                                                                       │
  │          return result.CartesianPosition.X;       # Extract X from struct              │
  │      - name: J1Pos                                                                     │
  │        enabled: !!bool true                                                            │
  │        address: PositionRegisters.1                                                    │
  │        script: |                                                                       │
  │          return result.JointsPosition.J1;         # Extract J1 from struct             │
  │      # --- Direct I/O reads ---                                                        │
  │      - name: SystemReady                                                               │
  │        address: UO.2                                                                   │
  │      - name: ProgramRunning                                                            │
  │        address: UO.3                                                                   │
  │      - name: ProgramPaused                                                             │
  │        address: UO.4                                                                   │
  │      # --- Registers and system variables ---                                          │
  │      - name: ProgramName                                                               │
  │        address: StringRegisters.1                 # String register 1                  │
  │      - name: ProgramId                                                                 │
  │        address: StringSystemVariables.$MOR_GRP[1].$cur_prog_id                         │
  │      - name: ProgramLineNumber                                                         │
  │        address: IntegerSystemVariables.$MOR_GRP[1].$line_offset                        │
  │      - name: J1Torque                                                                  │
  │        address: IntegerSystemVariables.$MOR_GRP[1].$CUR_DIS_TRQ[1]                    │
  │      # --- World coordinate reads ---                                                  │
  │      - name: XPosition                                                                 │
  │        address: worldCartesianPosition.X                                               │
  │      - name: J1Position                                                                │
  │        address: worldJointPosition.J1                                                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true                # Use source's transform template    │
  │    exclude_filter:                                                                     │
  │      - fanuc1/$SYSTEM                             # Hide system heartbeat messages     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Fanuc Address Types — The connector supports multiple register families:             │
  │    UO (User Outputs), PositionRegisters, StringRegisters, IntegerSystemVariables,      │
  │    StringSystemVariables, worldCartesianPosition, worldJointPosition. Each uses         │
  │    dot notation: UO.0, PositionRegisters.1, worldCartesianPosition.X.                  │
  │                                                                                        │
  │  * Cache-and-Derive Pattern — Raw I/O bits (UO.0-2) are cached with set() and          │
  │    return nil (suppressing direct publish). The Execution item reads cached values      │
  │    with cache() to derive a human-readable state string. This is a common pattern      │
  │    for combining multiple raw signals into a single derived value.                     │
  │                                                                                        │
  │  * Structured Results — Position registers return complex objects. Lua scripts          │
  │    extract fields: result.CartesianPosition.X, result.JointsPosition.J1.               │
  │    The script runs on the raw .NET object returned by the connector.                   │
  │                                                                                        │
  │  * System Variables — Access Fanuc internal variables with $ prefix paths like          │
  │    $MOR_GRP[1].$cur_prog_id. These give deep visibility into robot internals:          │
  │    program ID, line number, joint torques.                                             │
  │                                                                                        │
  │  * Sink Transform — template: Message.Data strips the MessageBoxMessage envelope,      │
  │    sending only the data value. use_sink_transform: true on the console applies it.    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
