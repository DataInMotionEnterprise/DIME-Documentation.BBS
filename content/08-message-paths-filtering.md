```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        08 — Filtering & Routing                       │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Control what data goes where.                  │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Regex-powered stream routing.                  │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MESSAGE PATH ANATOMY                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   Every message in DIME has a path:  sourceName/itemName                                         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   Path Format:   sourceName / itemName                                       │               │
│   │                  ──────────   ────────                                       │               │
│   │                  from YAML    from the                                       │               │
│   │                  "name:"      items array                                    │               │
│   │                  field        or device tag                                  │               │
│   │                                                                              │               │
│   │   Examples:                                                                  │               │
│   │                                                                              │               │
│   │     plc1/temperature        ── PLC source named "plc1", item "temperature"   │               │
│   │     mqtt/sensors/pressure   ── MQTT source "mqtt", topic "sensors/pressure"  │               │
│   │     opcua/ns=2;s=Speed      ── OPC-UA source "opcua", node "ns=2;s=Speed"    │               │
│   │     db_src/query1/col_temp  ── Database source, query 1, column "col_temp"   │               │
│   │                                                                              │               │
│   │   itemized_read: true       ── Each item gets its own path (default)         │               │
│   │   itemized_read: false      ── All items arrive as one bulk message          │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   Sinks use regex against these paths to decide what to accept or reject.                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   $SYSTEM PATHS — AUTOMATIC CONNECTOR METADATA                                                   │
│   ─────────────────────────────────────────────                                                  │
│                                                                                                  │
│   Every connector auto-publishes status messages under a $SYSTEM prefix.                         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   sourceName/$SYSTEM/IsConnected   ── true/false                             │               │
│   │   sourceName/$SYSTEM/IsFaulted     ── true/false                             │               │
│   │   sourceName/$SYSTEM/FaultCount    ── cumulative fault count                 │               │
│   │   sourceName/$SYSTEM/ConnectCount  ── number of reconnections                │               │
│   │   sourceName/$SYSTEM/ReadTime      ── last device read time (ms)             │               │
│   │   sourceName/$SYSTEM/ScriptTime    ── last script exec time (ms)             │               │
│   │   sourceName/$SYSTEM/LoopTime      ── total loop time (ms)                   │               │
│   │   sourceName/$SYSTEM/ItemCount     ── number of items being read             │               │
│   │                                                                              │               │
│   │   Example:   plc1/$SYSTEM/IsConnected = true                                 │               │
│   │              plc1/$SYSTEM/ReadTime    = 12                                   │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   $SYSTEM messages flow through the ring buffer like any other data.                             │
│   Sinks receive them unless explicitly excluded.                                                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   EXCLUDE FILTER — REGEX BLACKLIST                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   Messages matching any exclude_filter pattern are DROPPED by the sink.                          │
│                                                                                                  │
│        ┌────────────────┐                                                                        │
│        │  Ring Buffer   │                                                                        │
│        │  (all msgs)    │                                                                        │
│        └───────┬────────┘                                                                        │
│                │                                                                                 │
│                ▼                                                                                 │
│        ┌────────────────────────────────────────────────────┐                                    │
│        │            EXCLUDE FILTER                          │                                    │
│        │                                                    │                                    │
│        │   exclude_filter:                                  │                                    │
│        │     - ".*\\$SYSTEM.*"      ← drop all $SYSTEM msgs │                                    │
│        │     - "debug/.*"           ← drop debug paths      │                                    │
│        │                                                    │                                    │
│        │   ┌─────────┐  ┌──────────────┐  ┌─────────────┐   │                                    │
│        │   │plc1/temp│  │plc1/$SYS/... │  │debug/trace  │   │                                    │
│        │   │         │  │              │  │             │   │                                    │
│        │   │  PASS ✓ │  │  DROPPED ✗  │  │  DROPPED ✗  │   │                                    │
│        │   └─────────┘  └──────────────┘  └─────────────┘   │                                    │
│        │                                                    │                                    │
│        └─────────────────────┬──────────────────────────────┘                                    │
│                              │                                                                   │
│                              ▼                                                                   │
│                       ┌─────────────┐                                                            │
│                       │  Sink gets  │                                                            │
│                       │  plc1/temp  │                                                            │
│                       │  only       │                                                            │
│                       └─────────────┘                                                            │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   INCLUDE FILTER — REGEX WHITELIST                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   ONLY messages matching an include_filter pattern are ACCEPTED. Everything else dropped.        │
│                                                                                                  │
│        ┌────────────────┐                                                                        │
│        │  Ring Buffer   │                                                                        │
│        │  (all msgs)    │                                                                        │
│        └───────┬────────┘                                                                        │
│                │                                                                                 │
│                ▼                                                                                 │
│        ┌────────────────────────────────────────────────────┐                                    │
│        │            INCLUDE FILTER                          │                                    │
│        │                                                    │                                    │
│        │   include_filter:                                  │                                    │
│        │     - "plc1/.*"            ← only plc1 messages    │                                    │
│        │     - "mqtt/temperature"   ← and this one path     │                                    │
│        │                                                    │                                    │
│        │   ┌─────────┐  ┌──────────────┐  ┌─────────────┐   │                                    │
│        │   │plc1/temp│  │plc1/pressure │  │opcua/speed  │   │                                    │
│        │   │         │  │              │  │             │   │                                    │
│        │   │  PASS ✓ │  │   PASS ✓     │  │  DROPPED ✗  │   │                                    │
│        │   └─────────┘  └──────────────┘  └─────────────┘   │                                    │
│        │                                                    │                                    │
│        └─────────────────────┬──────────────────────────────┘                                    │
│                              │                                                                   │
│                              ▼                                                                   │
│                       ┌─────────────┐                                                            │
│                       │  Sink gets  │                                                            │
│                       │  plc1/* only│                                                            │
│                       └─────────────┘                                                            │
│                                                                                                  │
│   If BOTH include and exclude are set, include is applied first, then exclude.                   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   STRIP PATH PREFIX                                                                              │
│   ─────────────────                                                                              │
│                                                                                                  │
│   Removes the source name from the path before the sink writes it.                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   strip_path_prefix: true                                                    │               │
│   │                                                                              │               │
│   │   BEFORE                              AFTER                                  │               │
│   │   ──────                              ─────                                  │               │
│   │   plc1/temperature          ────▶     temperature                            │               │
│   │   mqtt/sensors/pressure     ────▶     sensors/pressure                       │               │
│   │   opcua/ns=2;s=Speed        ────▶     ns=2;s=Speed                           │               │
│   │                                                                              │               │
│   │   Useful when republishing to MQTT or writing to databases where the         │               │
│   │   source name prefix is redundant.                                           │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FULL ROUTING EXAMPLE — ONE BUFFER, THREE SINKS                                                 │
│   ──────────────────────────────────────────────                                                 │
│                                                                                                  │
│   All messages from all sources land in the ring buffer. Each sink applies its own filters.      │
│                                                                                                  │
│    Sources                         Ring Buffer                          Sinks                    │
│    ──────────                      ───────────                          ───────                  │
│                                                                                                  │
│    ┌──────────┐                ┌──────────────┐                 ┌────────────────────┐           │
│    │ plc1     │──────┐         │              │          ┌─────▶│ Sink A: InfluxDB   │           │
│    │ temp,psi │      │         │   ┌──────┐   │          │      │                    │           │
│    └──────────┘      │         │   │ ···  │   │          │      │ include:           │           │
│                      ├────────▶│   │ msgs │   │──────────┤      │   - "plc1/.*"      │           │
│    ┌──────────┐      │         │   │ ···  │   │          │      │                    │           │
│    │ mqtt     │──────┤         │   └──────┘   │          │      │ Gets: plc1/temp    │           │
│    │ sensors  │      │         │              │          │      │       plc1/psi     │           │
│    └──────────┘      │         │  4096 slots  │          │      └────────────────────┘           │
│                      │         │              │          │                                       │
│    ┌──────────┐      │         └──────────────┘          ├─────▶┌────────────────────┐           │
│    │ opcua    │──────┘                                   │      │ Sink B: Splunk     │           │
│    │ speed    │                                          │      │                    │           │
│    └──────────┘                                          │      │ exclude:           │           │
│                                                          │      │   - ".*\\$SYSTEM.*"│           │
│                                                          │      │                    │           │
│                                                          │      │ Gets: everything   │           │
│                                                          │      │   minus $SYSTEM    │           │
│                                                          │      └────────────────────┘           │
│                                                          │                                       │
│                                                          └─────▶┌────────────────────┐           │
│                                                                 │ Sink C: MQTT Pub   │           │
│                                                                 │                    │           │
│                                                                 │ include:           │           │
│                                                                 │   - "mqtt/.*"      │           │
│                                                                 │ strip_path_prefix: │           │
│                                                                 │   true             │           │
│                                                                 │                    │           │
│                                                                 │ Gets: sensors/*    │           │
│                                                                 │  (prefix stripped) │           │
│                                                                 └────────────────────┘           │
│                                                                                                  │
│   Each sink independently filters the same stream. No data is copied — only references.          │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
