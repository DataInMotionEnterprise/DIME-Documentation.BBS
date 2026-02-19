```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        18 — Health & Faults                          │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Self-monitoring. Auto-recovery.                │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Built-in resilience.                           │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR STATE MACHINE                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   Every connector follows a deterministic state machine managed by ConnectorRunner.              │
│                                                                                                  │
│                                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │                          ┌──────────────┐                                               │    │
│   │                          │              │                                               │    │
│   │                          │ Initialized  │                                               │    │
│   │                          │              │                                               │    │
│   │                          └──────┬───────┘                                               │    │
│   │                                 │                                                       │    │
│   │                                 ▼                                                       │    │
│   │                          ┌──────────────┐                                               │    │
│   │                          │              │                                               │    │
│   │                          │  Connected   │◄─────────────────────────┐                    │    │
│   │                          │              │                          │                    │    │
│   │                          └──────┬───────┘                          │                    │    │
│   │                                 │                                  │  auto-retry        │    │
│   │                                 ▼                                  │                    │    │
│   │                          ┌──────────────┐       ┌──────────────┐  │                    │    │
│   │                          │              │       │              │  │                    │    │
│   │                          │  Read/Write  │──────▶│   Faulted    │──┘                    │    │
│   │                          │   (loop)     │       │              │                       │    │
│   │                          │              │       │  FaultCount++│                       │    │
│   │                          └──────┬───────┘       └──────────────┘                       │    │
│   │                                 │                                                       │    │
│   │                                 ▼                                                       │    │
│   │                          ┌──────────────┐                                               │    │
│   │                          │              │                                               │    │
│   │                          │ Disconnected │                                               │    │
│   │                          │              │                                               │    │
│   │                          └──────────────┘                                               │    │
│   │                                                                                         │    │
│   │   Transitions:                                                                          │    │
│   │     Initialized ──▶ Connected     Config loaded, connection opened                      │    │
│   │     Connected   ──▶ Read/Write    Main loop begins                                     │    │
│   │     Read/Write  ──▶ Faulted       Exception during read/write                          │    │
│   │     Faulted     ──▶ Connected     Auto-retry: disconnect → reconnect                   │    │
│   │     Read/Write  ──▶ Disconnected  Graceful shutdown                                    │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   $SYSTEM MESSAGES — AUTOMATIC HEALTH TELEMETRY                                                  │
│   ─────────────────────────────────────────────                                                  │
│                                                                                                  │
│   Every connector automatically publishes status under $SYSTEM. No config needed.                │
│                                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   CONNECTION STATUS                          FAULT TRACKING                              │   │
│   │   ─────────────────                          ──────────────                              │   │
│   │                                                                                          │   │
│   │   name/$SYSTEM/IsConnected    bool           name/$SYSTEM/IsFaulted     bool             │   │
│   │   name/$SYSTEM/ConnectCount   int            name/$SYSTEM/FaultReason   string           │   │
│   │   name/$SYSTEM/DisconnectCount int           name/$SYSTEM/FaultCount    int              │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   IsConnected = true     ── device is reachable and responding                           │   │
│   │   ConnectCount = 5       ── connected 5 times (includes reconnections)                   │   │
│   │   DisconnectCount = 4    ── disconnected 4 times (faults + graceful)                     │   │
│   │   IsFaulted = true       ── connector is currently in fault state                        │   │
│   │   FaultReason = "timeout"── last exception message                                       │   │
│   │   FaultCount = 3         ── total faults since startup                                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   These flow through the ring buffer like any data message. Sinks can filter on them.           │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   PERFORMANCE METRICS PER CONNECTOR                                                              │
│   ─────────────────────────────────                                                              │
│                                                                                                  │
│   Every source connector publishes timing data so you can spot slow devices.                     │
│                                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   TIMING METRICS                             THROUGHPUT METRICS                          │   │
│   │   ──────────────                             ───────────────────                          │   │
│   │                                                                                          │   │
│   │   name/$SYSTEM/MinReadTime     ms            name/$SYSTEM/MessagesAttempted   int        │   │
│   │   name/$SYSTEM/MaxReadTime     ms            name/$SYSTEM/MessagesAccepted    int        │   │
│   │   name/$SYSTEM/LastReadTime    ms                                                        │   │
│   │   name/$SYSTEM/ScriptTime      ms            Attempted = total reads from device         │   │
│   │   name/$SYSTEM/TotalLoopTime   ms            Accepted  = values that passed RBE          │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   ┌──────────── One Loop Cycle ────────────────────────────────────────┐                 │   │
│   │   │                                                                    │                 │   │
│   │   │  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌───────────────┐   │                 │   │
│   │   │  │ ReadTime   │  │ ScriptTime │  │  RBE     │  │ Publish to   │   │                 │   │
│   │   │  │ (device)   │  │ (Lua/Py)   │  │  Filter  │  │ Ring Buffer  │   │                 │   │
│   │   │  └───────────┘  └────────────┘  └──────────┘  └───────────────┘   │                 │   │
│   │   │                                                                    │                 │   │
│   │   │  ◄────────────── TotalLoopTime ──────────────────────────────────▶ │                 │   │
│   │   └────────────────────────────────────────────────────────────────────┘                 │   │
│   │                                                                                          │   │
│   │   MinReadTime / MaxReadTime track the fastest and slowest device reads.                  │   │
│   │   A growing MaxReadTime signals device latency or network issues.                        │   │
│   │                                                                                          │   │
│   │   MessagesAttempted vs MessagesAccepted reveals RBE effectiveness:                       │   │
│   │     Attempted=1000, Accepted=50 → 95% of values unchanged → RBE working well            │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   AUTO-RECOVERY — BUILT-IN FAULT TOLERANCE                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   ConnectorRunner handles faults automatically. No watchdog scripts needed.                      │
│                                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │    ┌──────────┐     exception      ┌───────────┐     disconnect     ┌──────────────┐     │   │
│   │    │          │ ──────────────────▶ │           │ ──────────────────▶│              │     │   │
│   │    │ Reading  │                     │  Faulted  │                    │ Disconnected │     │   │
│   │    │          │ ◄────────────────── │           │ ◄──────────────────│              │     │   │
│   │    └──────────┘     reconnect       └───────────┘     reconnect     └──────────────┘     │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │    What happens on fault:                                                                │   │
│   │                                                                                          │   │
│   │      1. Exception caught by ConnectorRunner                                              │   │
│   │      2. IsFaulted = true, FaultReason = exception message                                │   │
│   │      3. FaultCount incremented                                                           │   │
│   │      4. Disconnect from device                                                           │   │
│   │      5. Wait (brief pause)                                                               │   │
│   │      6. Reconnect and resume Read/Write loop                                             │   │
│   │      7. ConnectCount incremented                                                         │   │
│   │      8. IsFaulted = false on successful reconnect                                        │   │
│   │                                                                                          │   │
│   │    This cycle repeats indefinitely. DIME never gives up on a connector.                  │   │
│   │    All fault transitions are published as $SYSTEM messages in real time.                  │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                                                                                                  │
│   MONITORING & ALERTING — ROUTE $SYSTEM TO ANALYTICS                                            │
│   ──────────────────────────────────────────────────                                            │
│                                                                                                  │
│   $SYSTEM messages are normal ring buffer messages. Route them to any sink for alerting.         │
│                                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │    Connectors              Ring Buffer                   Analytics Sinks                  │   │
│   │    ──────────              ───────────                   ───────────────                  │   │
│   │                                                                                          │   │
│   │    ┌──────────┐         ┌──────────────┐         ┌───────────────────────┐               │   │
│   │    │ plc1     │────┐    │              │    ┌───▶│ Splunk                │               │   │
│   │    │ $SYSTEM  │    │    │  ┌────────┐  │    │    │                       │               │   │
│   │    └──────────┘    ├───▶│  │ $SYS   │  │────┤    │ include_filter:       │               │   │
│   │                    │    │  │ msgs   │  │    │    │   - ".*\\$SYSTEM.*"    │               │   │
│   │    ┌──────────┐    │    │  └────────┘  │    │    │                       │               │   │
│   │    │ mqtt1    │────┘    │              │    │    │ Dashboard: fault rate  │               │   │
│   │    │ $SYSTEM  │         └──────────────┘    │    │ alerts, uptime graphs │               │   │
│   │    └──────────┘                             │    └───────────────────────┘               │   │
│   │                                             │                                            │   │
│   │                                             │    ┌───────────────────────┐               │   │
│   │                                             └───▶│ InfluxDB              │               │   │
│   │                                                  │                       │               │   │
│   │                                                  │ include_filter:       │               │   │
│   │                                                  │   - ".*\\$SYSTEM.*"    │               │   │
│   │                                                  │                       │               │   │
│   │                                                  │ Grafana: read times,  │               │   │
│   │                                                  │ loop times, fault cnt │               │   │
│   │                                                  └───────────────────────┘               │   │
│   │                                                                                          │   │
│   │    Use include_filter to capture ONLY $SYSTEM messages for health monitoring.            │   │
│   │    Use exclude_filter on data sinks to DROP $SYSTEM messages from production data.       │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Every DIME instance is self-monitoring. No external agents. No sidecars. Just YAML.           │
│                                                                                                  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```