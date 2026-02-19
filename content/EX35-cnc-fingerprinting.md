```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX35 — CNC FINGERPRINTING                                           DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Implements CNC part identification through spindle current pattern analysis. A         │
  │  current transformer simulator generates realistic power draw profiles for 4 part      │
  │  types (aluminum bracket, steel shaft, cast iron housing, precision gear). An           │
  │  analytics processor learns fingerprints, detects cycles, and identifies parts.         │
  │  A productivity module tracks OEE, parts per hour, and identification accuracy.        │
  │  ~600 lines of embedded Lua analytics across 3 source connectors.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌───────────────────────────────┐
       │  currentTransformer (Script)   │  1000ms, rbe: false
       │                                │  Simulates 4 part types:
       │  PartA: Aluminum (10-12s)      │  - startup/running/shutdown phases
       │  PartB: Steel (23-26s)         │  - 12 pattern generators (steady,
       │  PartC: Cast Iron (36-40s)     │    ramping, pulsed, gear_cutting...)
       │  PartD: Precision (22-25s)     │  - idle between parts
       └──────────────┬────────────────┘
                      │
       ┌──────────────┴────────────────┐         ┌───────────────────┐
       │  analyticsProcessor (Script)   │  1000ms │  Disruptor Ring   │
       │                                │         │  Buffer (4096)    │
       │  Signal processing:            │────────▶│                   │
       │  - 3-sample moving average     │         └─────────┬─────────┘
       │  - Cycle detection (2.5A start,│                   │
       │    1.8A end thresholds)        │         ┌─────────┼──────────────┐
       │  - 10-segment fingerprinting   │         │         │              │
       │  - Pattern correlation (60%    │         ▼         ▼              ▼
       │    mean + 30% range + 10% std) │   ┌──────────┐ ┌──────┐ ┌────────────┐
       │  - Fingerprint library (3-cycle│   │ WebSocket│ │ Web  │ │  Console   │
       │    learning per part type)     │   │  :8092   │ │Server│ │  (opt.)    │
       └──────────────────────────────┘   └──────────┘ │:8090 │ └────────────┘
                                                         └──────┘
       ┌──────────────────────────────┐                  ┌────────────┐
       │  productivityMetrics (Script)  │  2000ms          │  CSV Sink  │
       │                                │                  │  (opt.)    │
       │  OEE = Avail x Perf x Quality │                  └────────────┘
       │  Parts per hour, part mix,     │
       │  cycle time variance,          │          3 SOURCES, 4+ SINKS
       │  identification accuracy       │
       └──────────────────────────────┘

  CONFIGURATION                                                    [10 files, 1 web/ folder]
  ─────────────

  ┌─ currentTransformer.yaml (abbreviated -- ~300 lines Lua) ──────────────────────────────┐
  │                                                                                          │
  │  currentTransformer: &currentTransformer                                                 │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 1000              # 1Hz sampling rate                            │
  │    rbe: !!bool false                      # Continuous -- every reading matters           │
  │    init_script: |                                                                        │
  │      PART_TYPES = {                       # 4 part definitions                           │
  │        { name = "PartA_Aluminum_Bracket",                                                │
  │          idle_current = 0.8,                                                             │
  │          startup_current = {min=8.0, max=12.0, duration=0.8},                            │
  │          running_phases = {                                                              │
  │            {name="rough_cut", current={min=4.5,max=6.2}, pattern="steady"},              │
  │            {name="finish_cut", current={min=2.8,max=4.1}, pattern="varying"},            │
  │            {name="drilling", current={min=5.5,max=7.8}, pattern="pulsed"}                │
  │          },                                                                              │
  │          total_cycle_time = {min=10.0, max=12.0},                                        │
  │          frequency = 0.15 },                                                             │
  │        -- PartB: Steel shaft, medium current, 23-26s                                     │
  │        -- PartC: Cast iron, high current, 36-40s                                         │
  │        -- PartD: Precision gear, complex pattern, 22-25s                                 │
  │      }                                                                                   │
  │      -- 12 pattern generators: steady, varying, ramping, pulsed, periodic,               │
  │      --   spiking, heavy_cutting, smooth, drilling_cycle, tapping,                       │
  │      --   gear_cutting, light_cut, idle                                                  │
  │    enter_script: |                        # State machine: idle -> startup ->             │
  │                                           #   running phases -> shutdown -> idle          │
  │    items:                                                                                │
  │      - name: CurrentDraw                  # rbe: false -- stream every reading           │
  │      - name: CyclePhase                   # Current operation name                       │
  │      - name: PartType                     # Active part name                             │
  │      - name: CycleProgress                # 0-100%                                       │
  │      - name: TotalPartsCompleted                                                         │
  │      - name: CurrentPartStats             # JSON with expected times, phases             │
  │      - name: PhaseTransition              # JSON on each phase change                    │
  │      - name: FingerprintSignature         # JSON: current, part, phase, timing           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ analyticsProcessor.yaml (abbreviated -- ~350 lines Lua) ──────────────────────────────┐
  │                                                                                          │
  │  analyticsProcessor: &analyticsProcessor                                                 │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 1000                                                             │
  │    rbe: !!bool true                                                                      │
  │    init_script: |                                                                        │
  │      SMOOTHING_WINDOW = 3                 # Fast-response moving average                 │
  │      CYCLE_DETECTION_THRESHOLD = 2.5      # Amps to detect cycle start                   │
  │      CYCLE_END_THRESHOLD = 1.8            # Amps to detect cycle end                     │
  │      MIN_CYCLE_DURATION = 8.0             # Minimum valid cycle (seconds)                │
  │      FINGERPRINT_SEGMENTS = 10            # Segments per fingerprint                     │
  │      SIMILARITY_THRESHOLD = 0.55          # Minimum correlation for match                │
  │      LEARNING_CYCLES = 3                  # Cycles needed before identification          │
  │                                                                                          │
  │      -- Functions: calculate_moving_average, calculate_statistics,                        │
  │      --   normalize_data, calculate_correlation, extract_fingerprint,                    │
  │      --   identify_part, compare_fingerprints (60% mean, 30% range, 10% std),           │
  │      --   update_library, calculate_average_fingerprint                                  │
  │                                                                                          │
  │    enter_script: |                        # Per-scan cycle detection                     │
  │      -- Read current from cache("currentTransformer/CurrentDraw")                        │
  │      -- Smooth with moving average                                                       │
  │      -- Detect rising edge (start) and falling edge (end)                                │
  │      -- On cycle complete: extract fingerprint, identify part, update library             │
  │                                                                                          │
  │    items:                                                                                │
  │      - name: SmoothedCurrent              # Moving-average filtered value                │
  │      - name: CycleDetected                # Boolean: currently in cycle?                 │
  │      - name: IdentifiedPart               # Best match from library                     │
  │      - name: IdentificationConfidence     # 0.0 - 1.0 correlation score                 │
  │      - name: ActualPart                   # Ground truth from simulator                  │
  │      - name: IdentificationAccuracy       # Running accuracy percentage                  │
  │      - name: CycleAnalysisResults         # JSON: duration, ID, confidence               │
  │      - name: LibraryStatus                # JSON: per-part learning progress             │
  │      - name: FingerprintData              # JSON: full fingerprint for debug             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ productivityMetrics.yaml (abbreviated -- ~250 lines Lua) ─────────────────────────────┐
  │                                                                                          │
  │  productivityMetrics: &productivityMetrics                                               │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 2000              # Metrics every 2 seconds                      │
  │    init_script: |                                                                        │
  │      IDEAL_CYCLE_TIMES = {                # Per-part baseline                            │
  │        ["PartA_Aluminum_Bracket"] = 30.0,                                                │
  │        ["PartB_Steel_Shaft"] = 73.0,                                                     │
  │        ["PartC_Cast_Iron_Housing"] = 155.0,                                              │
  │        ["PartD_Precision_Gear"] = 87.5 }                                                 │
  │    items:                                                                                │
  │      - name: TotalPartsProduced                                                          │
  │      - name: PartsPerHour                 # Total good / elapsed hours                   │
  │      - name: OverallEquipmentEffectiveness                                               │
  │      - name: Availability                 # Uptime / planned time                        │
  │      - name: Performance                  # Ideal / actual cycle time                    │
  │      - name: Quality                      # Good parts / total parts                     │
  │      - name: PartMix                      # JSON: percentage by type                     │
  │      - name: CycleTimeVariance            # JSON: mean, stddev per part                  │
  │      - name: AnomalyCount                                                                │
  │      - name: DowntimeMinutes                                                             │
  │      - name: IdentificationAccuracy       # Percentage correct                           │
  │      - name: ProductionSummary            # JSON: comprehensive shift report             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ Sink files ────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  webServerSink: &webServerSink            # Dashboard hosting                            │
  │    connector: WebServer                                                                  │
  │    uri: http://localhost:8090/                                                           │
  │    web_root: ./Configs/web                                                               │
  │    exclude_filter: [".*"]                 # Files only -- no data                        │
  │                                                                                          │
  │  websocketServerSink: &websocketServerSink                                               │
  │    connector: WebsocketServer                                                            │
  │    uri: ws://0.0.0.0:8092/                                                               │
  │    include_filter:                        # Selective real-time streaming                 │
  │      - "currentTransformer/CurrentDraw"                                                  │
  │      - "analyticsProcessor/IdentifiedPart"                                               │
  │      - "productivityMetrics/OverallEquipmentEffectiveness"                               │
  │      # ... 30+ filtered paths                                                            │
  │                                                                                          │
  │  consoleSink: &consoleSink                # Filtered console output                      │
  │    connector: Console                                                                    │
  │    include_filter:                        # Only key metrics                              │
  │      - "currentTransformer/CurrentDraw"                                                  │
  │      - "analyticsProcessor/IdentifiedPart"                                               │
  │      - "productivityMetrics/ProductionSummary"                                           │
  │                                                                                          │
  │  csvSink: &csvSink                        # Historical data recording                    │
  │    connector: CsvWriter                                                                  │
  │    file_path: ./Logs/CNCFingerprint_Data.csv                                             │
  │    max_file_size: !!int 104857600         # 100MB max                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ─────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *currentTransformer                                                                 │
  │    - *analyticsProcessor                                                                 │
  │    - *productivityMetrics                                                                │
  │  sinks:                                                                                  │
  │    - *webServerSink                                                                      │
  │    - *websocketServerSink                                                                │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Fingerprint Extraction -- Each completed cycle is divided into 10 equal time        │
  │    segments. Each segment stores mean, std deviation, min, and max current values.     │
  │    This fixed-length signature enables comparison regardless of cycle duration.        │
  │                                                                                        │
  │  * Pattern Correlation -- Fingerprints are compared using weighted similarity:         │
  │    60% mean pattern (are current levels similar?), 30% range shape (are variations     │
  │    similar?), 10% standard deviation (is noise similar?). Scores above 0.55 are       │
  │    considered matches.                                                                 │
  │                                                                                        │
  │  * Learning Library -- The system requires 3 completed cycles of a part type before    │
  │    it can identify that type. Fingerprints are averaged across samples (up to 10       │
  │    stored per type) to create robust reference patterns. The library builds             │
  │    automatically from the ground-truth labels.                                         │
  │                                                                                        │
  │  * Three-Source Pipeline -- currentTransformer generates raw data and phase info.      │
  │    analyticsProcessor reads it via cache() for signal processing and identification.   │
  │    productivityMetrics reads both for OEE calculation. Each runs at its own rate.      │
  │                                                                                        │
  │  * rbe: false for Streaming -- The current transformer disables Report By Exception    │
  │    because every sample matters for pattern analysis. Even identical consecutive        │
  │    readings are meaningful in a current waveform. Other connectors use rbe: true       │
  │    since they only output when derived metrics actually change.                        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```