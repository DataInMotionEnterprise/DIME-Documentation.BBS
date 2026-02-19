```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        26 — Zenith Cloud                              │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Fleet command center.                          │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Hundreds of sites. One dashboard.              │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT IS ZENITH?                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   Zenith is the centralized cloud command center for the entire DIME fleet.                      │
│   It manages hundreds of Horizons and thousands of Connectors from a single server.              │
│   Every site checks in. Zenith sees everything.                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ARCHITECTURE — ASP.NET CORE + MONGODB                                                          │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │                          ┌──────────────────────────────────────┐                        │   │
│   │                          │         DIME ZENITH SERVER           │                        │   │
│   │                          │                                      │                        │   │
│   │                          │   ASP.NET Core Minimal API           │                        │   │
│   │                          │   Key-based auth per Horizon         │                        │   │
│   │                          │   Automatic stale detection          │                        │   │
│   │                          │   Task queue management              │                        │   │
│   │                          │                                      │                        │   │
│   │                          └─────────────────┬────────────────────┘                        │   │
│   │                                            │                                             │   │
│   │                                            │ reads / writes                              │   │
│   │                                            ▼                                             │   │
│   │                          ┌──────────────────────────────────────┐                        │   │
│   │                          │            MONGODB                   │                        │   │
│   │                          │                                      │                        │   │
│   │                          │   Fleet-wide persistent storage      │                        │   │
│   │                          │   Scales to thousands of documents   │                        │   │
│   │                          │                                      │                        │   │
│   │                          └──────────────────────────────────────┘                        │   │
│   │                                            ▲                                             │   │
│   │                                            │                                             │   │
│   │          ┌─────────────────────────────────┼─────────────────────────────────┐           │   │
│   │          │                                 │                                 │           │   │
│   │   ┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐    │    │
│   │   │              │                 │              │                 │              │    │    │
│   │   │  HORIZON     │    check-in     │  HORIZON     │    check-in     │  HORIZON     │    │    │
│   │   │  Site A      │ ──────────────▶ │  Site B      │ ─────────────▶  │  Site C      │    │    │
│   │   │  key: abc... │                 │  key: def... │                 │  key: ghi... │    │    │
│   │   │              │                 │              │                 │              │    │    │
│   │   └──────────────┘                 └──────────────┘                 └──────────────┘    │    │
│   │                                                                                          │   │
│   │   Each Horizon authenticates with a unique key. No passwords. No tokens to rotate.       │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MONGODB COLLECTIONS                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Six collections store the entire fleet state:                                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌────────────────────────┐      ┌────────────────────────────────┐                    │    │
│   │   │                        │      │                                │                    │    │
│   │   │  Horizons              │      │  Connectors                    │                    │    │
│   │   │                        │      │                                │                    │    │
│   │   │  Site metadata         │      │  Per-connector metadata        │                    │    │
│   │   │  Last check-in time    │      │  across all sites              │                    │    │
│   │   │  Horizon version       │      │  Connector type and name       │                    │    │
│   │   │                        │      │                                │                    │    │
│   │   └────────────────────────┘      └────────────────────────────────┘                    │    │
│   │                                                                                          │   │
│   │   ┌────────────────────────┐      ┌────────────────────────────────┐                    │    │
│   │   │                        │      │                                │                    │    │
│   │   │  Connectors-           │      │  Connectors-Status             │                    │    │
│   │   │  Configuration         │      │                                │                    │    │
│   │   │                        │      │  Live health and               │                    │    │
│   │   │  YAML configs stored   │      │  performance metrics           │                    │    │
│   │   │  centrally per         │      │  IsConnected, IsFaulted        │                    │    │
│   │   │  connector             │      │  ReadTime, LoopTime            │                    │    │
│   │   │                        │      │                                │                    │    │
│   │   └────────────────────────┘      └────────────────────────────────┘                    │    │
│   │                                                                                          │   │
│   │   ┌────────────────────────┐      ┌────────────────────────────────┐                    │    │
│   │   │                        │      │                                │                    │    │
│   │   │  Connectors-Data       │      │  Tasks                         │                    │    │
│   │   │                        │      │                                │                    │    │
│   │   │  Current data points   │      │  Task queue per Horizon        │                    │    │
│   │   │  Last known values     │      │  Pending, executing, done      │                    │    │
│   │   │  per connector         │      │  Results stored on completion  │                    │    │
│   │   │                        │      │                                │                    │    │
│   │   └────────────────────────┘      └────────────────────────────────┘                    │    │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   API ENDPOINTS                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   Zenith exposes two endpoints. Horizons are the only clients.                                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌────────┬──────────────────────────────────┬──────────────────────────────────────┐   │   │
│   │   │ METHOD │ PATH                             │ DESCRIPTION                          │   │   │
│   │   ├────────┼──────────────────────────────────┼──────────────────────────────────────┤   │   │
│   │   │  POST  │ /horizon/{key}/checkin           │ Horizon check-in: send status,       │   │   │
│   │   │        │                                  │ receive pending tasks                │   │   │
│   │   ├────────┼──────────────────────────────────┼──────────────────────────────────────┤   │   │
│   │   │  POST  │ /horizon/{key}/task/{id}         │ Report task execution results        │   │   │
│   │   │        │                                  │ back to Zenith                       │   │   │
│   │   └────────┴──────────────────────────────────┴──────────────────────────────────────┘   │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   CHECK-IN FLOW:                                                                         │   │
│   │                                                                                          │   │
│   │     Horizon ──POST /checkin──▶ Zenith                                                    │   │
│   │       │                          │                                                       │   │
│   │       │  { connector_status }    │  Updates Horizons, Connectors-Status,                 │   │
│   │       │                          │  Connectors-Data collections                          │   │
│   │       │                          │                                                       │   │
│   │       │   ◀── 200 OK ─────────── │  Returns: { tasks: [ ... ] }                          │   │
│   │       │                          │                                                       │   │
│   │       │                                                                                  │   │
│   │     Horizon ──POST /task/{id}──▶ Zenith                                                 │    │
│   │       │                          │                                                       │   │
│   │       │  { task_result }         │  Marks task complete, stores result                   │   │
│   │       │                          │                                                       │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   AUTOMATIC STALE DETECTION                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   Zenith watches for Horizons that stop checking in.                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Normal:     Horizon checks in every 10s  ──▶  status = ONLINE                          │   │
│   │                                                                                          │   │
│   │   Missed:     No check-in for 3x interval  ──▶  status = STALE                           │   │
│   │                                                                                          │   │
│   │   Recovery:   Horizon reconnects            ──▶  Zenith auto-queues data-refresh tasks   │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   When a stale Horizon comes back online, Zenith automatically generates:                │   │
│   │                                                                                          │   │
│   │     ┌──────────────────────────┐                                                        │    │
│   │     │ get_connector_status     │  ◀── refresh health for all connectors                 │    │
│   │     ├──────────────────────────┤                                                        │    │
│   │     │ get_connector_config     │  ◀── refresh configs in case of local changes          │    │
│   │     ├──────────────────────────┤                                                        │    │
│   │     │ get_connector_data       │  ◀── refresh current data snapshots                    │    │
│   │     └──────────────────────────┘                                                        │    │
│   │                                                                                          │   │
│   │   No manual intervention needed. Zenith self-heals its view of the fleet.                │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   KEY-BASED AUTHENTICATION                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Every Horizon is assigned a unique GUID key at provisioning time.                      │   │
│   │                                                                                          │   │
│   │     Horizon Site A  ──▶  key: c1041c3a-a114-40c6-9c01-ee8e3b83596a                       │   │
│   │     Horizon Site B  ──▶  key: 7f2b8d4e-3c19-4a5f-b6d8-1e9f0a2c3d4e                       │   │
│   │     Horizon Site C  ──▶  key: a5e7c9b1-d3f2-4e6a-8c0b-2d4f6a8e0c1b                       │   │
│   │                                                                                          │   │
│   │   The key is included in every API call as a URL parameter:                              │   │
│   │     POST /horizon/c1041c3a-a114-40c6-9c01-ee8e3b83596a/checkin                           │   │
│   │                                                                                          │   │
│   │   Benefits:                                                                              │   │
│   │     - No username/password management                                                    │   │
│   │     - No token expiry or refresh flows                                                   │   │
│   │     - One key per site — revoke by deleting the Horizon record                           │   │
│   │     - Key stays in the Horizon config file — never transmitted in headers                │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FLEET SCALE                                                                                    │
│   ───────────                                                                                    │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │                         ┌────────────────────────────┐                                   │   │
│   │                         │                            │                                   │   │
│   │                         │    1 ZENITH instance       │                                   │   │
│   │                         │                            │                                   │   │
│   │                         └─────────────┬──────────────┘                                   │   │
│   │                                       │                                                  │   │
│   │                    ┌──────────────────┼──────────────────┐                               │   │
│   │                    │                  │                  │                               │   │
│   │              ┌─────┴─────┐     ┌──────┴─────┐    ┌──────┴─────┐                         │    │
│   │              │ HORIZON   │     │ HORIZON    │    │ HORIZON    │     ...100s more         │   │
│   │              │ Factory 1 │     │ Factory 2  │    │ Warehouse  │                          │   │
│   │              └─────┬─────┘     └──────┬─────┘    └──────┬─────┘                         │    │
│   │                    │                  │                  │                               │   │
│   │               ┌────┼────┐        ┌────┼────┐       ┌────┼────┐                          │    │
│   │               │    │    │        │    │    │       │    │    │                          │    │
│   │              CON  CON  CON     CON  CON  CON    CON  CON  CON   ...1000s more            │   │
│   │                                                                                          │   │
│   │   1 Zenith  ──▶  Hundreds of Horizons  ──▶  Thousands of Connectors                      │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
