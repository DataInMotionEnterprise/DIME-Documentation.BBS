```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        02 — The DIME Ecosystem                       │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Three tiers. Two apps.                         │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          One unified platform.                          │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE DIME PLATFORM                                                                              │
│   ─────────────────                                                                              │
│                                                                                                  │
│   Three products and two desktop apps form one unified platform for                              │
│   industrial data collection, site management, and fleet-wide command.                           │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│                          ┌──────────────────────────────────────────┐                            │
│                          │          DIME ZENITH  (Cloud)            │                            │
│                          │                                          │                            │
│                          │   Centralized fleet command & control    │   ┌──────────────────┐     │
│                          │   MongoDB-backed configuration store     │   │   Zenith UX      │     │
│                          │   Manages 100s of Horizons               │   │                  │     │
│                          │   Web dashboard + REST API               │   │   Fleet-wide     │     │
│                          │                                          │   │   monitoring     │     │
│                          └─────────────────────┬────────────────────┘   │   desktop app    │     │
│                                                │                        │                  │     │
│                               Horizon PULLS    │  config, updates,      └──────────────────┘     │
│                               from Zenith      │  firmware, commands                             │
│                               (no inbound      │                                                 │
│                                firewall rules) ▼                                                 │
│                                                                                                  │
│                          ┌──────────────────────────────────────────┐                            │
│                          │          DIME HORIZON  (Gateway)         │                            │
│                          │                                          │                            │
│                          │   Site-level gateway & connector mgr     │                            │
│                          │   Bridges edge to cloud                  │                            │
│                          │   Manages dozens of Connectors per site  │                            │
│                          │   Pulls config from Zenith on check-in   │                            │
│                          │                                          │                            │
│                          └─────────────────────┬────────────────────┘                            │
│                                                │                                                 │
│                               Horizon pushes   │  config, schedules,                             │
│                               to Connectors    │  start/stop commands                            │
│                                                ▼                                                 │
│                                                                                                  │
│                          ┌──────────────────────────────────────────┐                            │
│                          │          DIME CONNECTOR  (Edge)          │   ┌──────────────────┐     │
│                          │                                          │   │   Connector UX   │     │
│                          │   Collects data from 50+ protocols       │   │                  │     │
│                          │   Runs on the factory floor              │   │   Local mgmt     │     │
│                          │   YAML-configured sources & sinks        │   │   desktop app    │     │
│                          │   Disruptor ring buffer at the core      │   │                  │     │
│                          │                                          │   └──────────────────┘     │
│                          └──────────────────────────────────────────┘                            │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   COMMUNICATION MODEL                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   All communication is pull-based from the edge outward.                                         │
│   No inbound firewall rules required at any tier.                                                │
│                                                                                                  │
│     Connector ◀────────────── Horizon ──────────────▶ Zenith                                    │
│          │    pushes config        │   pulls config      │                                       │
│          │    & commands           │   & updates          │                                       │
│          │                         │                      │                                       │
│          ▼                         ▼                      ▼                                       │
│     Factory Floor             Site Gateway           Cloud C2                                    │
│     50+ protocols             Bridges edge           Fleet-wide                                  │
│     sub-ms latency            to cloud               command                                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ENTERPRISE SCALE                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│    ┌────────┐         ┌────────┐  ┌────────┐  ┌────────┐         ┌─────┐┌─────┐┌─────┐          │
│    │        │         │        │  │        │  │        │         │     ││     ││     │          │
│    │ ZENITH │────────▶│HORIZON │  │HORIZON │  │HORIZON │────────▶│ CON ││ CON ││ CON │          │
│    │        │    ...  │  Site1 │  │  Site2 │  │  SiteN │   ...  │     ││     ││     │          │
│    │ 1 inst │         │        │  │        │  │        │         │     ││     ││     │          │
│    └────────┘         └───┬────┘  └───┬────┘  └───┬────┘         └─────┘└─────┘└─────┘          │
│                           │           │           │                                              │
│                      10-50 CON   10-50 CON   10-50 CON                                          │
│                      per site    per site    per site                                            │
│                                                                                                  │
│    1 Zenith  ──▶  100s of Horizons  ──▶  Dozens of Connectors per Horizon                       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
