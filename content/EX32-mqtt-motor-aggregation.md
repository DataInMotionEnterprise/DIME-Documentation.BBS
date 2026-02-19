```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX32 — MQTT MOTOR AGGREGATION                                       DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Demonstrates multi-instance MQTT sourcing, Lua JSON aggregation, and cross-connector  │
  │  cache patterns. ChicagoPlant reads five MQTT topics from IoT sensors (amperage, RPM,  │
  │  temperature, vibration, belt speed) and aggregates them into a single Motor object.   │
  │  DetroitPlant mirrors Chicago data via cache, demonstrating cross-plant data sharing.  │
  │  Output to Console, HTTP, MQTT, and optional Redis.                                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌──────────────────────┐   MQTT topics from IoT sensors
       │  ChicagoPlant (MQTT)  │   sharc/08d1f9540058/evt/io/s3  (Amperage)
       │  wss.sharc.tech:1883  │   sharc/08d1f953ffe4/evt/io/s1  (Rpm)
       │                       │   sharc/48e7290b118c/.../temp    (Temperature)
       │  JSON decode + cache  │   sharc/48e7290b118c/.../Xhz     (Vibration)
       │  then aggregate into  │   sharc/08d1f9540b8c/evt/io/s3  (BeltSpeed)
       │  WC01/Motor object    │   sharc/08d1f953fffc/.../humidity (Humidity)
       └──────────┬───────────┘
                  │
       ┌──────────┴───────────┐         ┌──────────────────────────┐
       │  DetroitPlant (Script)│         │                          │
       │  Reads ChicagoPlant   │         │   Disruptor Ring Buffer  │
       │  via cache() API:     │────────▶│   4096 slots             │
       │                       │         │                          │
       │  cache("ChicagoPlant  │         └──────────┬───────────────┘
       │    /Amperage", 0)     │                    │
       │  cache("ChicagoPlant  │           ┌────────┼──────────┐
       │    /$SYSTEM/           │           │        │          │
       │    IsConnected",false)│           ▼        ▼          ▼
       └──────────────────────┘      ┌────────┐ ┌──────┐ ┌────────┐
                                      │Console │ │ HTTP │ │  MQTT  │
         2 SOURCES                    └────────┘ └──────┘ └────────┘
     (1 MQTT + 1 Script)                             3 SINKS

  CONFIGURATION                                                          [7 files, 0 folders]
  ─────────────

  ┌─ instanceMotor1A.yaml — MQTT source (ChicagoPlant) ────────────────────────────────────┐
  │                                                                                          │
  │  instanceMotor1A: &instanceMotor1A                                                       │
  │    name: ChicagoPlant                                                                    │
  │    connector: MQTT                                                                       │
  │    address: wss.sharc.tech                                                               │
  │    port: !!int 1883                                                                      │
  │    qos: !!int 0                                                                          │
  │    itemized_read: !!bool true             # Each item has its own MQTT topic             │
  │    init_script: |                                                                        │
  │      json = require('json')               # JSON parsing library                        │
  │    items:                                                                                │
  │      - name: Amperage                                                                    │
  │        address: sharc/08d1f9540058/evt/io/s3                                             │
  │        script: |                                                                         │
  │          set(this.Name, json.decode(result).v.s3.v)   # Cache decoded value              │
  │          return nil                       # Suppress raw output (cache only)             │
  │      - name: Rpm                                                                         │
  │        address: sharc/08d1f953ffe4/evt/io/s1                                             │
  │        script: |                                                                         │
  │          set(this.Name, json.decode(result).v.s1.v)                                      │
  │          return nil                                                                      │
  │      - name: Temperature                                                                 │
  │        address: sharc/48e7290b118c/evt/io/temperature                                    │
  │        script: |                                                                         │
  │          set(this.Name, json.decode(result).v.v)                                         │
  │          return nil                                                                      │
  │      - name: Vibration                                                                   │
  │        address: sharc/48e7290b118c/evt/io/Xhz                                            │
  │        script: |                                                                         │
  │          set(this.Name, json.decode(result).v.v)                                         │
  │          return nil                                                                      │
  │      - name: BeltSpeed                                                                   │
  │        address: sharc/08d1f9540b8c/evt/io/s3                                             │
  │        script: |                                                                         │
  │          set(this.Name, json.decode(result).v.s3.v)                                      │
  │          return nil                                                                      │
  │      - name: WC01/Motor                   # Aggregation item                             │
  │        address: ~                         # No MQTT topic -- cache-driven                │
  │        script: |                                                                         │
  │          local motor = {                                                                 │
  │            name = "WC01-Motor",                                                          │
  │            amperage = cache("Amperage", 0),                                              │
  │            rpm = cache("Rpm", 0),                                                        │
  │            temperature = cache("Temperature", 0),                                        │
  │            vibration = cache("Vibration", 0),                                            │
  │            belt_speed = cache("BeltSpeed", 0)                                            │
  │          }                                                                               │
  │          return motor                                                                    │
  │      - name: Humidity                                                                    │
  │        address: sharc/08d1f953fffc/evt/io/humidity                                       │
  │        script: |                                                                         │
  │          return json.decode(result).v.v   # Direct return (no cache)                     │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ instanceMotor1B.yaml — Script source (DetroitPlant) ──────────────────────────────────┐
  │                                                                                          │
  │  instanceMotor1B: &instanceMotor1B                                                       │
  │    name: DetroitPlant                                                                    │
  │    connector: Script                      # Pure cache consumer -- no hardware           │
  │    rbe: !!bool true                                                                      │
  │    init_script: |                                                                        │
  │      json = require('json')                                                              │
  │    items:                                                                                │
  │      - name: WC02/Motor                   # Mirrors Chicago motor data                   │
  │        script: |                                                                         │
  │          local motor = {                                                                 │
  │            name = "WC02-Motor",                                                          │
  │            available = cache("ChicagoPlant/$SYSTEM/IsConnected", false),                  │
  │            amperage = cache("ChicagoPlant/Amperage", 0),                                 │
  │            rpm = cache("ChicagoPlant/Rpm", 0),                                           │
  │            temperature = cache("ChicagoPlant/Temperature", 0),                           │
  │            vibration = cache("ChicagoPlant/Vibration", 0),                               │
  │            belt_speed = cache("ChicagoPlant/BeltSpeed", 0),                              │
  │          }                                                                               │
  │          return motor                                                                    │
  │      - name: Humidity                                                                    │
  │        script: |                                                                         │
  │          return cache("ChicagoPlant/Humidity", 0)                                        │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ Sink files ────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  consoleSink1: &consoleSink1              # Debug output                                 │
  │    connector: Console                                                                    │
  │                                                                                          │
  │  httpServerSink1: &httpServerSink1        # REST API                                     │
  │    connector: HTTPServer                                                                 │
  │    uri: http://localhost:8080/                                                           │
  │                                                                                          │
  │  mqttSink1: &mqttSink1                    # Republish aggregated data                    │
  │    connector: MQTT                                                                       │
  │    base_topic: MqttMotors                                                                │
  │    retain: !!bool true                                                                   │
  │    include_filter:                        # Only publish plant data                      │
  │      - DetroitPlant                                                                      │
  │      - ChicagoPlant                                                                      │
  │                                                                                          │
  │  redisSink1: &redisSink1                  # Optional Redis sink                          │
  │    connector: Redis                                                                      │
  │    address: 172.24.56.104:6379                                                           │
  │    include_filter:                                                                       │
  │      - DetroitPlant                       # Only Detroit data to Redis                   │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ─────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *instanceMotor1A                     # ChicagoPlant MQTT                            │
  │    - *instanceMotor1B                     # DetroitPlant Script                          │
  │  sinks:                                                                                  │
  │    - *consoleSink1                                                                       │
  │    - *httpServerSink1                                                                    │
  │    - *mqttSink1                                                                          │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Cache-Then-Aggregate Pattern -- Individual MQTT items decode JSON and cache via      │
  │    set(this.Name, value), returning nil to suppress raw output. A separate              │
  │    aggregation item reads all cached values and returns a composite object. This        │
  │    pattern decouples arrival timing from the aggregation schedule.                     │
  │                                                                                        │
  │  * address: ~ for Cache-Only Items -- The WC01/Motor item has no MQTT topic            │
  │    (address: ~). It runs every scan_interval purely to read cached values and          │
  │    build the aggregate. This is the standard DIME pattern for data combination.        │
  │                                                                                        │
  │  * Cross-Connector System State -- DetroitPlant reads ChicagoPlant/$SYSTEM/            │
  │    IsConnected to check if the remote MQTT connection is alive. Every connector        │
  │    publishes $SYSTEM items that other connectors can query through cache().             │
  │                                                                                        │
  │  * include_filter for Selective Routing -- The MQTT sink only publishes items           │
  │    matching "DetroitPlant" or "ChicagoPlant". The Redis sink only gets Detroit         │
  │    data. Filters route different data slices to different sinks from one ring buffer.  │
  │                                                                                        │
  │  * JSON Decode Patterns -- IoT sensors publish nested JSON like {v:{s3:{v:42}}}.       │
  │    The json.decode(result).v.s3.v chain navigates the structure. Different sensor      │
  │    payloads use different paths (v.s3.v, v.s1.v, v.v) -- Lua handles each in the      │
  │    item script.                                                                        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```