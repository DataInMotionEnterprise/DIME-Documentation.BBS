```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX30 — CNC MACHINE SIMULATOR                                        DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Simulates a full CNC machine with state machine (IDLE/SETUP/RUNNING/FAULT), power     │
  │  consumption, temperature, vibration, and production tracking. An analytics processor  │
  │  computes moving averages, cycle detection, anomaly detection, OEE, and predictive     │
  │  maintenance scores. Test a complete monitoring pipeline without hardware.             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌───────────────────────┐
       │  machine_simulator    │ 1000ms
       │  (Script)             │ State machine: IDLE -> SETUP -> RUNNING -> IDLE
       │                       │ Outputs: Power, Temp, Vibration, Status, Fault
       └──────────┬────────────┘
                  │
       ┌──────────┴────────────┐              ┌──────────────────────────┐
       │  production_simulator │ 5000ms       │                          │
       │  (Script)             │──────────┐   │    Disruptor Ring        │
       │  Reads machine_       │          │   │    Buffer (4096)         │
       │  simulator cache      │          ├──▶│                          │
       └───────────────────────┘          │   │                          │
                                          │   └──────────┬───────────────┘
       ┌───────────────────────┐          │              │
       │  analytics_processor  │ 1000ms   │         ┌────┴─────┐
       │  (Script)             │──────────┘         │          │
       │  Power/Temp/Vibration │              ┌─────┴──┐  ┌────┴───────┐
       │  analysis, OEE calc,  │              │Console │  │ MTConnect  │
       │  predictive maint.    │              │  Sink  │  │   Agent    │
       └───────────────────────┘              └────────┘  └────────────┘

         3 SOURCES                   RING BUFFER              2 SINKS
     (machine + production       (4096 slots)            (console + MTC)
      + analytics)

  CONFIGURATION                                                           [7 files, 0 folders]
  ─────────────

  ┌─ machine_simulator.yaml ─────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  machine_simulator: &machine_simulator                                                   │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 1000                                                             │
  │    sink:                                                                                 │
  │      transform:                                                                          │
  │        type: script                                                                      │
  │        template: Message.Data                                                            │
  │    init_script: |                                                                        │
  │      MACHINE_STATE = { IDLE=0, SETUP=1, RUNNING=2, FAULT=3, MAINTENANCE=4 }              │
  │      current_state = MACHINE_STATE.IDLE                                                  │
  │      ideal_cycle_time = 15                # 15 seconds per cycle                         │
  │      power_running_mean = 35.0            # kW during cutting                            │
  │      fault_probability = 0.001            # 0.1% per second                              │
  │      quality_rate = 0.95                  # 95% good parts                               │
  │    enter_script: |                        # State machine transitions each scan          │
  │      -- IDLE: 30% chance to start SETUP                                                  │
  │      -- SETUP: immediately to RUNNING                                                    │
  │      -- RUNNING: check if cycle_time elapsed, then IDLE                                  │
  │      -- FAULT: 60% chance to resolve each scan                                           │
  │      -- Random fault: 0.1% chance per second                                             │
  │      -- Temperature: rises during RUNNING, falls otherwise                               │
  │    items:                                                                                │
  │      - name: PowerConsumption             # Ramp-up/hold/ramp-down power profile         │
  │      - name: MainMotorTemp                # Gradual temperature simulation               │
  │      - name: VibrationLevel               # Cyclic vibration + deterioration             │
  │      - name: CycleActive                  # Boolean: is machine in a cycle?              │
  │      - name: MachineStatus                # IDLE / SETUP / RUNNING / FAULT               │
  │      - name: FaultStatus                  # "NORMAL" or fault description                │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ production_simulator.yaml ──────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  production_simulator: &production_simulator                                             │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 5000              # KPIs updated every 5 seconds                 │
  │    init_script: |                                                                        │
  │      daily_production_target = 450                                                       │
  │      current_order = {                                                                   │
  │        order_id = "ORD-29385",                                                           │
  │        quantity = 1500,                                                                  │
  │        completed = 783                                                                   │
  │      }                                                                                   │
  │    items:                                                                                │
  │      - name: CycleTimeHistory             # Time-of-day variation pattern                │
  │      - name: PartCountToday               # cache("machine_simulator/parts_today")       │
  │      - name: QualityRateToday             # Derived from machine_simulator cache         │
  │      - name: ProductionProgress           # Order tracking with remaining count          │
  │      - name: DowntimeReason               # Weighted random: Tool Change, etc.           │
  │      - name: ProductionTarget             # Target vs. actual comparison                 │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ analytics.yaml (abbreviated -- full file is ~600 lines) ────────────────────────────────┐
  │                                                                                          │
  │  analytics_processor: &analytics_processor                                               │
  │    name: analytics                                                                       │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 1000                                                             │
  │    init_script: |                         # ~230 lines of utility functions              │
  │      MOVING_AVG_WINDOW = 10               # Smoothing window size                        │
  │      CYCLE_THRESHOLD = 25.0               # Power threshold for cycle detection          │
  │      ANOMALY_THRESHOLD = 3.0              # Std deviations for anomaly flag              │
  │      -- Utility functions:                                                               │
  │      --   calculate_moving_average(values)                                               │
  │      --   calculate_stddev(values, avg)                                                  │
  │      --   process_cycle_detection(power, timestamp, history)                             │
  │      --   calculate_rate_of_change(values, timestamps)                                   │
  │      --   detect_trend(values, timestamps)    -- linear regression                       │
  │      --   calculate_oee()                     -- Availability x Perf x Quality           │
  │    enter_script: |                        # Periodic OEE recalculation                   │
  │      -- Every 5 minutes: emit OEE/Availability, OEE/Performance, etc.                    │
  │    exit_script: |                         # Alert detection                              │
  │      -- Emit Alerts/HighTemperature if temp > 85                                         │
  │      -- Emit Alerts/HighVibration if vibration > 25                                      │
  │    items:                                                                                │
  │      - name: PowerAnalysis                # Moving avg, trend, cycle detection           │
  │      - name: TemperatureAnalysis          # Heating/cooling rate, temp bands             │
  │      - name: VibrationAnalysis            # Frequency band decomposition                 │
  │      - name: MachineHealthStatus          # Composite health score 0-100                 │
  │      - name: OEEDashboard                 # Availability/Performance/Quality             │
  │      - name: PredictiveMaintenance        # Wear index, days until maintenance           │
  │      - name: AnomalyDetection             # Active anomaly summary                       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                      │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *machine_simulator                                                                  │
  │    - *production_simulator                                                               │
  │    - *analytics_processor                                                                │
  │  sinks:                                                                                  │
  │    - *console                                                                            │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * State Machine Simulation -- The machine_simulator enter_script implements a full    │
  │    state machine with probabilistic transitions. The set("./current_state", value)     │
  │    pattern persists state between scans. Other sources read it via cache().            │
  │                                                                                        │
  │  * Analytics Pipeline -- The analytics source reads machine_simulator data through     │
  │    the cache, computes moving averages, detects power cycles using threshold           │
  │    crossing, and runs linear regression for trend detection. All in embedded Lua.      │
  │                                                                                        │
  │  * emit() for Multiple Observations -- The analytics source uses emit('./PowerTrend',  │
  │    trend) to publish derived metrics as separate items. The enter_script uses emit()   │
  │    for periodic OEE calculations. The exit_script uses emit() for alert conditions.    │
  │                                                                                        │
  │  * Cross-Source Dependencies -- production_simulator reads machine_simulator cache     │
  │    for part counts and state. analytics reads both for comprehensive analysis. This    │
  │    three-source pipeline demonstrates DIME's data combination pattern.                 │
  │                                                                                        │
  │  * Predictive Maintenance -- The wear index combines vibration band analysis,          │
  │    temperature, and power anomaly counts to estimate days until maintenance. A         │
  │    simple but illustrative ML-adjacent pattern using pure Lua.                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```