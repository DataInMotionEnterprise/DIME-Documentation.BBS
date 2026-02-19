```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        27 — Zenith UX                                 │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Fleet management console.                      │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          See everything at a glance.                    │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT IS ZENITH UX?                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   Zenith UX is the desktop application for fleet operators. Built with Tauri + React,            │
│   it connects to Zenith and gives you full visibility and control over every Horizon             │
│   and Connector in the enterprise. Dark industrial theme for control rooms.                      │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FLEET TREE VIEW — HIERARCHICAL NAVIGATION                                                      │
│   ──────────────────────────────────────────                                                     │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────────────────┐   ┌────────────────────────────────────────┐   │   │
│   │   │  FLEET TREE                         │   │  DETAIL PANEL                          │   │   │
│   │   │                                     │   │                                        │   │   │
│   │   │  ▼ Zenith (zenith.acme.com)         │   │  ┌────────────────────────────────┐    │   │   │
│   │   │    ▼ Horizon — Factory Chicago      │   │  │  Factory Chicago / plc_line1   │    │   │   │
│   │   │      ● plc_line1      [CONNECTED]   │   │  │                                │    │   │   │
│   │   │      ● plc_line2      [CONNECTED]   │   │  │  Status:    Connected          │    │   │   │
│   │   │      ○ mqtt_bridge    [FAULTED]     │   │  │  Faults:    0                  │    │   │   │
│   │   │      ● opc_quality   [CONNECTED]    │   │  │  LoopTime:  23 ms              │    │   │   │
│   │   │    ▼ Horizon — Plant Detroit        │   │  │  ReadTime:  12 ms              │    │   │   │
│   │   │      ● fanuc_robot1   [CONNECTED]   │   │  │  Items:     42                 │    │   │   │
│   │   │      ● fanuc_robot2   [CONNECTED]   │   │  │  Accepted:  1,420              │    │   │   │
│   │   │      ○ modbus_hvac    [OFFLINE]     │   │  │                                │    │   │   │
│   │   │    ▶ Horizon — Warehouse Austin     │   │  │  [Config] [Data] [Restart]     │    │   │   │
│   │   │    ▶ Horizon — Lab Singapore        │   │  │                                │    │   │   │
│   │   │                                     │   │  └────────────────────────────────┘    │   │   │
│   │   │  ● = connected   ○ = faulted/off    │   │                                        │   │   │
│   │   │                                     │   │                                        │   │   │
│   │   └─────────────────────────────────────┘   └────────────────────────────────────────┘   │   │
│   │                                                                                          │   │
│   │   Navigate the entire fleet as a tree: Zenith → Horizons → Connectors.                   │   │
│   │   Click any node to see its detail panel on the right.                                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LIVE DASHBOARD — FLEET-WIDE METRICS                                                            │
│   ───────────────────────────────────                                                            │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌────────────┐    │   │
│   │   │                   │  │                   │  │                   │  │            │    │   │
│   │   │   CONNECTED       │  │   FAULTED         │  │   OFFLINE         │  │  STALE     │    │   │
│   │   │                   │  │                   │  │                   │  │            │    │   │
│   │   │      127          │  │        3          │  │        8          │  │     1      │    │   │
│   │   │                   │  │                   │  │                   │  │            │    │   │
│   │   │   ██████████████  │  │   ███             │  │   █████           │  │   █        │    │   │
│   │   │   (green)         │  │   (red)           │  │   (gray)          │  │   (amber)  │    │   │
│   │   │                   │  │                   │  │                   │  │            │    │   │
│   │   └───────────────────┘  └───────────────────┘  └───────────────────┘  └────────────┘    │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────────────────────────────────────────────────────────────────┐   │   │
│   │   │  HORIZON STATUS                                                                  │   │   │
│   │   │                                                                                  │   │   │
│   │   │  Factory Chicago    ● Online    Last check-in: 2s ago    Connectors: 4/4         │   │   │
│   │   │  Plant Detroit      ● Online    Last check-in: 5s ago    Connectors: 2/3         │   │   │
│   │   │  Warehouse Austin   ● Online    Last check-in: 1s ago    Connectors: 8/8         │   │   │
│   │   │  Lab Singapore      ◐ Stale     Last check-in: 45s ago   Connectors: ?/?         │   │   │
│   │   │                                                                                  │   │   │
│   │   └──────────────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                          │   │
│   │   See the health of the entire fleet at a glance. Drill down from any metric.            │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DEEP-DIVE DETAIL — CONFIG / STATUS / DATA                                                      │
│   ──────────────────────────────────────────                                                     │
│                                                                                                  │
│   Click any connector in the tree to see its full detail:                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌─── plc_line1 @ Factory Chicago ──────────────────────────────────────────────────┐   │   │
│   │   │                                                                                  │   │   │
│   │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐                                        │   │   │
│   │   │  │ STATUS   │  │ CONFIG   │  │ DATA     │                                        │   │   │
│   │   │  └──────────┘  └──────────┘  └──────────┘                                        │   │   │
│   │   │                                                                                  │   │   │
│   │   │  STATUS TAB:                          CONFIG TAB:                                │   │   │
│   │   │  ─────────                            ──────────                                 │   │   │
│   │   │  IsConnected:   true                  sources:                                   │   │   │
│   │   │  IsFaulted:     false                   - name: plc_line1                        │   │   │
│   │   │  FaultCount:    0                         connector: SiemensS7                   │   │   │
│   │   │  ConnectCount:  1                         address: 10.0.1.50                     │   │   │
│   │   │  LoopTime:      23 ms                     items:                                 │   │   │
│   │   │  ReadTime:      12 ms                       - name: temperature                  │   │   │
│   │   │  ScriptTime:    4 ms                          address: DB1.DBD0                  │   │   │
│   │   │  Accepted:      1,420                                                            │   │   │
│   │   │                                                                                  │   │   │
│   │   │  DATA TAB:                                                                       │   │   │
│   │   │  ────────                                                                        │   │   │
│   │   │  plc_line1/temperature     72.4    2024-01-15 14:23:01                           │   │   │
│   │   │  plc_line1/pressure        14.7    2024-01-15 14:23:01                           │   │   │
│   │   │  plc_line1/speed          1200     2024-01-15 14:23:01                           │   │   │
│   │   │                                                                                  │   │   │
│   │   └──────────────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   REMOTE YAML EDITING — PUSH CHAIN                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   Edit a connector's YAML from the console. Changes flow through the entire chain.               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐    │   │
│   │   │             │     │             │     │             │     │                     │    │   │
│   │   │  ZENITH UX  │────▶│   ZENITH    │────▶│  HORIZON    │────▶│  DIME CONNECTOR     │    │   │
│   │   │             │     │             │     │             │     │                     │    │   │
│   │   │  Edit YAML  │     │  Queue      │     │  Pick up    │     │  POST /config/yaml  │    │   │
│   │   │  Click Save │     │  set_config │     │  on next    │     │  Hot reload         │    │   │
│   │   │             │     │  task       │     │  check-in   │     │  Zero downtime      │    │   │
│   │   │             │     │             │     │             │     │                     │    │   │
│   │   └─────────────┘     └─────────────┘     └─────────────┘     └─────────────────────┘    │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   1. Operator edits YAML in the built-in editor                                          │   │
│   │   2. Zenith queues a set_connector_config task for the target Horizon                    │   │
│   │   3. Horizon picks up the task on its next check-in                                      │   │
│   │   4. Horizon pushes the config to the Connector via its Admin REST API                   │   │
│   │   5. Connector hot-reloads — no restart, no downtime                                     │   │
│   │   6. Result reported back through the chain to Zenith UX                                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TASK MANAGEMENT — ISSUE AND TRACK                                                              │
│   ─────────────────────────────────                                                              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   MANUAL TASK PANEL                                                                      │   │
│   │   ─────────────────                                                                      │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────────────────────────────────────────────────────────────────┐   │   │
│   │   │                                                                                  │   │   │
│   │   │  Target:   Horizon — Factory Chicago                                             │   │   │
│   │   │  Task:     [get_connector_status ▼]                                              │   │   │
│   │   │  Scope:    [All Connectors ▼]                                                    │   │   │
│   │   │                                                                                  │   │   │
│   │   │  [  Issue Task  ]                                                                │   │   │
│   │   │                                                                                  │   │   │
│   │   └──────────────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                          │   │
│   │   TASK HISTORY                                                                           │   │
│   │   ────────────                                                                           │   │
│   │                                                                                          │   │
│   │   ┌────────┬──────────────────────┬──────────────┬──────────┬───────────────────────┐    │   │
│   │   │ STATUS │ TASK                 │ HORIZON      │ TIME     │ RESULT                │    │   │
│   │   ├────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┤    │   │
│   │   │  ✓     │ get_connector_status │ Chicago      │ 14:23:05 │ 4 connectors OK       │    │   │
│   │   ├────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┤    │   │
│   │   │  ✓     │ set_connector_config │ Detroit      │ 14:22:58 │ Config applied        │    │   │
│   │   ├────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┤    │   │
│   │   │  ⏳    │ restart_connector    │ Austin       │ 14:23:10 │ Pending check-in      │    │   │
│   │   └────────┴──────────────────────┴──────────────┴──────────┴───────────────────────┘    │   │
│   │                                                                                          │   │
│   │   Issue tasks manually and track their execution in real time.                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   OPERATOR WORKFLOW                                                                              │
│   ─────────────────                                                                              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │    ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────────────┐   │   │
│   │    │          │         │          │         │          │         │                  │   │   │
│   │    │ OPERATOR │────────▶│ ZENITH   │────────▶│ HORIZON  │────────▶│ DIME CONNECTORS  │   │   │
│   │    │          │         │ UX       │         │ SERVER   │         │ GATEWAYS         │   │   │
│   │    │  views   │         │          │         │          │         │                  │   │   │
│   │    │  edits   │         │ queries  │         │ forwards │         │ Factory Chicago  │   │   │
│   │    │  issues  │         │ Zenith   │         │ check-in │         │ Plant Detroit    │   │   │
│   │    │  tasks   │         │ API      │         │ tasks    │         │ Warehouse Austin │   │   │
│   │    │          │         │          │         │          │         │ Lab Singapore    │   │   │
│   │    └──────────┘         └──────────┘         └──────────┘         └──────────────────┘   │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │    Features:   Configurable polling rates per view (dashboard fast, config slow)         │   │
│   │                Dark industrial theme for control rooms and operations centers            │   │
│   │                Cross-platform: Windows, macOS, Linux (Tauri + React)                     │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
