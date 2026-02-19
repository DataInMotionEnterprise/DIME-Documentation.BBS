```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX06 — ETHERNET/IP (ROCKWELL)                                          DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Multi-source to multi-sink integration. Reads Allen-Bradley PLC data via EtherNet/IP  │
  │  (CIP protocol) and SHARC IoT sensor data via MQTT, then publishes to Console, MQTT    │
  │  broker, and Ignition SCADA via Sparkplug B. Demonstrates multi-source data fusion,    │
  │  sink transforms, Lua JSON parsing, the emit() API, and include/exclude filtering.     │
  │  Multi-file YAML config with six files.                                                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────────┐           ┌──────────────────┐
      │   EtherNet/IP Source      │      ┌───▶│  Console Sink    │  stdout
      │   (rockwell)              │      │    └──────────────────┘
      │                           │      │
      │   PLC:  MicroLogix        │      │    ┌──────────────────┐
      │   addr: 192.168.111.20    ├──────┼───▶│  MQTT Sink       │  wss.sharc.tech:1883
      │   path: 1,0               │      │    │  (mqttSink)      │
      │                           │      │    └──────────────────┘
      │   Items:                  │      │
      │   · Execution  B3:0/3     │      │    ┌──────────────────┐
      │   · GoodPartCount N7:1    │      └───▶│  Sparkplug B     │  localhost:1883
      └───────────────────────────┘           │  (ignition)      │
                                              └──────────────────┘
      ┌───────────────────────────┐                     │
      │   MQTT Source             │                     │
      │   (sharcs)                ├─────────────────────┘
      │                           │
      │   broker: wss.sharc.tech  │
      │   topic:  sharc/+/evt/#   │
      │                           │
      │   Items:                  │
      │   · AllSharcs (wildcard)  │
      │   · emit() per serial #   │
      └───────────────────────────┘
          2 SOURCES                       RING BUFFER             3 SINKS
    (EtherNet/IP + MQTT)               (4096 slots)        (Console+MQTT+SpB)

  CONFIGURATION — 6 files                                                     [multi-file]
  ───────────────────────

  ── rockwell.yaml ─────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  rockwell: &rockwell                                                                   │
  │    name: rockwell                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1500                     # Poll every 1.5 seconds              │
  │    connector: EthernetIP                         # Allen-Bradley CIP protocol          │
  │    type: micrologix                              # PLC type: micrologix, logix, etc.   │
  │    address: 192.168.111.20                       # PLC IP address                      │
  │    path: 1,0                                     # CIP routing path (backplane,slot)   │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: Message.Data;                   # Sink transform: extract Data only   │
  │    items:                                                                              │
  │      - name: Execution                                                                 │
  │        type: bool                                                                      │
  │        address: B3:0/3                           # Bit file B3, word 0, bit 3          │
  │        script: |                                                                       │
  │          local states = { [0]='Idle', [1]='Running' };                                 │
  │          return states[result and 1 or 0];       # Map bool to string                  │
  │      - name: GoodPartCount                                                             │
  │        type: int                                                                       │
  │        address: N7:1                             # Integer file N7, element 1          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── sharcs.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  sharcs: &sharcs                                                                       │
  │    name: sharcs                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 500                                                            │
  │    connector: MQTT                               # MQTT subscriber source              │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                   # Event-driven, not polled            │
  │    address: wss.sharc.tech                       # MQTT broker hostname                │
  │    port: !!int 1883                                                                    │
  │    qos: !!int 0                                  # QoS 0: at most once                 │
  │    init_script: |                                                                      │
  │      json = require('json');                     # Load JSON parser                    │
  │      stringx = require('pl.stringx');            # Load Penlight string utils          │
  │    item_script: |                                # Runs for every incoming message     │
  │      local path_slugs = stringx.split(this.Key, '/');                                  │
  │      local sharc_serial = path_slugs[2];                                               │
  │      local sharc_event = path_slugs[4];                                                │
  │      local payload = json.decode(result).v;                                            │
  │      if sharc_event == "avail" then                                                    │
  │        emit("./" .. sharc_serial .. "/available", payload==true and true or false);    │
  │      elseif sharc_event == "net" then                                                  │
  │        emit("./" .. sharc_serial .. "/network/interface", payload.type);               │
  │        emit("./" .. sharc_serial .. "/network/ip", payload.ip);                        │
  │        emit("./" .. sharc_serial .. "/network/subnet_mask", payload.mask);             │
  │        emit("./" .. sharc_serial .. "/network/gateway", payload.gw);                   │
  │        emit("./" .. sharc_serial .. "/network/mac", payload.mac);                      │
  │      end                                                                               │
  │      return nil;                                 # emit() handles output               │
  │    items:                                                                              │
  │      - name: AllSharcs                                                                 │
  │        enabled: !!bool true                                                            │
  │        address: sharc/+/evt/#                    # MQTT wildcard subscription          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true               # Apply source sink transform         │
  │    exclude_filter:                                                                     │
  │      - rockwell/$SYSTEM                          # Suppress rockwell system msgs       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── mqttSink.yaml ─────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mqttSink: &mqttSink                                                                   │
  │    name: mqttSink                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MQTT                               # MQTT publisher sink                 │
  │    address: wss.sharc.tech                       # Broker hostname                     │
  │    port: !!int 1883                                                                    │
  │    base_topic: DimeTutorial                      # Topic prefix for all items          │
  │    qos: !!int 0                                                                        │
  │    retain: !!bool true                           # Retain last message on broker       │
  │    use_sink_transform: !!bool true                                                     │
  │    exclude_filter:                                                                     │
  │      - rockwell/$SYSTEM                          # Suppress system messages            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── ignitionSink.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  ignitionSink: &ignitionSink                                                           │
  │    name: ignition                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: SparkplugB                         # Sparkplug B for Ignition SCADA      │
  │    address: localhost                             # MQTT broker for Sparkplug          │
  │    port: !!int 1883                                                                    │
  │    username: user                                                                      │
  │    password: password                                                                  │
  │    host_id: Acme                                 # Sparkplug host application ID       │
  │    group_id: Chicago                             # Sparkplug group (e.g., plant)       │
  │    node_id: Factory1                             # Sparkplug edge node (e.g., line)    │
  │    device_id: DIMETutorial                       # Sparkplug device name               │
  │    reconnect_interval: !!int 15000               # Reconnect delay (ms)                │
  │    birth_delay: !!int 10000                      # Delay before birth certificate      │
  │    include_filter:                               # Only send PLC + sensor data         │
  │      - rockwell                                                                        │
  │      - sharcs                                                                          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *console                                                                          │
  │    - *mqttSink                                                                         │
  │    - *ignitionSink                                                                     │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *rockwell                                                                         │
  │    - *sharcs                                                                           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • EtherNet/IP Connector — DIME's EthernetIP connector uses CIP (Common Industrial     │
  │    Protocol) to read Allen-Bradley PLCs. The type field selects the PLC family         │
  │    (micrologix, logix, etc.) and path sets the CIP routing (backplane, slot).          │
  │                                                                                        │
  │  • AB Address Notation — MicroLogix uses file-based addressing: B3:0/3 = bit file 3,   │
  │    word 0, bit 3. N7:1 = integer file 7, element 1. CompactLogix/ControlLogix uses     │
  │    tag-based addressing instead (e.g., Program:Main.MyTag).                            │
  │                                                                                        │
  │  • emit() API — The SHARC source uses emit("./path", value) to publish multiple        │
  │    observations from a single incoming MQTT message. Each emit() creates a separate    │
  │    ring buffer entry. Return nil after emit() to suppress the default output.          │
  │                                                                                        │
  │  • Sink Transform — The rockwell source defines a sink transform (Message.Data) that   │
  │    extracts just the data payload. Sinks with use_sink_transform: true apply this      │
  │    transform; others receive the full MessageBoxMessage envelope.                      │
  │                                                                                        │
  │  • Sparkplug B — The SparkplugB sink publishes to Ignition SCADA using the Sparkplug   │
  │    B specification over MQTT. It manages birth/death certificates and uses             │
  │    host_id/group_id/node_id/device_id for the topic namespace hierarchy.               │
  │                                                                                        │
  │  • include_filter — The Ignition sink uses include_filter: [rockwell, sharcs] to       │
  │    receive only PLC and sensor data. Without it, admin and system messages would       │
  │    pollute the SCADA tag tree.                                                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
