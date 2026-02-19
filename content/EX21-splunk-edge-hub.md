```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX21 — SPLUNK EDGE HUB                                                 DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Collects data from multiple industrial sources (Haas SHDR, EthernetIP PLC, Lua        │
  │  scripts) and forwards to a Splunk Edge Hub via the SplunkEhSDK connector.             │
  │  Complete single-file configuration with 3 sources and 3 sinks. Demonstrates the      │
  │  numbers_to_metrics option and complex cross-source data combination via cache.        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Haas SHDR Source       │
      │   192.168.111.221:9998  │          ┌──────────────────┐
      │   · CPU (HIGH/LOW)      │     ┌───▶│  Splunk EH SDK  │  gRPC :50051
      └────────────────────┬────┘     │    └──────────────────┘
                           │          │
      ┌────────────────────┴────┐     │    ┌──────────────────┐
      │   EthernetIP Source     ├─────┼───▶│  HTTP Server     │  http://*:8080
      │   192.168.111.20        │     │    └──────────────────┘
      │   · boolGetUserCache    │     │
      │   · Execution           │     │    ┌──────────────────┐
      │   · GoodPartCount       │     └───▶│  Console Sink   │  stdout
      └────────────────────┬────┘          └──────────────────┘
                           │
      ┌────────────────────┴────┐
      │   Script Source          │
      │   Cross-source combiner │
      │   · luaPackagePath      │
      │   · machineNameDiscrete │
      │   · dateTime            │
      │   · randomFromUserCache │
      │   · mqttSensorReading   │
      │   · OverallAvailability │
      └─────────────────────────┘
             SOURCES                        RING BUFFER              SINKS
      (Haas + PLC + Script)              (4096 slots)       (Splunk + HTTP + Console)

  CONFIGURATION — main.yaml                                                   [single file]
  ─────────────────────────

  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  haasSource1: &haasSource1                       # ── Haas CNC via SHDR protocol ──   │
  │    name: haasSource1                                                                   │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: HaasSHDR                           # Haas Serial Data Record protocol   │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                                                         │
  │    address: 192.168.111.221                                                            │
  │    port: !!int 9998                                                                    │
  │    timeout: !!int 1000                                                                 │
  │    heartbeat_interval: !!int 0                                                         │
  │    retry_interval: !!int 10000                                                         │
  │    init_script: |                                                                      │
  │      luanet.load_assembly("System")              # .NET interop for CLR types         │
  │      CLR = { env = luanet.import_type("System.Environment") };                         │
  │    items:                                                                              │
  │      - name: CPU                                                                       │
  │        address: CPU                                                                    │
  │        script: |                                                                       │
  │          local cpu = tonumber(result);                                                  │
  │          if cpu > 0.5 then return 'HIGH'; else return 'LOW'; end                       │
  │                                                                                        │
  │  eipSource1: &eipSource1                         # ── Allen-Bradley PLC ──            │
  │    name: eipSource1                                                                    │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                                                            │
  │    connector: EthernetIP                                                               │
  │    rbe: !!bool true                                                                    │
  │    type: micrologix                                                                    │
  │    address: 192.168.111.20                                                             │
  │    path: 1,0                                                                           │
  │    timeout: !!int 1000                                                                 │
  │    bypass_ping: !!bool true                                                            │
  │    items:                                                                              │
  │      - name: boolSetUserCacheOnly                                                      │
  │        type: bool                                                                      │
  │        address: B3:0/2                                                                 │
  │        script: |                                                                       │
  │          set('boolTag', result); return nil;      # Cache only, suppress publish       │
  │      - name: boolGetUserCache                                                          │
  │        script: return cache('boolTag', false);                                         │
  │      - name: Execution                                                                 │
  │        type: bool                                                                      │
  │        address: B3:0/3                                                                 │
  │        script: |                                                                       │
  │          local m = { [0]='Ready', [1]='Active' };                                      │
  │          return m[result and 1 or 0];                                                  │
  │        sink:                                                                           │
  │          mtconnect: Device[name=device1]/Controller/Path/Execution[category=Event]      │
  │      - name: GoodPartCount                                                             │
  │        type: int                                                                       │
  │        address: N7:1                                                                   │
  │                                                                                        │
  │  scriptSource1: &scriptSource1                   # ── Cross-source combiner ──        │
  │    name: scriptSource1                                                                 │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                                                            │
  │    connector: Script                                                                   │
  │    rbe: !!bool true                                                                    │
  │    init_script: |                                                                      │
  │      luanet.load_assembly("System")                                                    │
  │      CLR = { env = luanet.import_type("System.Environment") };                         │
  │      json = require('json');                     # JSON library                        │
  │      moses = require('moses');                   # Functional utility library          │
  │      pcArray = {}                                                                      │
  │    items:                                                                              │
  │      - name: luaPackagePath                      # Diagnostic: Lua search paths        │
  │        script: return package.path;                                                    │
  │      - name: machineNameDiscrete                 # .NET interop: machine name          │
  │        rbe: !!bool false                                                               │
  │        script: return CLR.env.MachineName;                                             │
  │      - name: dateTime                                                                  │
  │        script: return os.date("%Y-%m-%d %H:%M:%S");                                    │
  │      - name: randomFromUserCache                 # Cache demo: write then read         │
  │        script: return cache('random', -1);                                             │
  │      - name: mqttSensorReading                   # Cross-source: read MQTT cache       │
  │        script: return cache('mqttSource1/ffe4Sensor', 0);                              │
  │      - name: mqttSensorReadingMedian             # Running median over 100 samples     │
  │        script: |                                                                       │
  │          table.insert(pcArray, cache('mqttSource1/ffe4Sensor', 0));                    │
  │          pcArray = moses.last(pcArray, 100);                                           │
  │          return moses.median(pcArray);                                                 │
  │      - name: OverallAvailabilityRbe              # System cache: connection state      │
  │        rbe: !!bool true                                                                │
  │        script: |                                                                       │
  │          local n = cache('eipSource1/$SYSTEM/IsConnected', nil);                       │
  │          return n==true and 'Available' or 'Unavailable';                              │
  │        sink:                                                                           │
  │          mtconnect: Device[name=device1]/Availability[category=Event]                   │
  │                                                                                        │
  │  splunkEhSdkSink1: &splunkEhSdkSink1            # ── Splunk Edge Hub sink ──         │
  │    name: splunkEhSdkSink1                                                              │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: SplunkEhSDK                        # Splunk Edge Hub SDK (gRPC)         │
  │    address: http://host.docker.internal          # Docker host address                │
  │    port: !!int 50051                             # gRPC port                           │
  │    numbers_to_metrics: !!bool true               # Convert numerics to Splunk metrics │
  │                                                                                        │
  │  consoleSink1: &consoleSink1                     # ── Debug console ──                │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │                                                                                        │
  │  httpServerSink1: &httpServerSink1               # ── HTTP REST endpoint ──           │
  │    name: httpServerSink1                                                               │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: HTTPServer                                                               │
  │    uri: http://*:8080/                                                                 │
  │                                                                                        │
  │  app:                                                                                  │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://*:9999/                                                     │
  │    ws_server_uri: ws://0.0.0.0:9998/                                                   │
  │  sinks:                                                                                │
  │    - *consoleSink1                                                                     │
  │    - *httpServerSink1                                                                  │
  │    - *splunkEhSdkSink1                                                                 │
  │  sources:                                                                              │
  │    - *eipSource1                                                                       │
  │    - *haasSource1                                                                      │
  │    - *scriptSource1                                                                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • SplunkEhSDK Connector — Sends data to Splunk Edge Hub using gRPC protocol.          │
  │    The address and port point to the Edge Hub's gRPC endpoint. The                    │
  │    numbers_to_metrics: true option converts numeric values to Splunk metrics format.   │
  │                                                                                        │
  │  • Single-File Config — All anchors and the app section live in one main.yaml.         │
  │    Anchors (&name) are defined inline and referenced (*name) in the sinks/sources     │
  │    arrays at the bottom. Valid for smaller configs; multi-file is better at scale.     │
  │                                                                                        │
  │  • Cross-Source Cache — The Script source reads values from other sources using        │
  │    cache('eipSource1/Execution') and cache('mqttSource1/ffe4Sensor'). This enables    │
  │    data combination, aggregation, and derived calculations across sources.             │
  │                                                                                        │
  │  • $SYSTEM Cache — cache('eipSource1/$SYSTEM/IsConnected') reads the PLC's            │
  │    connection state from the system cache. This enables health-aware logic like        │
  │    mapping IsConnected to 'Available'/'Unavailable' MTConnect events.                  │
  │                                                                                        │
  │  • .NET Interop — The init_script uses luanet.load_assembly and luanet.import_type    │
  │    to access .NET CLR types directly from Lua (e.g., System.Environment.MachineName). │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
