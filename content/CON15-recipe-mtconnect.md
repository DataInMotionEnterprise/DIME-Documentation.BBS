```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        15 — MTConnect & CNC                           │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Read from machines.                            │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Serve as an MTConnect agent.                   │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT IS MTCONNECT?                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   MTConnect is an open, royalty-free standard for monitoring manufacturing                       │
│   equipment. It provides a common vocabulary for machine data — spindle speed,                   │
│   axis positions, tool states, and alarms — over HTTP/XML.                                       │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   MTConnect Data Types:                                                      │               │
│   │                                                                              │               │
│   │     SAMPLES ─────── Numeric values that change over time                     │               │
│   │                      Spindle speed, axis position, feed rate                 │               │
│   │                                                                              │               │
│   │     EVENTS ──────── Discrete state changes                                   │               │
│   │                      Execution state (ACTIVE, STOPPED), tool ID              │               │
│   │                                                                              │               │
│   │     CONDITIONS ──── Alarm / warning states                                   │               │
│   │                      NORMAL, WARNING, FAULT, UNAVAILABLE                     │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   DIME speaks MTConnect natively — both as a consumer and as a producer.                         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   END-TO-END FLOW — CNC TO DASHBOARD                                                             │
│   ───────────────────────────────────                                                            │
│                                                                                                  │
│    CNC Machines            DIME                          Consumers                               │
│    ────────────            ────                          ─────────                               │
│                                                                                                  │
│    ┌───────────┐      ┌─────────────────────────────┐      ┌────────────────┐                    │
│    │ Haas CNC  │SHDR─▶│                             │      │ MTConnect      │                    │
│    │ (direct)  │      │  ┌──────┐     ┌──────────┐  │      │ Agent on :5000 │                    │
│    └───────────┘      │  │Source│────▶│          │  ├─────▶│                │                    │
│                       │  └──────┘     │   Ring   │  │      └───────┬────────┘                    │
│    ┌───────────┐      │               │  Buffer  │  │              │                             │
│    │ FANUC     │─────▶│  ┌──────┐     │          │  │              ▼                             │
│    │ Robot     │      │  │Source│────▶│          │  │      ┌────────────────┐                    │
│    └───────────┘      │  └──────┘     │          │  │      │ Grafana /      │                    │
│                       │               │          │  │      │ Dashboard      │                    │
│    ┌───────────┐      │  ┌──────┐     │          │  │      └────────────────┘                    │
│    │ Yaskawa   │─────▶│  │Source│────▶│          │  │                                            │
│    │ Robot     │      │  └──────┘     └──────────┘  │      ┌────────────────┐                    │
│    └───────────┘      │                             ├─────▶│ InfluxDB /     │                    │
│                       │         Lua transforms      │      │ SQL Server     │                    │
│    ┌───────────┐      │         emit_mtconnect()    │      └────────────────┘                    │
│    │ Existing  │─HTTP─▶│                            │                                            │
│    │ MTConnect │      │  ┌──────┐     ┌──────────┐  │      ┌────────────────┐                    │
│    │ Agent     │      │  │Source│────▶│  SHDR    │  ├─────▶│ External       │                    │
│    └───────────┘      │  └──────┘     │  Sink    │  │      │ MTConnect      │                    │
│                       │               └──────────┘  │      │ Agent          │                    │
│                       └─────────────────────────────┘      └────────────────┘                    │
│                                                                                                  │
│   DIME bridges protocols: read SHDR from Haas, serve MTConnect to dashboards.                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MTCONNECT SOURCE — POLL AN EXISTING AGENT                                                      │
│   ──────────────────────────────────────────                                                     │
│                                                                                                  │
│   Connect to any standard MTConnect agent over HTTP. DIME polls the                              │
│   /current endpoint at the configured interval.                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: MTConnect                                                       │               │
│   │                                                                              │               │
│   │   address ─────────── http://cnc-agent.local:5000    Agent URL               │               │
│   │   scan_interval ───── !!int 1000                     Poll every 1 sec        │               │
│   │                                                                              │               │
│   │   How it works:                                                              │               │
│   │     1. GET http://cnc-agent.local:5000/current                               │               │
│   │     2. Parse XML response for Samples, Events, Conditions                    │               │
│   │     3. Map each data item to a DIME path: sourceName/dataItemId              │               │
│   │     4. Publish to ring buffer                                                │               │
│   │                                                                              │               │
│   │   Result paths:                                                              │               │
│   │     cnc1/SpindleSpeed     ── 12000 (Sample)                                  │               │
│   │     cnc1/Execution        ── ACTIVE (Event)                                  │               │
│   │     cnc1/SystemCondition  ── NORMAL (Condition)                              │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SHDR & HAAS SOURCE — DIRECT MACHINE CONNECTION                                                 │
│   ───────────────────────────────────────────────                                                │
│                                                                                                  │
│   For machines that speak SHDR (Simple Haas Data Relay) natively,                                │
│   DIME connects directly — no intermediate MTConnect agent needed.                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: Haas                                                            │               │
│   │                                                                              │               │
│   │   address ─────────── 192.168.1.50         Machine IP                        │               │
│   │   port ────────────── !!int 7878           SHDR port                         │               │
│   │                                                                              │               │
│   │   SHDR is a pipe-delimited text protocol:                                    │               │
│   │     2024-02-19T10:30:00|Xact|125.002|Yact|87.551|SspeedAct|12000             │               │
│   │                                                                              │               │
│   │   DIME parses this into individual data items:                               │               │
│   │     haas1/Xact      ── 125.002                                               │               │
│   │     haas1/Yact      ──  87.551                                               │               │
│   │     haas1/SspeedAct ── 12000                                                 │               │
│   │                                                                              │               │
│   │   Advantages of direct SHDR:                                                 │               │
│   │     • No separate MTConnect agent to install                                 │               │
│   │     • Lower latency — one fewer network hop                                  │               │
│   │     • DIME becomes the agent (see MTConnect Agent Sink below)                │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FANUC & YASKAWA SOURCES — DIRECT ROBOT CONNECTIVITY                                            │
│   ────────────────────────────────────────────────────                                           │
│                                                                                                  │
│   Purpose-built connectors for industrial robots.                                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   FANUC Source                             Yaskawa Source                    │               │
│   │   ────────────                             ──────────────                    │               │
│   │                                                                              │               │
│   │   connector: FANUC                         connector: Yaskawa                │               │
│   │                                                                              │               │
│   │   Reads directly from FANUC               Reads directly from Yaskawa        │               │
│   │   robot controllers via the               robot controllers via native       │               │
│   │   FANUC FOCAS library.                    communication protocol.            │               │
│   │                                                                              │               │
│   │   Typical data:                            Typical data:                     │               │
│   │     • Joint positions (J1-J6)                • Joint positions               │               │
│   │     • TCP position (X,Y,Z,W,P,R)            • I/O registers                  │               │
│   │     • Program number & status                • Alarm states                  │               │
│   │     • Override percentage                    • Cycle counters                │               │
│   │     • Alarm history                          • Program status                │               │
│   │     • I/O registers                          • Speed override                │               │
│   │                                                                              │               │
│   │   Both are PollingSourceConnectors — timer-driven with scan_interval.        │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   These connectors let DIME act as a universal robot-data gateway.                               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MTCONNECT AGENT SINK — DIME BECOMES THE AGENT                                                  │
│   ───────────────────────────────────────────────                                                │
│                                                                                                  │
│   DIME can serve as a full MTConnect agent, exposing data on an HTTP port.                       │
│   Any MTConnect-compliant client can read from DIME.                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: MTConnectAgent                                                  │               │
│   │                                                                              │               │
│   │   port ────────────── !!int 5000           HTTP port to serve on             │               │
│   │   device_name ─────── CNC-Line-1           Device name in XML                │               │
│   │                                                                              │               │
│   │   Endpoints exposed:                                                         │               │
│   │     http://dime-host:5000/probe     ── Device metadata & capabilities        │               │
│   │     http://dime-host:5000/current   ── Current data item values              │               │
│   │     http://dime-host:5000/sample    ── Historical data stream                │               │
│   │                                                                              │               │
│   │   Flow:                                                                      │               │
│   │     Any DIME source ──▶ Ring Buffer ──▶ MTConnect Agent Sink                 │               │
│   │                                         │                                    │               │
│   │                                         ├── Serves /probe (XML)              │               │
│   │                                         ├── Serves /current (XML)            │               │
│   │                                         └── Serves /sample (XML)             │               │
│   │                                                                              │               │
│   │   This means DIME can unify non-MTConnect devices (PLCs, robots, MQTT)       │               │
│   │   behind a standard MTConnect interface for monitoring tools.                │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SHDR SINK — FEED EXTERNAL AGENTS                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   If you already have an MTConnect agent (e.g. the MTConnect C++ Agent),                         │
│   DIME can feed it via SHDR output.                                                              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: SHDR                                                            │               │
│   │                                                                              │               │
│   │   DIME formats each message as a pipe-delimited SHDR string                  │               │
│   │   and sends it to the external agent's adapter port.                         │               │
│   │                                                                              │               │
│   │   ┌─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────────┐      │               │
│   │   │ Any     │─────▶│  Ring    │─────▶│  SHDR    │─────▶│  External    │      │               │
│   │   │ Source  │      │  Buffer  │      │  Sink    │      │  MTConnect   │      │               │
│   │   └─────────┘      └──────────┘      └──────────┘      │  Agent       │      │               │
│   │                                                        └──────────────┘      │               │
│   │                                                                              │               │
│   │   Use this when your organization mandates a specific MTConnect agent        │               │
│   │   but you need DIME to collect and transform the data.                       │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   emit_mtconnect() — SEMANTIC MAPPING IN LUA                                                     │
│   ───────────────────────────────────────────                                                    │
│                                                                                                  │
│   Use the Lua emit_mtconnect() function to map raw device data                                   │
│   to named MTConnect data items with proper types.                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   emit_mtconnect( data_item_name, value, mtconnect_type, is_condition )      │               │
│   │                                                                              │               │
│   │   Parameters:                                                                │               │
│   │     data_item_name ── "SpindleSpeed"         Name in MTConnect XML           │               │
│   │     value ─────────── result                  The value to publish           │               │
│   │     mtconnect_type ── "SpindleSpeed"          MTConnect type category        │               │
│   │     is_condition ──── false                   true if Condition type         │               │
│   │                                                                              │               │
│   │   Example Lua script:                                                        │               │
│   │   ┌─────────────────────────────────────────────────────────────────┐        │               │
│   │   │                                                                 │        │               │
│   │   │   -- Map PLC register to MTConnect spindle speed                │        │               │
│   │   │   emit_mtconnect('spindle_speed', result, 'SpindleSpeed', false)│        │               │
│   │   │                                                                 │        │               │
│   │   │   -- Map alarm register to MTConnect condition                  │        │               │
│   │   │   if result > 0 then                                            │        │               │
│   │   │     emit_mtconnect('system_cond', 'FAULT', 'System', true)      │        │               │
│   │   │   else                                                          │        │               │
│   │   │     emit_mtconnect('system_cond', 'NORMAL', 'System', true)     │        │               │
│   │   │   end                                                           │        │               │
│   │   │                                                                 │        │               │
│   │   └─────────────────────────────────────────────────────────────────┘        │               │
│   │                                                                              │               │
│   │   This lets any device — PLC, Modbus, MQTT — appear as an MTConnect          │               │
│   │   device with proper semantic data item names and types.                     │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
