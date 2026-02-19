```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        18 — Health & Faults                           │
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
│   │                          ┌──────────────┐       ┌──────────────┐   │                    │    │
│   │                          │              │       │              │   │                    │    │
│   │                          │  Read/Write  │──────▶│   Faulted    │───┘                    │    │
│   │                          │   (loop)     │       │              │                        │    │
│   │                          │              │       │  FaultCount++│                        │    │
│   │                          └──────┬───────┘       └──────────────┘                        │    │
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
│   │     Connected   ──▶ Read/Write    Main loop begins                                      │    │
│   │     Read/Write  ──▶ Faulted       Exception during read/write                           │    │
│   │     Faulted     ──▶ Connected     Auto-retry: disconnect → reconnect                    │    │
│   │     Read/Write  ──▶ Disconnected  Graceful shutdown                                     │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   $SYSTEM MESSAGES — AUTOMATIC HEALTH TELEMETRY                                                  │
│   ─────────────────────────────────────────────                                                  │
│                                                                                                  │
│   Every connector automatically publishes status under $SYSTEM. No config needed.                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   RING BUFFER MESSAGES                       ADMIN API ONLY (ConnectorStatus)             │   │
│   │   ────────────────────                       ───────────────────────────────              │   │
│   │                                                                                          │   │
│   │   name/$SYSTEM/IsConnected    bool           ConnectCount        int                     │   │
│   │   name/$SYSTEM/IsFaulted      bool           DisconnectCount     int                     │   │
│   │   name/$SYSTEM/Fault          string         FaultCount          int                     │   │
│   │   name/$SYSTEM/IsAvailable    bool           FaultMessage        string                  │   │
│   │   name/$SYSTEM/ExecutionDuration long                                                    │   │
│   │                                                                                          │   │
│   │   IsConnected = true     ── device is reachable and responding                           │   │
│   │   IsFaulted = true       ── connector is currently in fault state                        │   │
│   │   Fault = "timeout"      ── last exception message (null when clear)                     │   │
│   │   IsAvailable = true     ── IsConnected AND NOT IsFaulted                                │   │
│   │   ExecutionDuration      ── total loop execution time in ms                              │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   These flow through the ring buffer like any data message. Sinks can filter on them.            │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PERFORMANCE METRICS PER CONNECTOR (Admin API)                                                  │
│   ─────────────────────────────────────────────                                                  │
│                                                                                                  │
│   Every connector tracks timing data via the Admin API (GET /status). Not ring buffer msgs.      │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   TIMING METRICS (Admin API)                 THROUGHPUT METRICS (Admin API)               │   │
│   │   ──────────────────────────                 ────────────────────────────────             │   │
│   │                                                                                          │   │
│   │   MinimumReadMs              ms              MessagesAttempted              int           │   │
│   │   MaximumReadMs              ms              MessagesAccepted               int           │   │
│   │   LastReadMs                 ms                                                          │   │
│   │   MinimumScriptMs / MaximumScriptMs          Attempted = total reads from device         │   │
│   │   MinimumLoopMs / MaximumLoopMs              Accepted  = values that passed RBE          │   │
│   │                                                                                          │   │
│   │   ┌──────────── One Loop Cycle ────────────────────────────────────────┐                 │   │
│   │   │                                                                    │                 │   │
│   │   │  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌───────────────┐    │                 │   │
│   │   │  │ ReadTime  │  │ ScriptTime │  │  RBE     │  │ Publish to    │    │                 │   │
│   │   │  │ (device)  │  │ (Lua/Py)   │  │  Filter  │  │ Ring Buffer   │    │                 │   │
│   │   │  └───────────┘  └────────────┘  └──────────┘  └───────────────┘    │                 │   │
│   │   │                                                                    │                 │   │
│   │   │  ◄────────────── TotalLoopTime ──────────────────────────────────▶ │                 │   │
│   │   └────────────────────────────────────────────────────────────────────┘                 │   │
│   │                                                                                          │   │
│   │   MinReadTime / MaxReadTime track the fastest and slowest device reads.                  │   │
│   │   A growing MaxReadTime signals device latency or network issues.                        │   │
│   │                                                                                          │   │
│   │   MessagesAttempted vs MessagesAccepted reveals RBE effectiveness:                       │   │
│   │     Attempted=1000, Accepted=50 → 95% of values unchanged → RBE working well             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   AUTO-RECOVERY — BUILT-IN FAULT TOLERANCE                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   ConnectorRunner handles faults automatically. No watchdog scripts needed.                      │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │    ┌──────────┐     exception      ┌───────────┐     disconnect     ┌──────────────┐     │   │
│   │    │          │ ──────────────────▶│           │ ──────────────────▶│              │     │   │
│   │    │ Reading  │                    │  Faulted  │                    │ Disconnected │     │   │
│   │    │          │ ◄──────────────────│           │ ◄──────────────────│              │     │   │
│   │    └──────────┘     reconnect      └───────────┘     reconnect      └──────────────┘     │   │
│   │                                                                                          │   │
│   │    What happens on fault:                                                                │   │
│   │                                                                                          │   │
│   │      1. Exception caught by ConnectorRunner                                              │   │
│   │      2. IsFaulted = true, Fault = exception message                                      │   │
│   │      3. FaultCount incremented                                                           │   │
│   │      4. Disconnect from device                                                           │   │
│   │      5. Wait (brief pause)                                                               │   │
│   │      6. Reconnect and resume Read/Write loop                                             │   │
│   │      7. ConnectCount incremented                                                         │   │
│   │      8. IsFaulted = false on successful reconnect                                        │   │
│   │                                                                                          │   │
│   │    This cycle repeats indefinitely. DIME never gives up on a connector.                  │   │
│   │    All fault transitions are published as $SYSTEM messages in real time.                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MONITORING & ALERTING — ROUTE $SYSTEM TO ANALYTICS                                             │
│   ──────────────────────────────────────────────────                                             │
│                                                                                                  │
│   $SYSTEM messages are normal ring buffer messages. Route them to any sink for alerting.         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │    Connectors              Ring Buffer                   Analytics Sinks                 │   │
│   │    ──────────              ───────────                   ───────────────                 │   │
│   │                                                                                          │   │
│   │    ┌──────────┐         ┌──────────────┐         ┌───────────────────────┐               │   │
│   │    │ plc1     │────┐    │              │    ┌───▶│ Splunk                │               │   │
│   │    │ $SYSTEM  │    │    │  ┌────────┐  │    │    │                       │               │   │
│   │    └──────────┘    ├───▶│  │ $SYS   │  │────┤    │ include_filter:       │               │   │
│   │                    │    │  │ msgs   │  │    │    │   - ".*\\$SYSTEM.*"   │               │   │
│   │    ┌──────────┐    │    │  └────────┘  │    │    │                       │               │   │
│   │    │ mqtt1    │────┘    │              │    │    │ Dashboard: fault rate │               │   │
│   │    │ $SYSTEM  │         └──────────────┘    │    │ alerts, uptime graphs │               │   │
│   │    └──────────┘                             │    └───────────────────────┘               │   │
│   │                                             │                                            │   │
│   │                                             │    ┌───────────────────────┐               │   │
│   │                                             └───▶│ InfluxDB              │               │   │
│   │                                                  │                       │               │   │
│   │                                                  │ include_filter:       │               │   │
│   │                                                  │   - ".*\\$SYSTEM.*"   │               │   │
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
│   Every DIME instance is self-monitoring. No external agents. No sidecars. Just YAML.            │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
