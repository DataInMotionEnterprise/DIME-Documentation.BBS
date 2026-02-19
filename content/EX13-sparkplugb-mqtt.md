```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX13 — SPARKPLUGB INDUSTRIAL MQTT                                      DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  SparkplugB protocol for industrial MQTT. A SparkplugB source decodes Protobuf         │
  │  metrics from an MQTT broker, while an EthernetIP source reads Rockwell PLC data.      │
  │  The SparkplugB sink publishes birth/death certificates and metric updates to an        │
  │  Ignition SCADA gateway. An InfluxDB sink stores time-series data. Demonstrates        │
  │  the full SparkplugB lifecycle with multi-source, multi-sink industrial architecture.  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌────────────────────────┐
      │  SparkplugB Source      │          ┌───────────────────┐
      │  (MQTT + Protobuf)      │     ┌───▶│  Console Sink     │  stdout
      │                         │     │    │  exclude: rockwell│
      │  Broker: localhost:1883 │     │    │  exclude: spb/SYS │
      │  Topic: spBv1.0/...     │     │    └───────────────────┘
      │  DDATA/Factory1/DIME1   │     │
      │                         │     │    ┌───────────────────┐
      │  Lua: decode Protobuf   ├─────┼───▶│  SparkplugB Sink  │  localhost:1883
      │  metrics via emit()     │     │    │  (Ignition SCADA)  │
      │                         │     │    │  host: Acme        │
      └────────────────────────┘     │    │  group: Chicago    │
                                      │    │  node: Factory1    │
      ┌────────────────────────┐     │    └───────────────────┘
      │  EthernetIP Source      │     │
      │  (Rockwell PLC)         │     │    ┌───────────────────┐
      │                         │     └───▶│  InfluxDB Sink     │  cloud InfluxDB
      │  PLC: 192.168.111.20   ├─────┘    │  bucket: DIME      │
      │  Tags: B3:0, N7:1      │          │  exclude: rockwell│
      │  type: micrologix       │          └───────────────────┘
      │  scan: 1500ms           │
      └────────────────────────┘
           2 SOURCES                     RING BUFFER             3 SINKS
    (SparkplugB + EthernetIP)          (4096 slots)      (Console + SPB + Influx)

  CONFIGURATION — 6 files                                                         [multi-file]
  ───────────────────────

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                                                          │
  │    - *ignition                                    # SparkplugB → Ignition gateway      │
  │    - *influx                                      # Time-series → InfluxDB             │
  │  sources:                                                                              │
  │    - *spb                                         # SparkplugB MQTT source             │
  │    - *rockwell                                    # EthernetIP PLC source              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── spb.yaml ───────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  spb: &spb                                                                             │
  │    name: spb                                                                           │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: SparkplugB                          # SparkplugB source connector        │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                    # Event-driven message handling       │
  │    address: localhost                                                                  │
  │    port: !!int 1883                                                                    │
  │    username: user                                                                      │
  │    password: password                                                                  │
  │    clean_session: !!bool true                                                          │
  │    qos: !!int 0                                                                        │
  │    init_script: |                                                                      │
  │      import('System');                            # Import .NET System namespace        │
  │      json = require('json');                                                           │
  │      get_metric_value = function(metric)          # Helper: extract typed value        │
  │        local dt = Convert.ToInt32(metric.Datatype);                                    │
  │        local value = nil;                                                              │
  │        if dt == 12 then                           -- String                            │
  │          value = metric.StringValue:ToString();                                        │
  │        elseif dt == 11 then                       -- Boolean                           │
  │          value = Convert.ToBoolean(metric.BooleanValue);                               │
  │        elseif dt == 10 then                       -- Double                            │
  │          value = Convert.ToDouble(metric.DoubleValue);                                 │
  │        elseif dt == 9 then                        -- Float                             │
  │          value = Convert.ToDouble(metric.FloatValue);                                  │
  │        elseif dt == 8 or dt == 4 then             -- UInt64 / UInt16                   │
  │          value = Convert.ToInt32(metric.LongValue);                                    │
  │        elseif dt <= 7 then                        -- Int8..Int64                       │
  │          value = Convert.ToInt32(metric.IntValue);                                     │
  │        else                                                                            │
  │          value = nil;                                                                  │
  │        end                                                                             │
  │        return value;                                                                   │
  │      end                                                                               │
  │    items:                                                                              │
  │      - name: F1D1                                                                      │
  │        address: spBv1.0/Chicago/DDATA/Factory1/DIME1                                   │
  │        script: |                                                                       │
  │          result = from_json(result);              # Decode Protobuf payload            │
  │          for metric in luanet.each(result.Metrics) do;                                 │
  │            local value = get_metric_value(metric);                                     │
  │            emit("./" .. metric.Name:ToString(), value);                                │
  │          end;                                     # Each metric → individual item      │
  │          return nil;                              # Suppress raw message               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── rockwell.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  rockwell: &rockwell                                                                   │
  │    name: rockwell                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1500                      # Poll PLC every 1.5 seconds         │
  │    connector: EthernetIP                          # Allen-Bradley EthernetIP           │
  │    rbe: !!bool true                                                                    │
  │    type: micrologix                               # PLC type (micrologix/controllogix) │
  │    address: 192.168.111.20                        # PLC IP address                     │
  │    path: 1,0                                      # Backplane routing path             │
  │    log: !!int 0                                                                        │
  │    timeout: !!int 1000                            # Connection timeout (ms)            │
  │    bypass_ping: !!bool false                                                           │
  │    items:                                                                              │
  │      - name: boolToCache                                                               │
  │        type: bool                                                                      │
  │        address: B3:0/2                            # Bit-level PLC address              │
  │        script: |                                                                       │
  │          set('boolTag', result);                   # Cache for cross-item use           │
  │          return nil;                                                                   │
  │      - name: boolFromCache                                                             │
  │        script: |                                                                       │
  │          return cache('boolTag', false);           # Read cached value                  │
  │      - name: Execution                                                                 │
  │        type: bool                                                                      │
  │        address: B3:0/3                                                                 │
  │        script: |                                                                       │
  │          local m = { [0]='Ready', [1]='Active' };                                      │
  │          return m[result and 1 or 0];             # Bool → string mapping              │
  │      - name: GoodPartCount                                                             │
  │        type: int                                                                       │
  │        address: N7:1                              # Integer register                   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── ignition.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  ignition: &ignition                                                                   │
  │    name: ignition                                                                      │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: SparkplugB                          # SparkplugB sink connector          │
  │    address: localhost                                                                  │
  │    port: !!int 1883                                                                    │
  │    username: user                                                                      │
  │    password: password                                                                  │
  │    host_id: Acme                                  # SparkplugB Host Application ID     │
  │    group_id: Chicago                              # SparkplugB Group                   │
  │    node_id: Factory1                              # SparkplugB Edge Node               │
  │    device_id: DIME1                               # SparkplugB Device                  │
  │    reconnect_interval: !!int 15000                # Reconnect delay (ms)               │
  │    birth_delay: !!int 10000                       # Delay before NBIRTH (ms)           │
  │    exclude_filter:                                                                     │
  │      - rockwell/$SYSTEM                           # No PLC system messages             │
  │      - spb                                        # No SparkplugB source loopback      │
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
  │    exclude_filter:                                                                     │
  │      - rockwell                                   # Hide all PLC data on console       │
  │      - spb/$SYSTEM                                # Hide SparkplugB system messages    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── influx.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  influx: &influx                                                                       │
  │    name: influx                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: InfluxLP                            # InfluxDB Line Protocol sink        │
  │    address: https://us-east-1-1.aws.cloud2.influxdata.com                              │
  │    token: <your-influxdb-token>                   # InfluxDB API token                 │
  │    bucket_name: DIME                              # Target bucket                      │
  │    use_sink_transform: !!bool false                                                    │
  │    exclude_filter:                                                                     │
  │      - rockwell                                   # Only SparkplugB metrics to Influx  │
  │      - spb/$SYSTEM                                                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * SparkplugB Protocol — An industrial MQTT specification using Protobuf encoding.     │
  │    Topics follow: spBv1.0/{group}/DDATA/{node}/{device}. Metrics are strongly typed    │
  │    (int, float, bool, string) with datatype IDs defined by the SparkplugB spec.        │
  │                                                                                        │
  │  * Protobuf Metric Decoding — The init_script defines get_metric_value() which         │
  │    switches on metric.Datatype to extract the correct typed value. The Lua script       │
  │    accesses .NET objects directly via NLua interop (Convert.ToInt32, etc.).             │
  │                                                                                        │
  │  * emit() for Multiple Items — A single MQTT message contains multiple metrics. The    │
  │    script loops over result.Metrics and calls emit("./metricName", value) for each.    │
  │    return nil suppresses the raw message. Each metric becomes its own ring buffer       │
  │    item under the source connector's namespace.                                        │
  │                                                                                        │
  │  * Birth/Death Certificates — The SparkplugB sink (ignition) publishes NBIRTH on       │
  │    connect and NDEATH on disconnect. birth_delay gives time for metric discovery.       │
  │    host_id/group_id/node_id/device_id define the SparkplugB namespace hierarchy.       │
  │                                                                                        │
  │  * Multi-Source Filtering — Each sink uses exclude_filter to receive only relevant      │
  │    data. Console shows SparkplugB only, Ignition excludes PLC system messages and       │
  │    SparkplugB source loopback, InfluxDB stores only SparkplugB metrics.                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
