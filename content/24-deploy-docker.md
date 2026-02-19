```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        24 — Docker Deployment                         │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Containerized. Compose.                        │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Cloud and edge ready.                          │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DOCKER RUN — QUICK START                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   One command to run DIME in a container. Mount your configs, expose your ports.                 │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   $ docker run -d \                                                                      │   │
│   │       --name dime \                                                                      │   │
│   │       -v /path/to/configs:/app/Configs \                                                 │   │
│   │       -p 9999:9999 \                         # REST API                                  │   │
│   │       -p 9998:9998 \                         # WebSocket                                 │   │
│   │       --restart unless-stopped \                                                         │   │
│   │       ladder99/dime:latest                                                               │   │
│   │                                                                                          │   │
│   │   ┌─── Docker Host ──────────────────────────────────────────────────────────────┐       │   │
│   │   │                                                                              │       │   │
│   │   │   ┌─── DIME Container ─────────────────────────────────────────────────┐     │       │   │
│   │   │   │                                                                    │     │       │   │
│   │   │   │   /app/DIME              ← DIME binary                             │     │       │   │
│   │   │   │   /app/Configs/          ← mounted from host                       │     │       │   │
│   │   │   │   /app/Logs/             ← log output                              │     │       │   │
│   │   │   │                                                                    │     │       │   │
│   │   │   │   :9999 ─── REST API     :9998 ─── WebSocket                       │     │       │   │
│   │   │   │                                                                    │     │       │   │
│   │   │   └────────────────────────────────────────────────────────────────────┘     │       │   │
│   │   │         │              │                                                     │       │   │
│   │   │     Volumes        Port Mapping                                              │       │   │
│   │   │   /path/to/configs   9999 → 9999                                             │       │   │
│   │   │                      9998 → 9998                                             │       │   │
│   │   │                                                                              │       │   │
│   │   └──────────────────────────────────────────────────────────────────────────────┘       │   │
│   │                                                                                          │   │
│   │   Non-root execution by default. Restart policy keeps DIME running after reboots.        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DOCKER COMPOSE — MULTI-CONTAINER STACK                                                         │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   Run DIME alongside InfluxDB, Grafana, or any companion service.                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   # docker-compose.yml                                                                   │   │
│   │   version: '3.8'                                                                         │   │
│   │   services:                                                                              │   │
│   │                                                                                          │   │
│   │     dime:                                                                                │   │
│   │       image: ladder99/dime:latest                                                        │   │
│   │       volumes:                                                                           │   │
│   │         - ./configs:/app/Configs                                                         │   │
│   │         - ./logs:/app/Logs                                                               │   │
│   │       ports:                                                                             │   │
│   │         - "9999:9999"                          # REST API                                │   │
│   │         - "9998:9998"                          # WebSocket                               │   │
│   │         - "7878:7878"                          # SHDR (if needed)                        │   │
│   │         - "1883:1883"                          # MQTT (if needed)                        │   │
│   │       restart: unless-stopped                                                            │   │
│   │                                                                                          │   │
│   │     influxdb:                                                                            │   │
│   │       image: influxdb:2                                                                  │   │
│   │       ports:                                                                             │   │
│   │         - "8086:8086"                                                                    │   │
│   │       volumes:                                                                           │   │
│   │         - influx-data:/var/lib/influxdb2                                                 │   │
│   │                                                                                          │   │
│   │     grafana:                                                                             │   │
│   │       image: grafana/grafana:latest                                                      │   │
│   │       ports:                                                                             │   │
│   │         - "3000:3000"                                                                    │   │
│   │       volumes:                                                                           │   │
│   │         - grafana-data:/var/lib/grafana                                                  │   │
│   │                                                                                          │   │
│   │   volumes:                                                                               │   │
│   │     influx-data:                                                                         │   │
│   │     grafana-data:                                                                        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   ┌─── Compose Stack ────────────────────────────────────────────────────────────────────┐       │
│   │                                                                                      │       │
│   │   ┌─────────┐       ┌─────────┐       ┌─────────┐                                    │       │
│   │   │  DIME   │──────▶│ InfluxDB│──────▶│ Grafana │                                    │       │
│   │   │  :9999  │ write │  :8086  │ query │  :3000  │                                    │       │
│   │   │  :9998  │       │         │       │         │                                    │       │
│   │   └─────────┘       └─────────┘       └─────────┘                                    │       │
│   │       │                  │                  │                                        │       │
│   │    configs/          influx-data         grafana-data                                │       │
│   │    (bind mount)      (volume)            (volume)                                    │       │
│   │                                                                                      │       │
│   └──────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
│   $ docker compose up -d                       # start the stack                                 │
│   $ docker compose logs -f dime                # follow DIME logs                                │
│   $ docker compose down                        # stop and remove                                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   VOLUME MOUNTS & PORT MAPPING                                                                   │
│   ────────────────────────────                                                                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   VOLUMES                                                                                │   │
│   │   ───────                                                                                │   │
│   │   /app/Configs   ← Mount your YAML files here. DIME reads *.yaml on startup.             │   │
│   │   /app/Logs      ← Optional. Mount to persist logs outside the container.                │   │
│   │   /app/Scripts   ← Optional. Mount external Lua/Python scripts.                          │   │
│   │                                                                                          │   │
│   │   PORTS                                                                                  │   │
│   │   ─────                                                                                  │   │
│   │   9999           ← REST Admin API (always needed)                                        │   │
│   │   9998           ← WebSocket feed (for dashboards / UX)                                  │   │
│   │   7878           ← SHDR server (if running MTConnect agent)                              │   │
│   │   1883           ← MQTT broker (if DIME acts as broker)                                  │   │
│   │   8092           ← WebSocketServer sink (custom port)                                    │   │
│   │                                                                                          │   │
│   │   Map only the ports your configuration actually uses.                                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ARM64 — RASPBERRY PI & EDGE GATEWAYS                                                           │
│   ────────────────────────────────────                                                           │
│                                                                                                  │
│   DIME provides ARM64 images for edge deployment on Raspberry Pi and industrial gateways.        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   $ docker run -d \                                                                      │   │
│   │       --name dime-edge \                                                                 │   │
│   │       -v ./configs:/app/Configs \                                                        │   │
│   │       -p 9999:9999 \                                                                     │   │
│   │       --restart unless-stopped \                                                         │   │
│   │       ladder99/dime:latest                     # multi-arch: auto-selects ARM64          │   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────────────────┐        │   │
│   │   │                                                                             │        │   │
│   │   │     Raspberry Pi 4/5          Industrial Edge Gateway                       │        │   │
│   │   │     ┌───────────────┐         ┌───────────────────────┐                     │        │   │
│   │   │     │ ARM64 Linux   │         │ ARM64 Linux           │                     │        │   │
│   │   │     │               │         │                       │                     │        │   │
│   │   │     │ ┌───────────┐ │         │ ┌───────────────────┐ │                     │        │   │
│   │   │     │ │ DIME      │ │         │ │ DIME              │ │                     │        │   │
│   │   │     │ │ Container │ │         │ │ Container         │ │                     │        │   │
│   │   │     │ └───────────┘ │         │ └───────────────────┘ │                     │        │   │
│   │   │     │ Modbus, S7    │         │ OPC-UA, MQTT          │                     │        │   │
│   │   │     └───────────────┘         └───────────────────────┘                     │        │   │
│   │   │                                                                             │        │   │
│   │   │   Same YAML config. Same container image. Same behavior. Just ARM64.        │        │   │
│   │   │                                                                             │        │   │
│   │   └─────────────────────────────────────────────────────────────────────────────┘        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ROS2 DOCKER VARIANTS                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   For robotics integration, DIME offers Docker images with ROS2 pre-installed.                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   IMAGE TAGS                                                                             │   │
│   │   ──────────                                                                             │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────────────┬───────────────────────────────────────────────┐       │   │
│   │   │ Image Tag                    │ Description                                   │       │   │
│   │   ├──────────────────────────────┼───────────────────────────────────────────────┤       │   │
│   │   │ ladder99/dime:latest         │ Standard DIME. No ROS2.                       │       │   │
│   │   ├──────────────────────────────┼───────────────────────────────────────────────┤       │   │
│   │   │ ladder99/dime:ros2-humble    │ DIME + ROS2 Humble Hawksbill (LTS)            │       │   │
│   │   ├──────────────────────────────┼───────────────────────────────────────────────┤       │   │
│   │   │ ladder99/dime:ros2-jazzy     │ DIME + ROS2 Jazzy Jalisco (LTS)               │       │   │
│   │   └──────────────────────────────┴───────────────────────────────────────────────┘       │   │
│   │                                                                                          │   │
│   │   $ docker run -d \                                                                      │   │
│   │       --name dime-ros2 \                                                                 │   │
│   │       -v ./configs:/app/Configs \                                                        │   │
│   │       -p 9999:9999 \                                                                     │   │
│   │       ladder99/dime:ros2-humble                                                          │   │
│   │                                                                                          │   │
│   │   ROS2 images include the ROS2 runtime and DIME's ROS2 source connector.                 │   │
│   │   Subscribe to ROS2 topics and route them through DIME's ring buffer                     │   │
│   │   to any sink — InfluxDB, MQTT, Splunk, dashboards, and more.                            │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
