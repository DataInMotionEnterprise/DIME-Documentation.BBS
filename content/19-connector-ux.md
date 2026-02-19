```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        19 — Connector UX                              │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Desktop app for managing                       │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          local DIME instances.                          │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT IS CONNECTOR UX?                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   A cross-platform desktop application for monitoring and managing DIME instances.               │
│   Built with Tauri v2 + React. Runs on Windows, macOS, Linux, Android, and iOS.                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐              │    │
│   │   │          │   │          │   │          │   │          │   │          │              │    │
│   │   │ Windows  │   │  macOS   │   │  Linux   │   │ Android  │   │   iOS    │              │    │
│   │   │          │   │          │   │          │   │          │   │          │              │    │
│   │   └─────┬────┘   └─────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘              │    │
│   │         │              │             │              │              │                      │  │
│   │         └──────────────┴──────┬──────┴──────────────┴──────────────┘                      │  │
│   │                               │                                                          │   │
│   │                        ┌──────▼──────┐                                                   │   │
│   │                        │  Tauri v2   │                                                   │   │
│   │                        │  + React    │                                                   │   │
│   │                        │  frontend   │                                                   │   │
│   │                        └─────────────┘                                                   │   │
│   │                                                                                          │   │
│   │   One codebase, five platforms. Native performance. No Electron bloat.                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MULTI-INSTANCE MANAGEMENT                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   Connect to several DIME instances simultaneously from a single app window.                     │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │                           ┌─────────────────────────────────────┐                        │   │
│   │                           │        Connector UX App             │                        │   │
│   │                           │                                     │                        │   │
│   │                           │  ┌───────┐ ┌───────┐ ┌───────┐     │                        │    │
│   │                           │  │ Inst1 │ │ Inst2 │ │ Inst3 │     │                        │    │
│   │                           │  │  ●    │ │  ●    │ │  ◌    │     │                        │    │
│   │                           │  └───┬───┘ └───┬───┘ └───┬───┘     │                        │    │
│   │                           │      │         │         │         │                        │    │
│   │                           └──────┼─────────┼─────────┼─────────┘                        │    │
│   │                                  │         │         │                                   │   │
│   │                    ┌─────────────┼─────────┼─────────┼──────────────┐                    │   │
│   │                    │             │         │         │              │                    │   │
│   │                    │             ▼         ▼         ▼             │                    │    │
│   │                    │                                               │                    │    │
│   │                    │              Admin API (REST + WS)            │                    │    │
│   │                    │              http://host:9999                 │                    │    │
│   │                    │              ws://host:9998                   │                    │    │
│   │                    │                                               │                    │    │
│   │                    └───────────────────────────────────────────────┘                    │    │
│   │                                                                                          │   │
│   │    ● = connected     ◌ = disconnected                                                    │   │
│   │                                                                                          │   │
│   │    Each instance is reached via its Admin API.                                           │   │
│   │    Add instances by pointing at http://host:9999                                         │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FEATURE CATALOG                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   ┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────┐     │
│   │                            │  │                            │  │                        │     │
│   │  LIVE DASHBOARD            │  │  CONFIGURATION EDITOR      │  │  SCHEMA BROWSER        │     │
│   │                            │  │                            │  │                        │     │
│   │  Real-time status cards    │  │  Monaco YAML editor with   │  │  Interactive config    │     │
│   │  for every connector.      │  │  syntax highlighting and   │  │  schema navigator.     │     │
│   │                            │  │  inline validation.        │  │                        │     │
│   │  ┌──────┐ ┌──────┐        │  │                            │  │  Browse every field,   │      │
│   │  │ plc1 │ │ mqtt │        │  │  Validates against the     │  │  see types, defaults,  │      │
│   │  │  ●   │ │  ●   │        │  │  DIME config JSON schema.  │  │  and descriptions.     │      │
│   │  │ 12ms │ │  4ms │        │  │                            │  │                        │      │
│   │  └──────┘ └──────┘        │  │  Push changes to running   │  │  Auto-complete from    │      │
│   │                            │  │  DIME instances.           │  │  schema definitions.   │     │
│   │  Health indicators,        │  │                            │  │                        │     │
│   │  throughput gauges,        │  └────────────────────────────┘  └────────────────────────┘     │
│   │  fault counts.             │                                                                 │
│   │                            │                                                                 │
│   └────────────────────────────┘                                                                 │
│                                                                                                  │
│   ┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────┐     │
│   │                            │  │                            │  │                        │     │
│   │  LIVE DATA STREAM          │  │  EVENT LOG                 │  │  ADAPTER CONTROL       │     │
│   │                            │  │                            │  │                        │     │
│   │  Watch messages flowing    │  │  Filterable, searchable,   │  │  Start and stop        │     │
│   │  through the ring buffer   │  │  exportable event log.     │  │  connectors from the   │     │
│   │  in real time.             │  │                            │  │  UI.                   │     │
│   │                            │  │  Filter by connector,      │  │                        │     │
│   │  Path    Value    Time     │  │  severity, time range.     │  │  ┌─────┐  ┌──────┐    │      │
│   │  ────    ─────    ────     │  │                            │  │  │ ▶   │  │  ■   │    │      │
│   │  plc1/   23.5   12:00:01   │  │  Export to CSV or JSON     │  │  │Start│  │ Stop │    │      │
│   │  mqtt/   98.2   12:00:01   │  │  for offline analysis.     │  │  └─────┘  └──────┘    │      │
│   │  opcua/  1420   12:00:02   │  │                            │  │                        │     │
│   │                            │  │                            │  │  Per-connector enable  │     │
│   │  Subscribe to paths via    │  │                            │  │  and disable without   │     │
│   │  WebSocket real-time feed. │  │                            │  │  editing YAML.         │     │
│   │                            │  │                            │  │                        │     │
│   └────────────────────────────┘  └────────────────────────────┘  └────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTION SETUP                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   Point the app at a DIME instance's Admin API to connect.                                       │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────┐                                │   │
│   │   │  Add DIME Instance                                  │                                │   │
│   │   │                                                     │                                │   │
│   │   │  Name:    [ Production Floor  ]                     │                                │   │
│   │   │  Address: [ http://10.0.0.50:9999 ]                 │                                │   │
│   │   │                                                     │                                │   │
│   │   │  [ Test Connection ]   [ Save ]                     │                                │   │
│   │   │                                                     │                                │   │
│   │   └─────────────────────────────────────────────────────┘                                │   │
│   │                                                                                          │   │
│   │   REST API (port 9999) provides:                                                         │   │
│   │     • GET /status    — connector states, health, metrics                                 │   │
│   │     • GET /config    — running YAML configuration                                        │   │
│   │     • GET /cache     — current data cache                                                │   │
│   │     • POST /sinks    — add sinks at runtime                                              │   │
│   │                                                                                          │   │
│   │   WebSocket (port 9998) provides:                                                        │   │
│   │     • Real-time state change events                                                      │   │
│   │     • Live performance telemetry                                                         │   │
│   │     • Ring buffer message stream                                                         │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Connector UX is a client only — it never modifies your DIME instance without your command.     │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
