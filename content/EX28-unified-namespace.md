```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX28 — UNIFIED NAMESPACE (UNS)                                       DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Demonstrates Industry 4.0 Unified Namespace (UNS) principles using DIME. Three        │
  │  simulated sources (PLC, Robot, Sensors) publish to an MQTT broker following ISA-95    │
  │  hierarchical topics. An analytics engine computes OEE, production rate, and           │
  │  environmental health from cached data. 10-file multi-file configuration.              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌───────────────┐
       │  plc1         │  1000ms   Machine state, part counts,
       │  (Script)     │           quality rate, cycle time, temp
       └──────┬────────┘
              │         ┌─────────────────────────────┐
       ┌──────┴────────┐│                             │
       │  robot1       ││   Disruptor Ring Buffer     │    ┌──────────────────┐
       │  (Script)     ││   4096 slots                ├───▶│  unsMqtt (MQTT)  │  :1883
       │  500ms        │├─────────────────────────────┤    └──────────────────┘
       └──────┬────────┘│                             │    ┌──────────────────┐
              │         │                             ├───▶│  consoleSink     │  stdout
       ┌──────┴────────┐│                             │    └──────────────────┘
       │  envSensors   ││                             │    ┌──────────────────┐
       │  (Script)     │├─────────────────────────────┤───▶│  webHttpServer   │  :8090
       │  5000ms       ││                             │    └──────────────────┘
       └──────┬────────┘│                             │    ┌──────────────────┐
              │         │                             ├───▶│  webWsServer     │  ws:8092
       ┌──────┴────────┐│                             │    └──────────────────┘
       │analyticsEngine││                             │
       │  (Script)     ││                             │
       │  5000ms       ││                             │
       └───────────────┘└─────────────────────────────┘

         4 SOURCES              RING BUFFER                    4 SINKS
     (Lua simulation)         (4096 slots)            (MQTT + Console + Web)

  ISA-95 TOPIC HIERARCHY
  ──────────────────────

       Acme / Dallas / Assembly / plc1      / Execution
       Acme / Dallas / Assembly / plc1      / PartCount
       Acme / Dallas / Assembly / robot1    / Status
       Acme / Dallas / Assembly / robot1    / PositionX
       Acme / Dallas / Assembly / envSensors/ AmbientTemperature
       ───────┬──────────┬──────────┬─────────────┬────────────
        Enterprise     Site      Area         Device / Property

  CONFIGURATION                                                          [10 files, 1 folder]
  ─────────────

  ┌─ plc1_source.yaml ───────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  plc1: &plc1                                                                             │
  │    name: plc1                                                                            │
  │    enabled: !!bool true                                                                  │
  │    scan_interval: !!int 1000              # Poll every second                            │
  │    connector: Script                                                                     │
  │    rbe: !!bool true                                                                      │
  │    init_script: |                                                                        │
  │      math.randomseed(os.time())                                                          │
  │      machine_states = {'IDLE', 'RUNNING', 'STOPPED', 'FAULT', 'MAINTENANCE'}             │
  │      current_state_index = 2              # Start RUNNING                                │
  │      part_count = 0                                                                      │
  │      good_parts = 0                                                                      │
  │      reject_parts = 0                                                                    │
  │    items:                                                                                │
  │      - name: Execution                    # 5% chance state change each scan             │
  │        script: |                                                                         │
  │          if math.random() < 0.05 then                                                    │
  │            current_state_index = math.random(1, #machine_states)                         │
  │          end                                                                             │
  │          return machine_states[current_state_index]                                      │
  │        sink:                                                                             │
  │          transform:                                                                      │
  │            type: script                                                                  │
  │            template: Message.Data                                                        │
  │      - name: PartCount                    # Increments when RUNNING                      │
  │      - name: GoodParts                                                                   │
  │      - name: RejectParts                                                                 │
  │      - name: QualityRate                  # (good/total) * 100                           │
  │      - name: CycleTime                    # 1800ms +/- 200ms                             │
  │      - name: Temperature                  # State-dependent range                        │
  │      - name: Pressure                     # 90 +/- 5 PSI                                 │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ robot1_source.yaml ─────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  robot1: &robot1                                                                         │
  │    name: robot1                                                                          │
  │    scan_interval: !!int 500               # 2x PLC rate for smooth motion                │
  │    connector: Script                                                                     │
  │    rbe: !!bool true                                                                      │
  │    init_script: |                                                                        │
  │      robot_states = {'IDLE', 'PICKING', 'PLACING', 'MOVING', 'ERROR'}                    │
  │      position_x = 500.0                                                                  │
  │      position_y = 300.0                                                                  │
  │      position_z = 200.0                                                                  │
  │    items:                                                                                │
  │      - name: Status                       # IDLE/PICKING/PLACING/MOVING/ERROR            │
  │      - name: PositionX                    # 0-1000mm Cartesian                           │
  │      - name: PositionY                    # 0-600mm                                      │
  │      - name: PositionZ                    # 0-400mm                                      │
  │      - name: Velocity                     # mm/s, state-dependent                        │
  │      - name: Cycles                       # Completed pick-place cycles                  │
  │      - name: PicksCompleted                                                              │
  │      - name: PlacesCompleted                                                             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ sensors_source.yaml ────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  envSensors: &envSensors                                                                 │
  │    name: envSensors                                                                      │
  │    scan_interval: !!int 5000              # Environmental data changes slowly            │
  │    connector: Script                                                                     │
  │    rbe: !!bool true                                                                      │
  │    items:                                                                                │
  │      - name: AmbientTemperature           # 68-76 F drift                                │
  │      - name: RelativeHumidity             # 30-60% drift                                 │
  │      - name: AirQuality                   # Index 70-95                                  │
  │      - name: VibrationLevel               # Cross-connector: cache('plc1/Execution')     │
  │        script: |                          #   higher vibration when PLC is RUNNING       │
  │          local plc_status = cache('plc1/Execution', 'IDLE')                              │
  │          if plc_status == 'RUNNING' then                                                 │
  │            vibration = 2.0 + math.random() * 1.5                                         │
  │          else                                                                            │
  │            vibration = 0.3 + math.random() * 0.3                                         │
  │          end                                                                             │
  │          return math.floor(vibration * 100) / 100                                        │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ analytics_source.yaml ──────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  analyticsEngine: &analyticsEngine                                                       │
  │    name: analyticsEngine                                                                 │
  │    scan_interval: !!int 5000              # Compute metrics every 5s                     │
  │    connector: Script                                                                     │
  │    init_script: |                                                                        │
  │      moses = require('moses')             # Functional programming library               │
  │      oee_history = {}                                                                    │
  │    items:                                                                                │
  │      - name: OEE                          # Availability x Performance x Quality         │
  │        script: |                                                                         │
  │          local execution = cache('plc1/Execution', 'UNKNOWN')                            │
  │          local availability = (execution == 'RUNNING') and 1.0 or 0.0                    │
  │          local cycle_time = cache('plc1/CycleTime', 2000)                                │
  │          local performance = math.min(1800 / cycle_time, 1.0)                            │
  │          local quality = cache('plc1/QualityRate', 100.0) / 100.0                        │
  │          return math.floor(availability * performance * quality * 1000) / 10             │
  │      - name: ProductionRate               # Parts per minute from delta                  │
  │      - name: QualityTrend                 # "improving" / "stable" / "declining"         │
  │      - name: LineEfficiency               # Robot cycles vs PLC parts sync               │
  │      - name: EnvironmentalHealth          # Composite score from temp/humidity/air       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ uns_mqtt_sink.yaml ─────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  unsMqtt: &unsMqtt                                                                       │
  │    name: unsMqtt                                                                         │
  │    scan_interval: !!int 100               # Fast publish for real-time UNS               │
  │    connector: MQTT                                                                       │
  │    use_sink_transform: !!bool true                                                       │
  │    address: localhost                                                                    │
  │    port: !!int 1883                                                                      │
  │    base_topic: Acme/Dallas/Assembly       # ISA-95 hierarchy root                        │
  │    qos: !!int 1                           # At-least-once delivery                       │
  │    retain: !!bool true                    # Late subscribers get current state           │
  │    clean_session: !!bool true                                                            │
  │    exclude_filter:                                                                       │
  │      - plc1/\$SYSTEM                                                                     │
  │      - robot1/\$SYSTEM                                                                   │
  │      - envSensors/\$SYSTEM                                                               │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ console_sink.yaml ──────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  consoleSink: &consoleSink                                                               │
  │    name: consoleSink                                                                     │
  │    connector: Console                                                                    │
  │    use_sink_transform: !!bool true                                                       │
  │    exclude_filter:                        # Hide system messages                         │
  │      - plc1/\$SYSTEM                                                                     │
  │      - robot1/\$SYSTEM                                                                   │
  │      - envSensors/\$SYSTEM                                                               │
  │      - unsConsumer/\$SYSTEM                                                              │
  │      - unsMqtt/\$SYSTEM                                                                  │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ web_http_server.yaml / web_ws_server.yaml ──────────────────────────────────────────────┐
  │                                                                                          │
  │  webHttpServer: &webHttpServer            # Static file server                           │
  │    connector: WebServer                                                                  │
  │    uri: http://localhost:8090/                                                           │
  │    web_root: ./Configs/Examples/UNS01/web                                                │
  │                                                                                          │
  │  webWsServer: &webWsServer                # Real-time data push                          │
  │    connector: WebsocketServer                                                            │
  │    uri: ws://0.0.0.0:8092/                                                               │
  │    use_sink_transform: !!bool false                                                      │
  │    exclude_filter:                                                                       │
  │      - .*/\$SYSTEM/.*                                                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    license: DEMO-0000-0000-0000-0000-0000-0000-0000                                      │
  │    ring_buffer: !!int 4096                                                               │
  │    http_server_uri: http://127.0.0.1:9999/                                               │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                   │
  │                                                                                          │
  │  sources:                                 # Loaded last, references all anchors          │
  │    - *plc1                                                                               │
  │    - *robot1                                                                             │
  │    - *envSensors                                                                         │
  │    - *analyticsEngine                                                                    │
  │                                                                                          │
  │  sinks:                                                                                  │
  │    - *unsMqtt                                                                            │
  │    - *consoleSink                                                                        │
  │    - *webHttpServer                                                                      │
  │    - *webWsServer                                                                        │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * ISA-95 Topic Hierarchy -- The UNS uses Enterprise/Site/Area/Line/Device/Property    │
  │    as MQTT topics. The MQTT sink's base_topic sets the root; DIME appends              │
  │    sourceName/itemName automatically, forming the full hierarchy.                      │
  │                                                                                        │
  │  * Cross-Connector Caching -- The analytics engine reads PLC, robot, and sensor data   │
  │    via cache('sourceName/itemName'). No direct wiring needed; the ring buffer and      │
  │    cache system handle decoupling. Sensors read PLC state for vibration correlation.   │
  │                                                                                        │
  │  * MQTT Retain -- Setting retain: true means late-joining subscribers immediately      │
  │    receive the last published value for each topic. Essential for UNS so new clients   │
  │    see current state without waiting for the next scan cycle.                          │
  │                                                                                        │
  │  * OEE Calculation -- Availability (is machine running) x Performance (actual vs       │
  │    ideal cycle time) x Quality (good parts ratio). The moses library provides          │
  │    functional helpers like moses.last() and moses.mean() for rolling windows.          │
  │                                                                                        │
  │  * Multi-Rate Sources -- PLC at 1s, robot at 500ms, sensors at 5s. Each source         │
  │    polls at the rate appropriate for its data. The ring buffer accepts them all.       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```