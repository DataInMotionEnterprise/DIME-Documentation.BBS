```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        25 — Horizon Gateway                           │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Site manager. Bridges edge to cloud.           │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          No inbound firewall.                           │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT IS HORIZON?                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   Horizon is the site-level gateway that manages all DIME Connectors at a physical location.     │
│   It bridges the factory floor (edge) to the cloud (Zenith) without requiring any inbound        │
│   firewall rules. One Horizon per site. Dozens of Connectors per Horizon.                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PULL-BASED ARCHITECTURE — NO INBOUND FIREWALL RULES                                            │
│   ────────────────────────────────────────────────────                                           │
│                                                                                                  │
│   Horizon always reaches OUT. Zenith never reaches in. No ports to open on site.                 │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   FACTORY SITE (behind firewall)                              CLOUD                      │   │
│   │   ─────────────────────────────                               ─────                      │   │
│   │                                                                                          │   │
│   │   ┌────────────┐                                                                         │   │
│   │   │ DIME #1    │──┐                                          ┌──────────────┐            │   │
│   │   │ (PLC)      │  │                                          │              │            │   │
│   │   └────────────┘  │     ┌──────────────────┐    OUTBOUND     │    ZENITH    │            │   │
│   │                    ├────▶│                  │ ══════════════▶ │              │            │  │
│   │   ┌────────────┐  │     │    HORIZON       │    HTTPS only   │  Fleet C2    │            │   │
│   │   │ DIME #2    │──┤     │    Gateway       │ ◀══════════════ │              │            │   │
│   │   │ (MQTT)     │  │     │                  │    responses    │              │            │   │
│   │   └────────────┘  │     └──────────────────┘                 └──────────────┘            │   │
│   │                    │           │                                                          │  │
│   │   ┌────────────┐  │           │ Horizon calls each                                       │   │
│   │   │ DIME #3    │──┘           │ Connector's Admin API                                    │   │
│   │   │ (OPC-UA)   │              │ locally (localhost)                                      │   │
│   │   └────────────┘              ▼                                                          │   │
│   │                                                                                          │   │
│   │   ██████████████████████████████████████████████████████████                             │   │
│   │   █  FIREWALL — NO INBOUND RULES NEEDED — ALL OUTBOUND  █                                │   │
│   │   ██████████████████████████████████████████████████████████                             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HORIZON CONFIGURATION                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   zenith:                                                                                │   │
│   │     uri: https://zenith.example.com         ◀── Zenith server address                    │   │
│   │     key: c1041c3a-a114-40c6-...             ◀── Unique authentication key                │   │
│   │     checkin_interval: !!int 10000           ◀── Check-in every 10 seconds                │   │
│   │                                                                                          │   │
│   │   connector:                                                                             │   │
│   │     - id: plc_collector                     ◀── Friendly name for this connector         │   │
│   │       admin_http_uri: http://localhost:9999  ◀── REST API for this DIME instance         │   │
│   │       admin_ws_uri: ws://localhost:9998      ◀── WebSocket for live data                 │   │
│   │                                                                                          │   │
│   │     - id: mqtt_bridge                                                                    │   │
│   │       admin_http_uri: http://localhost:9997                                              │   │
│   │       admin_ws_uri: ws://localhost:9996                                                  │   │
│   │                                                                                          │   │
│   │   Horizon knows each local DIME instance by its Admin API ports.                         │   │
│   │   Multiple instances on one machine use different port pairs.                            │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CHECK-IN CYCLE — 5 STEPS                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   Every checkin_interval milliseconds, Horizon runs this cycle:                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐   │    │
│   │   │             │     │             │     │             │     │                     │   │    │
│   │   │ 1. CONTACT  │────▶│ 2. SEND     │────▶│ 3. RECEIVE  │────▶│ 4. EXECUTE          │   │    │
│   │   │    ZENITH   │     │    STATUS   │     │    TASKS    │     │    LOCALLY          │   │    │
│   │   │             │     │             │     │             │     │                     │   │    │
│   │   └─────────────┘     └─────────────┘     └─────────────┘     └──────────┬──────────┘   │    │
│   │                                                                          │              │    │
│   │         Horizon calls          Sends summary        Zenith returns       │              │    │
│   │         POST /horizon/         of all local         pending task         │              │    │
│   │         {key}/checkin          connector health     queue for this       ▼              │    │
│   │                                                     Horizon                             │    │
│   │                                                                   ┌─────────────────┐   │    │
│   │                                                                   │                 │   │    │
│   │         ┌──────────────────────────────────────────────────────── │ 5. REPORT       │   │    │
│   │         │                                                         │    RESULTS      │   │    │
│   │         │  Horizon posts task results back to Zenith              │                 │   │    │
│   │         │  POST /horizon/{key}/task/{id}                          └─────────────────┘   │    │
│   │         ▼                                                                                │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   The cycle repeats on a timer. Missed check-ins cause Zenith to flag the site as stale.         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SUPPORTED TASKS                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   Tasks are commands that Zenith queues for Horizon to execute on local Connectors.              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   CONNECTOR TASKS                          HORIZON SELF-MANAGEMENT                       │   │
│   │   ───────────────                          ────────────────────────                      │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────┬──────────────────────────────────────────┐                    │   │
│   │   │ Task                 │ Description                              │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ get_connector_status │ Retrieve health, metrics, fault info     │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ get_connector_config │ Retrieve current running YAML config     │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ set_connector_config │ Push new YAML config (hot reload)        │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ restart_connector    │ Restart the DIME Connector service       │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ get_connector_data   │ Retrieve current data snapshot           │                    │   │
│   │   └──────────────────────┴──────────────────────────────────────────┘                    │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────┬──────────────────────────────────────────┐                    │   │
│   │   │ Task                 │ Description                              │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ get_horizon_config   │ Retrieve Horizon's own configuration     │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ set_horizon_config   │ Update Horizon's configuration remotely  │                    │   │
│   │   ├──────────────────────┼──────────────────────────────────────────┤                    │   │
│   │   │ restart_horizon      │ Restart the Horizon service itself       │                    │   │
│   │   └──────────────────────┴──────────────────────────────────────────┘                    │   │
│   │                                                                                          │   │
│   │   Horizon executes tasks by calling the Connector's Admin REST API locally.              │   │
│   │   Results are reported back to Zenith on the next check-in.                              │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DEPLOYMENT OPTIONS                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐                    │    │
│   │   │                  │   │                  │   │                  │                    │    │
│   │   │  WINDOWS         │   │  LINUX           │   │  DOCKER          │                    │    │
│   │   │  SERVICE         │   │  SYSTEMD         │   │  CONTAINER       │                    │    │
│   │   │                  │   │                  │   │                  │                    │    │
│   │   │  Horizon.exe     │   │  systemctl       │   │  docker run      │                    │    │
│   │   │  install         │   │  start horizon   │   │  -v config:/app  │                    │    │
│   │   │                  │   │                  │   │                  │                    │    │
│   │   └──────────────────┘   └──────────────────┘   └──────────────────┘                    │    │
│   │                                                                                          │   │
│   │   Horizon runs alongside DIME Connectors on the same machine or a dedicated gateway.     │   │
│   │   It only needs outbound HTTPS access to Zenith and local access to Connector APIs.      │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
