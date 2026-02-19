```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        04 — YAML Configuration                       │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          The three-section structure that               │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          powers everything.                             │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   THREE TOP-LEVEL SECTIONS                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   Every DIME YAML config has exactly three sections:                                             │
│                                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐      │
│   │                          │  │                          │  │                          │      │
│   │   app:                   │  │   sources:               │  │   sinks:                 │      │
│   │     license: XXXX-XXXX   │  │     - name: my_plc      │  │     - name: my_db        │      │
│   │     ring_buffer: !!int   │  │       connector: OpcUA   │  │       connector: InfluxLP│      │
│   │       4096               │  │       scan_interval: 1000│  │       include_filter: .*  │      │
│   │     http_server_uri:     │  │       items:             │  │       exclude_filter: ""  │      │
│   │       http://*:9999      │  │         - name: Temp     │  │                          │      │
│   │     ws_server_uri:       │  │           address: ns=2  │  │                          │      │
│   │       ws://*:9998        │  │                          │  │                          │      │
│   │                          │  │                          │  │                          │      │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘      │
│                                                                                                  │
│    Global settings               Data producers              Data consumers                      │
│    License, buffer,              Connectors that READ         Connectors that WRITE               │
│    admin server URIs             from devices/protocols       to databases/APIs/files              │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   SOURCE ANATOMY                                                                                 │
│   ──────────────                                                                                 │
│                                                                                                  │
│   Every source connector follows the same structure:                                             │
│                                                                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: my_plc                      # unique name for this source                  │     │
│   │       connector: OpcUA                  # connector type (protocol)                    │     │
│   │       scan_interval: !!int 1000         # poll every 1000ms                            │     │
│   │       rbe: !!bool true                  # report by exception (changes only)           │     │
│   │       enabled: !!bool true              # set false to disable without deleting        │     │
│   │       items:                            # data points to read                          │     │
│   │         - name: Temperature             #   display name / path segment                │     │
│   │           address: ns=2;s=PLC.Temp      #   protocol-specific address                  │     │
│   │           script: lua/transform.lua     #   optional transform script                  │     │
│   │           enabled: !!bool true          #   disable individual items                   │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   SINK ANATOMY                                                                                   │
│   ────────────                                                                                   │
│                                                                                                  │
│   Every sink connector follows the same structure:                                               │
│                                                                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: my_database                 # unique name for this sink                    │     │
│   │       connector: InfluxLP               # connector type (destination)                 │     │
│   │       enabled: !!bool true              # set false to disable without deleting        │     │
│   │       include_filter: .*                # regex — which paths to accept                │     │
│   │       exclude_filter: ""                # regex — which paths to reject                │     │
│   │       address: https://influx.local     # destination address                          │     │
│   │                                                                                        │     │
│   │   Filters match against the message path: "source_name/item_name"                      │     │
│   │   include_filter runs first, then exclude_filter removes matches.                      │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   ITEM ANATOMY                                                                                   │
│   ────────────                                                                                   │
│                                                                                                  │
│   Items are the individual data points inside a source:                                          │
│                                                                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   items:                                                                               │     │
│   │     - name: Temperature                 # becomes path: "source_name/Temperature"      │     │
│   │       address: ns=2;s=PLC.Temp          # protocol-specific address on the device      │     │
│   │       script: |                         # inline Lua transform                         │     │
│   │         return msg.data * 1.8 + 32      #   convert Celsius to Fahrenheit              │     │
│   │       rbe: !!bool true                  # per-item RBE override                        │     │
│   │       enabled: !!bool true              # disable this item without removing it        │     │
│   │                                                                                        │     │
│   │   The name + source name form the message PATH used for sink filtering.                │     │
│   │   Example: source "my_plc" + item "Temperature" = path "my_plc/Temperature"            │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│                                                                                                  │
│   YAML TYPE TAGS — Values that aren't strings need type hints:                                   │
│                                                                                                  │
│       !!bool true       !!bool false       !!int 4096       !!int 1000                          │
│                                                                                                  │
│   Without tags, YAML treats everything as a string. DIME requires typed values for               │
│   booleans and integers in its configuration.                                                    │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   FILE LOADING — Single-File vs Multi-File                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   DIME reads ALL *.yaml files from the config directory and merges them:                         │
│                                                                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   Configs/                                                                             │     │
│   │   ├── main.yaml           ← loaded LAST (overrides all others)                        │     │
│   │   ├── opcua-source.yaml   ← merged into sources[]                                     │     │
│   │   ├── modbus-source.yaml  ← merged into sources[]                                     │     │
│   │   ├── influx-sink.yaml    ← merged into sinks[]                                       │     │
│   │   └── mqtt-sink.yaml      ← merged into sinks[]                                       │     │
│   │                                                                                        │     │
│   │   Merge order:                                                                         │     │
│   │     1. All *.yaml files loaded alphabetically                                          │     │
│   │     2. main.yaml loaded LAST — its values override everything                          │     │
│   │     3. Arrays (sources[], sinks[]) are concatenated, not replaced                      │     │
│   │                                                                                        │     │
│   │   YAML anchors & aliases work across files:                                            │     │
│   │     Define: &defaults { scan_interval: !!int 1000, rbe: !!bool true }                  │     │
│   │     Reuse:  <<: *defaults                                                              │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   MINIMAL WORKING EXAMPLE                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   The smallest possible config — a Script source writing to Console:                             │
│                                                                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   app:                                                                                 │     │
│   │     license: ""                             # demo mode (150 min)                      │     │
│   │     ring_buffer: !!int 4096                                                            │     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: heartbeat                                                                  │     │
│   │       connector: Script                                                                │     │
│   │       scan_interval: !!int 5000             # every 5 seconds                          │     │
│   │       items:                                                                           │     │
│   │         - name: pulse                                                                  │     │
│   │           script: return os.time()                                                     │     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: screen                                                                     │     │
│   │       connector: Console                    # prints to stdout                         │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│                                                                                                  │
│       Script source ──────────▶ Ring Buffer ──────────▶ Console sink                             │
│       (Lua: os.time())          (4096 slots)            (stdout)                                 │
│                                                                                                  │
│   Run: DIME.exe (or ./DIME run). You'll see timestamps printed every 5 seconds.                  │
│   Replace "Script" with any real connector. Replace "Console" with your database.                │
│                                                                                                  │
│                                                                                                  │
│   THE ENABLED FLAG — Disable without deleting:                                                   │
│                                                                                                  │
│       enabled: !!bool false     ← connector is skipped at startup                               │
│                                                                                                  │
│   Works on sources, sinks, AND individual items. Keep configs around for quick re-enable.        │
│                                                                                                  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
