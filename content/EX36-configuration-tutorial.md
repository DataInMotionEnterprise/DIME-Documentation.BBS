```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX36 — CONFIGURATION TUTORIAL                                          DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS TUTORIAL COVERS ──────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  A progressive walkthrough of DIME configuration — from a basic single-file PLC read     │
  │  to a full multi-source, multi-sink production pipeline with scripting, filtering,       │
  │  caching, and derived metrics. Each section builds on the previous one.                  │
  │                                                                                          │
  │  Topics: YAML anchors, message paths, include/exclude filters, item scripts, sink        │
  │  transforms, emit(), cache(), init_script, libraries, itemized reads, best practices.    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ KEY CONCEPTS ───────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  Sources — Read data from external systems (PLCs, MQTT, databases, APIs)                 │
  │  Sinks   — Write data to external systems (MQTT, databases, consoles, Ignition)          │
  │  Ring Buffer — High-performance message queue connecting sources to sinks                │
  │  Scripts — Transform data inline using Lua or Python                                     │
  │  Filters — Control which messages reach which sinks                                      │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 1: CONFIGURATION BASICS
  ════════════════════════════════════════════════════════════════════════════════════════════

  SINGLE-FILE CONFIGURATION
  ─────────────────────────

  All DIME configuration is YAML files within a configuration directory.
  The simplest approach is a single main.yaml:

       Configs/
       └── MyConfig/
           └── main.yaml

  Run:  DIME.exe --config Configs/MyConfig

  MULTI-FILE CONFIGURATION
  ────────────────────────

  For better organization, split across multiple files. All YAML files in the
  directory are loaded and merged together, with main.yaml loaded last.

       Configs/
       └── MyConfig/
           ├── main.yaml          Application settings, source/sink references
           ├── console.yaml       Console sink definition
           ├── rockwell.yaml      PLC source definition
           └── mqtt.yaml          MQTT sink definition

  Benefits:  Modularity, reusability, team collaboration, version control.

  YAML ANCHORS AND REFERENCES
  ───────────────────────────

  DIME uses anchors (&name) to define connectors and references (*name) to
  wire them into the sources/sinks arrays:

       my_connector: &my_connector             # Define with &anchor
         name: my_connector
         enabled: !!bool true
         # ... configuration ...

       sources:
         - *my_connector                       # Reference with *anchor

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 2: YOUR FIRST CONFIGURATION
  ════════════════════════════════════════════════════════════════════════════════════════════

  Read two registers from a Rockwell PLC, write to console.

  ┌─ Single File — main.yaml ────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  # Define the console sink                                                               │
  │  console: &console                                                                       │
  │    name: console                                                                         │
  │    enabled: !!bool true                                                                  │
  │    scan_interval: !!int 1000                                                             │
  │    connector: Console                                                                    │
  │                                                                                          │
  │  # Define the PLC source                                                                 │
  │  rockwell: &rockwell                                                                     │
  │    name: rockwell                                                                        │
  │    enabled: !!bool true                                                                  │
  │    scan_interval: !!int 1500                                                             │
  │    connector: EthernetIP                                                                 │
  │    type: !!int 5                             # Micro800 = 5                              │
  │    address: 192.168.111.20                                                               │
  │    path: 1,0                                 # Backplane slot 0                          │
  │    items:                                                                                │
  │      - name: Execution                       # Boolean tag                               │
  │        type: bool                                                                        │
  │        address: B3:0/3                                                                   │
  │      - name: GoodPartCount                   # Integer tag                               │
  │        type: int                                                                         │
  │        address: N7:1                                                                     │
  │                                                                                          │
  │  # Application settings                                                                  │
  │  app:                                                                                    │
  │    ring_buffer: !!int 4096                                                               │
  │    http_server_uri: http://127.0.0.1:9999/                                               │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                   │
  │                                                                                          │
  │  sinks:                                                                                  │
  │    - *console                                                                            │
  │  sources:                                                                                │
  │    - *rockwell                                                                           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Expected Output:
  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │  [console] Path: rockwell/Execution           Data: true                                 │
  │  [console] Path: rockwell/GoodPartCount       Data: 133                                  │
  │  [console] Path: rockwell/$SYSTEM/ExecutionDuration    Data: 0                           │
  │  [console] Path: rockwell/$SYSTEM/IsConnected          Data: true                        │
  │  [console] Path: rockwell/$SYSTEM/IsFaulted            Data: false                       │
  │  [console] Path: rockwell/$SYSTEM/Fault                Data: null                        │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Multi-File Equivalent:

  ┌─ console.yaml ───────────┐  ┌─ rockwell.yaml ────────────┐  ┌─ main.yaml ───────────────┐
  │                          │  │                            │  │                           │
  │  console: &console       │  │  rockwell: &rockwell       │  │  app:                     │
  │    name: console         │  │    name: rockwell          │  │    ring_buffer: !!int 4096│
  │    enabled: !!bool true  │  │    enabled: !!bool true    │  │    http_server_uri: ...   │
  │    scan_interval: 1000   │  │    scan_interval: 1500     │  │    ws_server_uri: ...     │
  │    connector: Console    │  │    connector: EthernetIP   │  │                           │
  │                          │  │    type: !!int 5           │  │  sinks:                   │
  │                          │  │    address: 192.168.111.20 │  │    - *console             │
  │                          │  │    path: 1,0               │  │                           │
  │                          │  │    items:                  │  │  sources:                 │
  │                          │  │      - name: Execution     │  │    - *rockwell            │
  │                          │  │        type: bool          │  │                           │
  │                          │  │        address: B3:0/3     │  │                           │
  │                          │  │      - name: GoodPartCount │  │                           │
  │                          │  │        type: int           │  │                           │
  │                          │  │        address: N7:1       │  │                           │
  └──────────────────────────┘  └────────────────────────────┘  └───────────────────────────┘

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 3: MESSAGE PATHS & SYSTEM MESSAGES
  ════════════════════════════════════════════════════════════════════════════════════════════

  Every message has a path:   connector_name/item_name

  Examples:
    rockwell/Execution        — Boolean value from the PLC
    rockwell/GoodPartCount    — Integer value from the PLC

  SYSTEM MESSAGES (automatic for every source):

  ┌──────────────────────────────────────────┬──────┬─────────────────────────────────────┐
  │  Path                                    │ Type │ Description                         │
  ├──────────────────────────────────────────┼──────┼─────────────────────────────────────┤
  │  connector/$SYSTEM/ExecutionDuration     │ int  │ Execution time in milliseconds      │
  │  connector/$SYSTEM/IsConnected           │ bool │ Connection status                   │
  │  connector/$SYSTEM/IsFaulted             │ bool │ Fault status                        │
  │  connector/$SYSTEM/Fault                 │ str  │ Fault message (null if none)        │
  │  connector/$SYSTEM/IsAvailable           │ bool │ Connected AND not faulted           │
  └──────────────────────────────────────────┴──────┴─────────────────────────────────────┘

  Use cases: monitoring, alerting, debugging, equipment availability.

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 4: FILTERING MESSAGES
  ════════════════════════════════════════════════════════════════════════════════════════════

  Sinks filter which messages they receive using regex against message paths.

  EXCLUDE FILTER — Block specific messages, allow everything else (most common):

  ┌─ console.yaml ───────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  console: &console                                                                       │
  │    name: console                                                                         │
  │    connector: Console                                                                    │
  │    exclude_filter:                                                                       │
  │      - rockwell/\$SYSTEM              # Exclude all rockwell system messages             │
  │                                         Note: $ must be escaped as \$ in YAML            │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  INCLUDE FILTER — Allow only matching messages, block everything else:

  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  include_filter:                                                                         │
  │    - ^rockwell/                       # Only messages from rockwell                      │
  │                                                                                          │
  │  include_filter:                      # Multiple specific patterns                       │
  │    - ^rockwell/Execution$                                                                │
  │    - ^rockwell/GoodPartCount$                                                            │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  RULES:
    * Use EITHER include_filter OR exclude_filter, not both
    * If include_filter is present, it takes precedence
    * Patterns are regular expressions matched against full message paths

  ┌──────────────────────┬───────────────────────────────────────────────────────────────────┐
  │  Filter Type         │ Behavior                                                          │
  ├──────────────────────┼───────────────────────────────────────────────────────────────────┤
  │  exclude_filter      │ Block matching paths, allow everything else (default)             │
  │  include_filter      │ Allow matching paths, block everything else                       │
  └──────────────────────┴───────────────────────────────────────────────────────────────────┘

  Common Patterns:
    /\$SYSTEM             — Exclude all system messages
    ^sensors/             — Include only sensor data
    /\$SYSTEM/IsConnected$  — Only connection status (monitoring sinks)

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 5: DATA TRANSFORMATION WITH ITEM SCRIPTS
  ════════════════════════════════════════════════════════════════════════════════════════════

  Scripts transform data BEFORE publishing to the ring buffer.
  The raw value is available as `result`. Return the transformed value.

  Example: Convert boolean to human-readable strings:

  ┌─ rockwell.yaml ──────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  items:                                                                                  │
  │    - name: Execution                                                                     │
  │      type: bool                                                                          │
  │      address: B3:0/3                                                                     │
  │      script: |                                                                           │
  │        local states = { [0]='Idle', [1]='Running' };                                     │
  │        return states[result and 1 or 0];                                                 │
  │    - name: GoodPartCount                                                                 │
  │      type: int                                                                           │
  │      address: N7:1                                                                       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Output:  rockwell/Execution = "Running" or "Idle" (instead of true/false)

  SCRIPT CONTEXT:

  ┌──────────────┬──────────────────────────────────────────────────────────────────────────┐
  │  Variable    │ Description                                                              │
  ├──────────────┼──────────────────────────────────────────────────────────────────────────┤
  │  result      │ Raw data read from device (true, 123, "hello")                           │
  │  this        │ Current item reference (this.Name, this.Address, this.Key)               │
  │  dime        │ DIME API functions (dime.cache(), dime.emit())                           │
  └──────────────┴──────────────────────────────────────────────────────────────────────────┘

  Return values:
    Return a value   — Publishes the value with the item's path
    Return nil       — Suppresses publishing (nothing sent to sinks)
    Return multiple  — Creates array data [value1, value2, ...]

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 6: SINK TRANSFORMATIONS
  ════════════════════════════════════════════════════════════════════════════════════════════

  While item scripts transform data BEFORE the ring buffer,
  sink transforms reshape messages BEFORE writing to external systems.

    Item scripts  → Run in source, affect ALL sinks
    Sink transforms → Run in sink, affect only THAT sink

  DEFAULT (no transform): sinks receive the full MessageBoxMessage object:

    {"Path":"rockwell/Execution","Data":"Running","Timestamp":1735021457454}

  For many destinations we want just the atomic value ("Running").

  ┌─ Item-Level Sink Transform (script type) ────────────────────────────────────────────────┐
  │                                                                                          │
  │  items:                                                                                  │
  │    - name: Execution                                                                     │
  │      type: bool                                                                          │
  │      address: B3:0/3                                                                     │
  │      script: |                                                                           │
  │        local states = { [0]='Idle', [1]='Running' };                                     │
  │        return states[result and 1 or 0];                                                 │
  │      sink_meta:                                                                          │
  │        transform:                                                                        │
  │          type: script                                                                    │
  │          template: Message.Data;              # Extract just the data value              │
  │    - name: GoodPartCount                                                                 │
  │      type: int                                                                           │
  │      address: N7:1                                                                       │
  │      sink_meta:                                                                          │
  │        transform:                                                                        │
  │          type: script                                                                    │
  │          template: Message.Data;                                                         │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  The sink must opt in:  use_sink_transform: !!bool true

  Output:  [console] Path: rockwell/Execution, Message: Running
           [console] Path: rockwell/GoodPartCount, Message: 133

  TRANSFORM TYPES:

  ┌──────────────┬──────────────────────────────────────────────────────────────────────────┐
  │  Type        │ Description                                                              │
  ├──────────────┼──────────────────────────────────────────────────────────────────────────┤
  │  script      │ Scriban scripting — most flexible                                        │
  │  scriban     │ Scriban templates — best for JSON/structured data                        │
  │  liquid      │ Liquid templates — Django-style syntax                                   │
  └──────────────┴──────────────────────────────────────────────────────────────────────────┘

  Template variables:  Message (object), Message.Path, Message.Data,
                       Message.Timestamp, Connector, Configuration

  Advanced Example — InfluxDB Line Protocol:

    sink_meta:
      transform:
        type: scriban
        template: |
          temperature,sensor={{ Message.Path }} value={{ Message.Data }} {{ Message.Timestamp }}000000

  Output:  temperature,sensor=plc1/temperature value=72.5 1735021457454000000

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 7: ADDING MULTIPLE SINKS
  ════════════════════════════════════════════════════════════════════════════════════════════

  DIME distributes data to multiple destinations simultaneously.

  ┌─ mqttSink.yaml ──────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  mqttSink: &mqttSink                                                                     │
  │    name: mqttSink                                                                        │
  │    connector: Mqtt                                                                       │
  │    address: mqtt.example.com                                                             │
  │    port: !!int 1883                          # 1883 standard, 8883 TLS                   │
  │    base_topic: DimeTutorial                  # Prefix for all published topics           │
  │    qos: !!int 0                              # 0=at most once, 1=at least once           │
  │    retain_publish: !!bool true               # Retain for late subscribers               │
  │    use_sink_transform: !!bool true                                                       │
  │    exclude_filter:                                                                       │
  │      - rockwell/\$SYSTEM                                                                 │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Topics published:
    DimeTutorial/rockwell/Execution       → "Idle" or "Running"
    DimeTutorial/rockwell/GoodPartCount   → 133

  ┌─ ignitionSink.yaml (SparkplugB) ─────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  ignitionSink: &ignitionSink                                                             │
  │    name: ignition                                                                        │
  │    connector: SparkplugB                                                                 │
  │    address: localhost                                                                    │
  │    port: !!int 1883                                                                      │
  │    username: admin                                                                       │
  │    password: password                                                                    │
  │    host_id: Acme                                                                         │
  │    group_id: Chicago                         # SparkplugB hierarchy:                     │
  │    node_id: Factory1                         # spBv1.0/Chicago/DDATA/Factory1/Tutorial   │
  │    device_id: DIMETutorial                                                               │
  │    reconnect_interval: !!int 15000                                                       │
  │    birth_delay: !!int 10000                                                              │
  │    use_sink_transform: !!bool true                                                       │
  │    include_filter:                                                                       │
  │      - ^rockwell/                            # Only send rockwell data to Ignition       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  sinks:                                                                                  │
  │    - *console                                                                            │
  │    - *mqttSink                                                                           │
  │    - *ignitionSink                                                                       │
  │  sources:                                                                                │
  │    - *rockwell                                                                           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW:

       PLC (rockwell)
         │
         ▼
       Ring Buffer ──┬──► Console (stdout)
                     ├──► MQTT Broker (topics)
                     └──► Ignition (SparkplugB tags)

  All three sinks receive the same data simultaneously.
  Each applies its own filters and transformations independently.

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 8: ADDING MULTIPLE SOURCES
  ════════════════════════════════════════════════════════════════════════════════════════════

  Multiple sources feed the same ring buffer.
  Example: add MQTT source for IoT sensor data alongside the PLC.

  ┌─ sharcs.yaml — MQTT Source ──────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  sharcs: &sharcs                                                                         │
  │    name: sharcs                                                                          │
  │    connector: Mqtt                                                                       │
  │    report_by_exception: !!bool true                                                      │
  │    itemized_read: !!bool false               # Process ALL received messages             │
  │    address: mqtt.example.com                                                             │
  │    port: !!int 1883                                                                      │
  │    qos: !!int 0                                                                          │
  │    scan_interval: !!int 500                                                              │
  │    items:                                                                                │
  │      - name: AllSharcs                                                                   │
  │        address: sharc/+/evt/#                # Subscribe to all SHARC events             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  MQTT Wildcards:
    +   Single-level wildcard (matches any value at that level)
    #   Multi-level wildcard (matches any number of levels)

  Examples:
    sharc/+/evt/#              — All events from all SHARCs
    sharc/08d1f953ffe4/evt/#   — All events from one specific SHARC
    sharc/+/evt/avail          — Only availability from all SHARCs

  DATA FLOW:

       PLC (rockwell) ──┐
                         ├──► Ring Buffer ──► [Console, MQTT, Ignition]
       MQTT (sharcs) ───┘

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 9: ITEMIZED vs NON-ITEMIZED READS
  ════════════════════════════════════════════════════════════════════════════════════════════

  For asynchronous sources (MQTT, UDP, HTTP webhooks), itemized_read controls
  whether ALL received messages or only MATCHING items are processed.

  NON-ITEMIZED (itemized_read: false) — Process EVERY received message:

    sharcs:
      connector: Mqtt
      itemized_read: !!bool false
      items:
        - name: AllSharcs
          address: sharc/+/evt/#           # Subscribe pattern

    sharc/08d1f953ffe4/evt/avail  ✓ Processed
    sharc/08d1f953ffe4/evt/net    ✓ Processed
    sharc/08d1f9540118/evt/avail  ✓ Processed
    factory/temperature           ✗ Not matching subscription

  ITEMIZED (itemized_read: true) — Only process EXACT matches:

    mqttSource1:
      connector: Mqtt
      itemized_read: !!bool true
      items:
        - name: subscribe1
          address: sharc/+/evt/#                 # Broad subscription (not processed)
        - name: ffe4Sensor
          address: sharc/08d1f953ffe4/evt/io/s1  # Specific topic (processed)

    sharc/08d1f953ffe4/evt/io/s1  ✓ Processed (matches ffe4Sensor)
    sharc/08d1f953ffe4/evt/avail  ✗ Ignored (no matching item)
    sharc/08d1f9540118/evt/io/s1  ✗ Ignored (no matching item)

  ┌──────────────────────────────┬────────────────┬──────────────────────────────────────────┐
  │  Use Case                    │ Setting        │ Reason                                   │
  ├──────────────────────────────┼────────────────┼──────────────────────────────────────────┤
  │  Receive all events          │ false          │ Simple pass-through                      │
  │  Filter specific topics      │ true           │ Reduce processing overhead               │
  │  Multiple subscriptions      │ true           │ Fine-grained control                     │
  │  Wildcard subscriptions      │ false          │ Get everything matching pattern          │
  └──────────────────────────────┴────────────────┴──────────────────────────────────────────┘

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 10: ADVANCED SCRIPTING TECHNIQUES
  ════════════════════════════════════════════════════════════════════════════════════════════

  SCRIPT LIFECYCLE HOOKS:

  ┌──────────────────┬──────────────────────┬────────────────────────────────────────────────┐
  │  Script Type     │ When It Runs         │ Use Case                                       │
  ├──────────────────┼──────────────────────┼────────────────────────────────────────────────┤
  │  init_script     │ Once on startup      │ Load libraries, initialize variables           │
  │  deinit_script   │ Once on shutdown     │ Clean up resources                             │
  │  enter_script    │ Before each scan     │ Pre-processing, reset counters                 │
  │  exit_script     │ After each scan      │ Post-processing, logging                       │
  │  item_script     │ For every item       │ Common transformation logic                    │
  │  script (item)   │ For specific item    │ Item-specific transformation                   │
  └──────────────────┴──────────────────────┴────────────────────────────────────────────────┘

  INIT_SCRIPT — Load libraries once at startup:

    sharcs: &sharcs
      connector: Mqtt
      init_script: |
        json = require('json');
        stringx = require('pl.stringx');

  Common libraries: json, pl.stringx (split/trim), pl.tablex, moses (functional)

  ITEM_SCRIPT — Common logic for ALL items in a source:

    sharcs: &sharcs
      connector: Mqtt
      itemized_read: !!bool false
      init_script: |
        json = require('json');
      item_script: |
        print("Received: " .. this.Key);
        return nil;                              # Don't publish to sinks

  THE EMIT() FUNCTION — Create new messages from within scripts:

    emit(path, value)

    Relative:     emit("./item_name", value)     → connector_name/item_name
    Hierarchical: emit("./a/b/c", value)         → connector_name/a/b/c
    Absolute:     emit("other/item", value)      → other/item

  ┌─ Example: Parse SHARC messages, emit structured data ────────────────────────────────────┐
  │                                                                                          │
  │  item_script: |                                                                          │
  │    local path_slugs = stringx.split(this.Key, '/');                                      │
  │    local sharc_serial = path_slugs[2];                                                   │
  │    local sharc_event = path_slugs[4];                                                    │
  │    local payload = json.decode(result).v;                                                │
  │                                                                                          │
  │    if sharc_event == "avail" then                                                        │
  │      emit("./" .. sharc_serial .. "/available", payload==true and true or false);        │
  │    elseif sharc_event == "net" then                                                      │
  │      emit("./" .. sharc_serial .. "/network/interface", payload.type);                   │
  │      emit("./" .. sharc_serial .. "/network/ip", payload.ip);                            │
  │      emit("./" .. sharc_serial .. "/network/subnet_mask", payload.mask);                 │
  │      emit("./" .. sharc_serial .. "/network/gateway", payload.gw);                       │
  │      emit("./" .. sharc_serial .. "/network/mac", payload.mac);                          │
  │    end                                                                                   │
  │    return nil;                               # Don't publish the original message        │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Input:   sharc/08d1f9540118/evt/net → {"v":{"type":"ethernet","ip":"192.168.1.100",...}}
  Output:  sharcs/08d1f9540118/network/interface = "ethernet"
           sharcs/08d1f9540118/network/ip = "192.168.1.100"
           sharcs/08d1f9540118/network/subnet_mask = "255.255.255.0"
           sharcs/08d1f9540118/network/gateway = "192.168.1.1"
           sharcs/08d1f9540118/network/mac = "08:d1:f9:54:01:18"

  CACHE() AND SET() — Store/retrieve data across scan cycles:

    cache(path, default)     — Retrieve a value from the user cache
    set(key, value)          — Store a value in the user cache

  ┌─ Cross-Connector Data Access ────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  eipSource1: &eipSource1                                                                 │
  │    connector: EthernetIP                                                                 │
  │    items:                                                                                │
  │      - name: Execution                                                                   │
  │        type: bool                                                                        │
  │        address: B3:0/3                                                                   │
  │        script: |                                                                         │
  │          local m = { [0]='Ready', [1]='Active' };                                        │
  │          return m[result and 1 or 0];                                                    │
  │                                                                                          │
  │  scriptSource1: &scriptSource1                                                           │
  │    connector: Script                                                                     │
  │    items:                                                                                │
  │      - name: ExecutionFromCache                                                          │
  │        script: |                                                                         │
  │          return cache('eipSource1/Execution', nil);   # Read from other source           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  Use cases: aggregation, state machines, derived metrics, buffering.

  WORKING WITH ARRAYS — Rolling calculations:

    scriptSource1: &scriptSource1
      connector: Script
      init_script: |
        moses = require('moses');
        sensor_array = {}
      items:
        - name: SensorMedian
          script: |
            table.insert(sensor_array, cache('mqttSource1/sensor', 0));
            sensor_array = moses.last(sensor_array, 100);  # Keep last 100
            return moses.median(sensor_array);

  Moses library: moses.median(), moses.mean(), moses.max(), moses.min(),
                 moses.last(array, n)

  EXTERNAL .NET LIBRARIES:

    init_script: |
      luanet.load_assembly("System")
      CLR = { env = luanet.import_type("System.Environment") };
    items:
      - name: MachineName
        script: return CLR.env.MachineName;

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 11: COMPLETE REAL-WORLD EXAMPLE
  ════════════════════════════════════════════════════════════════════════════════════════════

  Scenario: PLC production data + MQTT sensors → derived OEE metrics → 3 sinks.

  ┌─────────────────┐
  │  Rockwell PLC   │ Execution, PartCount, RejectCount
  │  (EthernetIP)   │──────────┐
  └─────────────────┘          │
  ┌─────────────────┐          ▼          ┌─────────────────┐
  │  MQTT Broker    │───► Ring Buffer ◄───│  Script Source  │
  │  (Sensor Data)  │      4096 slots     │  (OEE, Status,  │
  └─────────────────┘          │          │   Temp Median)  │
                          ┌────┴────┐     └─────────────────┘
                          │         │           reads cache()
                     ┌────┴───┐  ┌──┴──────┐  ┌───────────┐
                     │Console │  │  MQTT   │  │ Ignition  │
                     │(stdout)│  │ Broker  │  │  (SCADA)  │
                     └────────┘  └─────────┘  └───────────┘

  ┌─ eipSource.yaml ─────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  eipSource1: &eipSource1                                                                 │
  │    connector: EthernetIP                                                                 │
  │    type: !!int 5                                                                         │
  │    address: 192.168.111.20                                                               │
  │    path: 1,0                                                                             │
  │    scan_interval: !!int 1500                                                             │
  │    items:                                                                                │
  │      - name: Execution                                                                   │
  │        type: bool                                                                        │
  │        address: B3:0/3                                                                   │
  │        script: |                                                                         │
  │          local m = { [0]='Ready', [1]='Active' };                                        │
  │          return m[result and 1 or 0];                                                    │
  │      - name: PartCount                                                                   │
  │        type: int                                                                         │
  │        address: N7:1                                                                     │
  │      - name: RejectCount                                                                 │
  │        type: int                                                                         │
  │        address: N7:2                                                                     │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ mqttSource.yaml ────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  mqttSource1: &mqttSource1                                                               │
  │    connector: Mqtt                                                                       │
  │    itemized_read: !!bool true                                                            │
  │    address: mqtt.example.com                                                             │
  │    port: !!int 1883                                                                      │
  │    scan_interval: !!int 500                                                              │
  │    init_script: |                                                                        │
  │      json = require('json');                                                             │
  │    items:                                                                                │
  │      - name: subscribe1                                                                  │
  │        address: sensor/+/temperature                                                     │
  │      - name: TempSensor1                                                                 │
  │        address: sensor/001/temperature                                                   │
  │        script: |                                                                         │
  │          return json.decode(result).value;                                               │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ scriptSource.yaml — Derived Metrics via cache() ────────────────────────────────────────┐
  │                                                                                          │
  │  scriptSource1: &scriptSource1                                                           │
  │    connector: Script                                                                     │
  │    scan_interval: !!int 5000                                                             │
  │    init_script: |                                                                        │
  │      moses = require('moses');                                                           │
  │      temp_array = {}                                                                     │
  │    items:                                                                                │
  │      - name: OEE/Quality                     # (parts - rejects) / parts * 100           │
  │        script: |                                                                         │
  │          local parts = cache('eipSource1/PartCount', 0);                                 │
  │          local rejects = cache('eipSource1/RejectCount', 0);                             │
  │          return parts > 0 and ((parts - rejects) / parts) * 100 or 0;                    │
  │                                                                                          │
  │      - name: OEE/Availability                # 100 if connected, 0 if not                │
  │        script: |                                                                         │
  │          local connected = cache('eipSource1/$SYSTEM/IsConnected', false);               │
  │          return connected and 100 or 0;                                                  │
  │                                                                                          │
  │      - name: Temperature/Median              # Rolling median of last 20 readings        │
  │        script: |                                                                         │
  │          local temp = cache('mqttSource1/TempSensor1', 0);                               │
  │          table.insert(temp_array, temp);                                                 │
  │          temp_array = moses.last(temp_array, 20);                                        │
  │          return moses.median(temp_array);                                                │
  │                                                                                          │
  │      - name: Status/Overall                  # High-level equipment status               │
  │        script: |                                                                         │
  │          local exec = cache('eipSource1/Execution', 'Unknown');                          │
  │          local connected = cache('eipSource1/$SYSTEM/IsConnected', false);               │
  │          if not connected then return 'Disconnected';                                    │
  │          elseif exec == 'Active' then return 'Running';                                  │
  │          else return 'Idle'; end                                                         │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ Sink Files ─────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  consoleSink: &consoleSink                   # Debug output                              │
  │    connector: Console                                                                    │
  │    use_sink_transform: !!bool true                                                       │
  │    exclude_filter: [ /\$SYSTEM ]                                                         │
  │                                                                                          │
  │  mqttSink: &mqttSink                         # Cloud MQTT                                │
  │    connector: Mqtt                                                                       │
  │    address: mqtt.example.com                                                             │
  │    port: !!int 1883                                                                      │
  │    base_topic: factory/line1                                                             │
  │    qos: !!int 1                                                                          │
  │    retain_publish: !!bool true                                                           │
  │    use_sink_transform: !!bool true                                                       │
  │    exclude_filter: [ /\$SYSTEM ]                                                         │
  │                                                                                          │
  │  ignitionSink: &ignitionSink                 # SCADA (SparkplugB)                        │
  │    connector: SparkplugB                                                                 │
  │    address: localhost                                                                    │
  │    port: !!int 1883                                                                      │
  │    host_id: Factory                                                                      │
  │    group_id: Chicago                                                                     │
  │    node_id: Line1                                                                        │
  │    device_id: DIME                                                                       │
  │    use_sink_transform: !!bool true                                                       │
  │    include_filter:                                                                       │
  │      - ^eipSource1/                                                                      │
  │      - ^scriptSource1/OEE                                                                │
  │      - ^scriptSource1/Status                                                             │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    ring_buffer: !!int 4096                                                               │
  │    http_server_uri: http://127.0.0.1:9999/                                               │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                   │
  │                                                                                          │
  │  sources:                                                                                │
  │    - *eipSource1                                                                         │
  │    - *mqttSource1                                                                        │
  │    - *scriptSource1                                                                      │
  │                                                                                          │
  │  sinks:                                                                                  │
  │    - *consoleSink                                                                        │
  │    - *mqttSink                                                                           │
  │    - *ignitionSink                                                                       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ════════════════════════════════════════════════════════════════════════════════════════════
  SECTION 12: BEST PRACTICES
  ════════════════════════════════════════════════════════════════════════════════════════════

  CONFIGURATION ORGANIZATION:
    DO:   Split configs by connector type, use descriptive anchors (&rockwell_plc),
          group related connectors, version control configs, comment complex scripts.
    DON'T: Put everything in main.yaml, use generic names (&source1),
           mix unrelated connectors, commit credentials.

  PERFORMANCE TUNING:
    Fast sources (PLCs, sensors):       100–1000ms scan_interval
    Slow sources (databases, APIs):     5000–60000ms scan_interval
    Sinks:                              1000–5000ms (match or batch)
    Ring buffer: 4096 default, 8192/16384 for high throughput (must be power of 2)

  SCRIPTING BEST PRACTICES:
    DO:   Load libraries in init_script, return nil to suppress, use cache() for
          cross-connector access, handle nil defensively, test incrementally.
    DON'T: Repeat library loads per-item, perform expensive ops every scan,
           ignore error handling, use blocking operations, access undefined vars.

    Defensive coding:
      local value = cache('other_source/item', nil);
      if value == nil then return nil; end        # Don't publish if not ready
      return value * 2;

  FILTERING STRATEGY:
    Console/Debug:   exclude_filter: [ /\$SYSTEM ]
    Production:      include_filter: [ ^production/, ^sensors/ ]
    Monitoring:      include_filter: [ /\$SYSTEM/IsConnected$, /\$SYSTEM/IsFaulted$ ]

  SECURITY:
    Use TLS for MQTT (port 8883, use_tls: true), firewall admin ports (9999, 9998),
    use authentication on all protocols, rotate credentials, store secrets in
    separate git-ignored files.

  TESTING STRATEGY:
    1. Start with console sink only
    2. Add sinks one at a time
    3. Test scripts in isolation using Script source
    4. Monitor at http://localhost:9999/ and ws://localhost:9998/

  COMMON ISSUES:
    Messages not appearing → Check enabled, scan_interval, filters, $SYSTEM faults
    Script returns nil     → Check cache() path, verify dependency connector running
    High CPU               → Increase scan_interval, reduce script complexity
    Message loss           → Increase ring_buffer size, check sink scan_interval

═══════════════════════════════════════════════════════════════════════════════════════════════
```