```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        28 — Edge to Cloud                             │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          The big picture. Three tiers                   │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          working together.                              │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THREE-TIER ARCHITECTURE                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   Data flows UP. Commands flow DOWN. Three tiers, one platform.                                  │
│                                                                                                  │
│              COMMANDS ▼                              ▲ DATA                                      │
│              (config, tasks, firmware)               (telemetry, status, metrics)                │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │   TIER 3 — CLOUD                                                                       │     │
│   │                                                                                        │     │
│   │   ┌─────────────────────────────────┐    ┌─────────────────────────────────┐           │     │
│   │   │       DIME ZENITH               │    │       ZENITH UX                 │           │     │
│   │   │                                 │    │                                 │           │     │
│   │   │  Centralized fleet management   │    │  Desktop app for operators      │           │     │
│   │   │  MongoDB-backed config store    │◄──▶│  Fleet-wide dashboard           │           │     │
│   │   │  Health monitoring + stale det  │    │  Push config, view health       │           │     │
│   │   │  REST API + Web dashboard       │    │  Manage firmware updates        │           │     │
│   │   │                                 │    │                                 │           │     │
│   │   │  Scale: 1 instance globally     │    │  Connects via REST + WebSocket  │           │     │
│   │   │                                 │    │                                 │           │     │
│   │   └─────────────────┬───────────────┘    └─────────────────────────────────┘           │     │
│   │                     │                                                                  │     │
│   └─────────────────────┼──────────────────────────────────────────────────────────────────┘     │
│                         │                                                                        │
│                         │  Horizon PULLS from Zenith                                             │
│                         │  (no inbound firewall rules)                                           │
│                         │  Config, firmware, commands                                            │
│                         ▼                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │   TIER 2 — GATEWAY                                                                     │     │
│   │                                                                                        │     │
│   │   ┌─────────────────────────────────────────────────────────────────────────────────┐  │     │
│   │   │       DIME HORIZON  (one per site: factory, plant, warehouse)                   │  │     │
│   │   │                                                                                 │  │     │
│   │   │  Site-level connector manager        Pull-based bridge to Zenith                │  │     │
│   │   │  Manages all local Connectors        Executes remote tasks + updates            │  │     │
│   │   │  Pushes config down to edge          Reports health + status upstream           │  │     │
│   │   │                                                                                 │  │     │
│   │   │  Scale: ~50 Horizons across all sites                                           │  │     │
│   │   │                                                                                 │  │     │
│   │   └──────────────────────────────┬──────────────────────────────────────────────────┘  │     │
│   │                                  │                                                     │     │
│   └──────────────────────────────────┼─────────────────────────────────────────────────────┘     │
│                                      │                                                           │
│                                      │  Horizon pushes config + commands                         │
│                                      │  to local Connectors                                      │
│                                      ▼                                                           │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │   TIER 1 — EDGE                                                                        │     │
│   │                                                                                        │     │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │     │
│   │   │DIME CONNECTOR │  │DIME CONNECTOR │  │DIME CONNECTOR │  │DIME CONNECTOR │  ...      │     │
│   │   │               │  │               │  │               │  │               │           │     │
│   │   │ OPC-UA, S7,   │  │ MQTT, AMQP,   │  │ Modbus, FANUC │  │ HTTP, SNMP,   │           │     │
│   │   │ EtherNet/IP   │  │ SparkplugB    │  │ Beckhoff ADS  │  │ Custom Script │           │     │
│   │   │               │  │               │  │               │  │               │           │     │
│   │   │ Lua normalize │  │ Lua normalize │  │ Lua normalize │  │ Lua normalize │           │     │
│   │   │ MQTT/SHDR/HTTP│  │ MQTT/SHDR/HTTP│  │ MQTT/SHDR/HTTP│  │ MQTT/SHDR/HTTP│           │     │
│   │   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │     │
│   │           │                  │                  │                  │                   │     │
│   │           ▼                  ▼                  ▼                  ▼                   │     │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │     │
│   │   │  PLC / CNC  │  │  Sensors /  │  │  Robots /   │  │  Cameras /  │                   │     │
│   │   │  Controllers│  │  Gateways   │  │  Actuators  │  │  Meters     │                   │     │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                   │     │
│   │                                                                                        │     │
│   │   Scale: ~500 Connectors, ~50,000 data points                                          │     │
│   │   Platforms: Windows, Linux, ARM64, Docker                                             │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DATA FLOWS UP                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   Every data point travels from physical device to cloud dashboard:                              │
│                                                                                                  │
│    ┌─────────┐      ┌───────────┐      ┌───────────┐      ┌─────────┐      ┌───────────┐         │
│    │ DEVICE  │      │ CONNECTOR │      │  HORIZON  │      │ ZENITH  │      │ ZENITH UX │         │
│    │         │─────▶│           │─────▶│           │─────▶│         │─────▶│           │         │
│    │ PLC,    │ OPC  │ Read,     │ MQTT │ Aggregate │ HTTPS│ Store,  │ WS   │ Dashboard │         │
│    │ sensor, │ S7   │ transform,│ SHDR │ forward,  │ pull │ monitor,│ REST │ for ops   │         │
│    │ robot   │ Mod  │ publish   │ HTTP │ report    │      │ alert   │      │ team      │         │
│    └─────────┘      └───────────┘      └───────────┘      └─────────┘      └───────────┘         │
│                                                                                                  │
│    50+ protocols     Lua scripts         Site gateway       MongoDB          Fleet-wide          │
│    on factory floor  normalize data      bridges edge       stores all       monitoring          │
│                                          to cloud           state            and control         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   COMMANDS FLOW DOWN                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   Configuration changes and tasks propagate from cloud to edge:                                  │
│                                                                                                  │
│    ┌───────────┐      ┌─────────┐      ┌───────────┐      ┌───────────┐                          │
│    │ ZENITH UX │      │ ZENITH  │      │  HORIZON  │      │ CONNECTOR │                          │
│    │           │─────▶│         │─────▶│           │─────▶│           │                          │
│    │ Operator  │ REST │ Queue   │ pull │ Apply     │ push │ Restart   │                          │
│    │ changes   │      │ command │      │ locally,  │      │ with new  │                          │
│    │ config    │      │ for     │      │ push to   │      │ config    │                          │
│    │           │      │ Horizon │      │ connector │      │           │                          │
│    └───────────┘      └─────────┘      └───────────┘      └───────────┘                          │
│                                                                                                  │
│    Operator publishes   Zenith holds    Horizon pulls on    Connector gets                       │
│    new YAML config      until Horizon   next check-in       new config and                       │
│    via Zenith UX        checks in       and applies         restarts cleanly                     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ENTERPRISE SCALE                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│    ┌──────────┐                                                                                  │
│    │  ZENITH  │  1 instance                                                                      │
│    └────┬─────┘                                                                                  │
│         │                                                                                        │
│    ┌────┴──────────────────────────────────────────────────────┐                                 │
│    │              ~50 Horizons (one per site)                  │                                 │
│    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  ┌────────┐  │                                 │
│    │  │Site #1 │ │Site #2 │ │Site #3 │ │  ...   │  │Site #50│  │                                 │
│    │  └───┬────┘ └───┬────┘ └───┬────┘ └────────┘  └───┬────┘  │                                 │
│    └──────┼──────────┼──────────┼──────────────────────┼───────┘                                 │
│           │          │          │                      │                                         │
│      10 connectors   │     10 connectors           10 connectors                                 │
│      100 data pts    │     100 data pts            100 data pts                                  │
│                 10 connectors                                                                    │
│                 100 data pts                                                                     │
│                                                                                                  │
│    Total:  1 Zenith  x  50 Horizons  x  10 Connectors  x  100 Items  =  50,000 data points       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
