```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX27 — SLIDING WINDOW ANALYTICS                                        DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Demonstrates windowed analytics using the sliding_window Lua module. A simulated      │
  │  temperature sensor feeds values into two sliding windows: one computes a 5-sample     │
  │  moving average, the other detects temperature spikes by comparing min/max deviation.  │
  │  Liquid templates format the output as structured JSON. Single-file YAML config.       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌────────────────────────────┐
      │   Script Source            │
      │   (sliding_window)         │
      │                            │       ┌──────────────────────────┐
      │   init: require            │       │  Console Sink            │
      │     ('sliding_window')     │       │                          │
      │   window1 = create(5)      │       │  use_sink_transform:     │
      │   window2 = create(5)      │       │    !!bool true           │
      │                            ├──────▶│                          │  stdout
      │   Items:                   │       │  exclude_filter:         │
      │   · Temperature            │       │    /\$SYSTEM             │
      │     (25.0 +/- 2.0)         │       │                          │
      │   · TemperatureMovingAvg   │       │  Liquid templates format │
      │     window1:average()      │       │  items as JSON payloads  │
      │   · TemperatureSpike       │       └──────────────────────────┘
      │     deviation > 3.0?       │
      │                            │
      │   scan: 1000ms             │
      └────────────────────────────┘
              SOURCE                       RING BUFFER              SINK
        (Lua sliding window)             (4096 slots)         (Console output)

  CONFIGURATION — main.yaml                                                    [single file]
  ─────────────────────────

  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  # Console sink                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true               # Apply Liquid templates              │
  │    exclude_filter:                                                                     │
  │      - /\$SYSTEM                                 # Filter system messages (regex)      │
  │                                                                                        │
  │  # Script source with sliding window                                                   │
  │  sliding_window_script: &sliding_window_script                                         │
  │    name: sliding_window                                                                │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # 1-second scan cycle                 │
  │    connector: Script                                                                   │
  │    init_script: |                                                                      │
  │      local window_module = require('sliding_window')                                   │
  │      window1 = window_module.create(5)           # 5-sample moving average window      │
  │      window2 = window_module.create(5)           # 5-sample spike detection window     │
  │    items:                                                                              │
  │      - name: Temperature                         # Simulated sensor data               │
  │        script: |                                                                       │
  │          local base_temp = 25.0                  # 25C base temperature                │
  │          local variation = 2.0                   # +/- 2C random variation             │
  │          return base_temp + (math.random() * variation * 2 - variation)                │
  │                                                                                        │
  │      - name: TemperatureMovingAvg                # Moving average over 5 samples       │
  │        enabled: !!bool true                                                            │
  │        script: |                                                                       │
  │          local temp = cache("sliding_window/Temperature", 0)                           │
  │          window1:add(temp)                       # Push value into window              │
  │          return window1:average()                # Return windowed average             │
  │        sink:                                                                           │
  │          transform:                                                                    │
  │            type: liquid                          # Liquid template engine              │
  │            template: |                                                                 │
  │              {                                                                         │
  │                "value": {{Message.Data}},                                              │
  │                "timestamp": {{Message.Timestamp}},                                     │
  │                "unit": "C"                                                             │
  │              }                                                                         │
  │                                                                                        │
  │      - name: TemperatureSpike                    # Spike detection via min/max         │
  │        enabled: !!bool true                                                            │
  │        script: |                                                                       │
  │          local temp = cache("sliding_window/Temperature", 0)                           │
  │          window2:add(temp)                                                             │
  │          local max_value = window2:max()                                               │
  │          local min_value = window2:min()                                               │
  │          local deviation = max_value - min_value                                       │
  │          local is_spike = deviation > 3.0        # Spike if range > 3C                 │
  │          return {                                                                      │
  │            is_spike = is_spike,                                                        │
  │            deviation = deviation,                                                      │
  │            max = max_value,                                                            │
  │            min = min_value                                                             │
  │          }                                                                             │
  │        sink:                                                                           │
  │          transform:                                                                    │
  │            type: liquid                          # Liquid template for spike data      │
  │            template: |                                                                 │
  │              {                                                                         │
  │                "is_spike": {{Message.Data.is_spike}},                                  │
  │                "deviation": {{Message.Data.deviation}},                                │
  │                "max": {{Message.Data.max}},                                            │
  │                "min": {{Message.Data.min}},                                            │
  │                "timestamp": {{Message.Timestamp}}                                      │
  │              }                                                                         │
  │                                                                                        │
  │  # Application configuration                                                           │
  │  app:                                                                                  │
  │    license: 0000                                                                       │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                                                          │
  │  sources:                                                                              │
  │    - *sliding_window_script                                                            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Sliding Window Module -- The sliding_window Lua module provides a circular buffer   │
  │    for time-series analytics. Create with window_module.create(size). Methods:         │
  │    add(value), average(), sum(), min(), max(), count(), full(), clear(). The window    │
  │    automatically evicts the oldest value when full.                                    │
  │                                                                                        │
  │  * Moving Average -- The TemperatureMovingAvg item reads the latest Temperature from   │
  │    the cache, pushes it into window1, and returns window1:average(). With a window     │
  │    size of 5, this smooths out noise by averaging the last 5 readings. Larger windows  │
  │    produce smoother but more delayed results.                                          │
  │                                                                                        │
  │  * Spike Detection -- The TemperatureSpike item computes max - min over the window.    │
  │    If this deviation exceeds 3.0 degrees, is_spike becomes true. This pattern detects  │
  │    sudden changes without requiring threshold comparisons on individual values.        │
  │                                                                                        │
  │  * Liquid Templates -- The sink.transform.type "liquid" enables DotLiquid templating.  │
  │    Access data with {{Message.Data}}, {{Message.Data.field}}, and                      │
  │    {{Message.Timestamp}}. Liquid is ideal for formatting structured JSON payloads.     │
  │    The Console sink enables these templates with use_sink_transform: true.             │
  │                                                                                        │
  │  * Cross-Item Cache Reads -- The cache("sliding_window/Temperature", 0) call reads     │
  │    another item's most recent value using the absolute path "sourceName/itemName".     │
  │    The second argument (0) is the default if the cache entry does not yet exist.       │
  │    Items are evaluated in order, so Temperature runs before its dependents.            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
