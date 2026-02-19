```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        12 — PLC to Dashboard                          │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          End-to-end walkthrough.                        │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          From OPC-UA to live charts.                    │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SCENARIO                                                                                       │
│   ────────                                                                                       │
│                                                                                                  │
│   Read Temperature and Pressure from an OPC-UA PLC.                                              │
│   Display values on a live web dashboard via WebSocket.                                          │
│   Store history in InfluxDB for trending and alerting.                                           │
│   Print to console while debugging.                                                              │
│                                                                                                  │
│   Five steps.  One YAML file.  Zero code.                                                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STEP 1 — OPC-UA Source                                                                         │
│   ──────────────────────                                                                         │
│                                                                                                  │
│   Connect to the PLC and read two data points every second:                                      │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: plc1                                                                       │     │
│   │       connector: OpcUa                                                                 │     │
│   │       address: opc.tcp://192.168.1.10:4840                                             │     │
│   │       scan_interval: !!int 1000          # poll every 1000ms                           │     │
│   │       items:                                                                           │     │
│   │         - name: Temperature                                                            │     │
│   │           address: ns=2;s=PLC.Temp       # OPC-UA node ID                              │     │
│   │         - name: Pressure                                                               │     │
│   │           address: ns=2;s=PLC.Pressure   # OPC-UA node ID                              │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   Paths created:  plc1/Temperature  and  plc1/Pressure                                           │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STEP 2 — Lua Transform (Unit Conversion)                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   Convert Celsius to Fahrenheit inline on the Temperature item:                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │         - name: Temperature                                                            │     │
│   │           address: ns=2;s=PLC.Temp                                                     │     │
│   │           script: |                                                                    │     │
│   │             local data = from_json(result)                                             │     │
│   │             return data.Value * 1.8 + 32   -- Celsius to Fahrenheit                    │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   The script runs on every poll.  "result" is the raw OPC-UA JSON response.                      │
│   The returned value replaces the original in the ring buffer.                                   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STEP 3 — InfluxDB Sink (Historian)                                                             │
│   ──────────────────────────────────                                                             │
│                                                                                                  │
│   Store all PLC data in InfluxDB using line protocol:                                            │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: historian                                                                  │     │
│   │       connector: InfluxLP                                                              │     │
│   │       url: http://influx.local:8086                                                    │     │
│   │       bucket: factory                                                                  │     │
│   │       org: myorg                                                                       │     │
│   │       token: my-token-here                                                             │     │
│   │       include_filter: "plc1/.*"          # only data from plc1                         │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   InfluxLP writes native line protocol.  No transformation needed.                               │
│   Tags are derived from the message path: measurement = source, field = item.                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STEP 4 — WebSocket Sink (Live Dashboard)                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   Push real-time values to a browser-based dashboard:                                            │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │     - name: dashboard                                                                  │     │
│   │       connector: WebSocketServer                                                       │     │
│   │       port: !!int 8092                                                                 │     │
│   │       include_filter: "plc1/.*"          # same filter as historian                    │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   Any WebSocket client on ws://localhost:8092 receives JSON messages in real time.               │
│   Connect a chart library (Grafana, custom JS) and you have a live dashboard.                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STEP 5 — Console Sink (Debugging)                                                              │
│   ─────────────────────────────────                                                              │
│                                                                                                  │
│   Print everything to stdout while developing:                                                   │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │     - name: debug                                                                      │     │
│   │       connector: Console                                                               │     │
│   │       enabled: !!bool true               # flip to false when done debugging           │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   No filter = receives ALL messages.  Disable with enabled: !!bool false.                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   COMPLETE DATA FLOW                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌───────────────┐       ┌───────────────┐       ┌────────────────────────────────────────┐     │
│   │               │       │               │       │                                        │     │
│   │   OPC-UA PLC  │       │  Ring Buffer  │       │  ┌─────────────┐  historian            │     │
│   │               │       │               │       │  │  InfluxDB   │  (InfluxLP sink)      │     │
│   │  Temperature ─┼──────▶│  plc1/Temp ───┼──────▶│  └─────────────┘                       │     │
│   │  (+ Lua: C→F) │       │               │       │                                        │     │
│   │               │       │               │       │  ┌─────────────┐  dashboard             │    │
│   │  Pressure ────┼──────▶│  plc1/Press ──┼──────▶│  │  WebSocket  │  (WS sink :8092)       │    │
│   │               │       │               │       │  └─────────────┘                        │    │
│   │  192.168.1.10 │       │  (4096 slots) │       │                                        │     │
│   │  :4840        │       │               │       │  ┌─────────────┐  debug                 │    │
│   │               │       │               │──────▶│  │  Console    │  (stdout)              │    │
│   │               │       │               │       │  └─────────────┘                        │    │
│   │               │       │               │       │                                        │     │
│   └───────────────┘       └───────────────┘       └────────────────────────────────────────┘     │
│                                                                                                  │
│     SOURCE (1)              BUFFER                  SINKS (3)                                    │
│     Reads every 1s          Routes to all sinks     Each gets every message                      │
│                              simultaneously          Filters select what to keep                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ADDING A SECOND MACHINE                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   Copy the source block, change the name and address:                                            │
│                                                                                                  │
│   ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐     │
│   │                                          │  │                                          │     │
│   │   - name: plc1                           │  │   - name: plc2                           │     │
│   │     connector: OpcUa                     │  │     connector: OpcUa                     │     │
│   │     address: opc.tcp://192.168.1.10:4840 │  │     address: opc.tcp://192.168.1.20:4840 │     │
│   │     ...                                  │  │     ...                                  │     │
│   │                                          │  │                                          │     │
│   └──────────────────────────────────────────┘  └──────────────────────────────────────────┘     │
│                                                                                                  │
│   The sinks already use "plc1/.*" filters.  Change to "plc.*/.*" to capture both.                │
│   Or add a new sink with "plc2/.*" for separate handling.                                        │
│                                                                                                  │
│   50 machines?  50 source blocks.  Same sinks.  Same YAML file.                                  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
