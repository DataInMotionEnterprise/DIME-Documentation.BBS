```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        03 — Installation & First Run                  │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          From zero to running in minutes.               │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Any platform. Any architecture.                │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PLATFORM MATRIX                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   DIME runs anywhere .NET 9.0 runs. Self-contained — no runtime to install.                      │
│                                                                                                  │
│   ┌──────────────────┬────────────┬───────────────────────────────────────────────┐              │
│   │  Platform        │  Arch      │  Deployment                                   │              │
│   ├──────────────────┼────────────┼───────────────────────────────────────────────┤              │
│   │                  │            │                                               │              │
│   │  Windows         │  x86       │  DIME.exe — Standalone or Windows Service     │              │
│   │  Windows         │  x64       │  DIME.exe — Standalone or Windows Service     │              │
│   │  Linux           │  x64       │  ./DIME   — Standalone or systemd service     │              │
│   │  Linux           │  ARM64     │  ./DIME   — Edge gateways, Raspberry Pi       │              │
│   │  Docker          │  x64/ARM64 │  Multi-arch container image                   │              │
│   │  Docker + ROS2   │  x64       │  Humble or Jazzy ROS2 base image              │              │
│   │                  │            │                                               │              │
│   └──────────────────┴────────────┴───────────────────────────────────────────────┘              │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WINDOWS INSTALLATION                                                                           │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│     OPTION A — Run standalone                                                                    │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │   1.  Extract the DIME release zip                                         │               │
│     │                                                                            │               │
│     │   2.  Place your YAML configs in the Configs\ folder                       │               │
│     │                                                                            │               │
│     │   3.  Run:                                                                 │               │
│     │                                                                            │               │
│     │       > DIME.exe                                                           │               │
│     │                                                                            │               │
│     │       Or with a custom config directory:                                   │               │
│     │                                                                            │               │
│     │       > DIME.exe --config C:\MyProject\Configs                             │               │
│     │                                                                            │               │
│     │   4.  Verify:                                                              │               │
│     │                                                                            │               │
│     │       > curl http://localhost:9999/status                                  │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│     OPTION B — Install as a Windows Service                                                      │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │   Install:                                                                 │               │
│     │                                                                            │               │
│     │       > DIME.exe install                                                   │               │
│     │                                                                            │               │
│     │   With a named instance (run multiple side by side):                       │               │
│     │                                                                            │               │
│     │       > DIME.exe install /instance:Plant1                                  │               │
│     │       > DIME.exe install /instance:Plant2                                  │               │
│     │                                                                            │               │
│     │   Creates service "DIME" or "DIME$Plant1" in Windows Services.             │               │
│     │   Runs as Local System. Starts automatically (delayed).                    │               │
│     │                                                                            │               │
│     │   Uninstall:                                                               │               │
│     │                                                                            │               │
│     │       > DIME.exe uninstall /instance:Plant1                                │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│     OPTION C — PowerShell management script                                                      │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │       > .\Manage-Services-Windows.ps1                                      │               │
│     │                                                                            │               │
│     │       Interactive menu:                                                    │               │
│     │         [1] Show installed DIME services                                   │               │
│     │         [2] Install new service (prompts for name + config path)           │               │
│     │         [3] Uninstall a service                                            │               │
│     │         [4] Exit                                                           │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LINUX INSTALLATION                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│     OPTION A — Run standalone                                                                    │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │   $ tar -xzf dime-connector-linux-x64.tar.gz                               │               │
│     │   $ cd dime-connector                                                      │               │
│     │   $ chmod +x DIME                                                          │               │
│     │   $ ./DIME run                                                             │               │
│     │                                                                            │               │
│     │   With custom configs:                                                     │               │
│     │                                                                            │               │
│     │   $ ./DIME run --config /etc/dime/my-configs                               │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│     OPTION B — Install as a systemd service                                                      │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │   $ sudo ./install-dime-connector.sh dime-connector-linux-x64.tar.gz       │               │
│     │                                                                            │               │
│     │   Options:                                                                 │               │
│     │     -d, --config-dir <dir>     Custom config directory                     │               │
│     │     -c, --config <file>        Custom main.yaml                            │               │
│     │     -l, --log-config <file>    Custom nlog.config                          │               │
│     │     -u, --user <username>      User to run as (default: current)           │               │
│     │                                                                            │               │
│     │   Installs to:                                                             │               │
│     │     Binary ──── /opt/dime-connector/DIME                                   │               │
│     │     Config ──── /opt/dime-connector/main.yaml                              │               │
│     │     Logs ────── /opt/dime-connector/Logs/                                  │               │
│     │     Service ─── /etc/systemd/system/dime-connector.service                 │               │
│     │                                                                            │               │
│     │   Manage:                                                                  │               │
│     │     $ sudo systemctl start dime-connector                                  │               │
│     │     $ sudo systemctl stop dime-connector                                   │               │
│     │     $ sudo systemctl status dime-connector                                 │               │
│     │     $ journalctl -u dime-connector -f          (follow logs)               │               │
│     │                                                                            │               │
│     │   Uninstall:                                                               │               │
│     │     $ sudo ./install-dime-connector.sh -U                                  │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DOCKER                                                                                         │
│   ──────                                                                                         │
│                                                                                                  │
│     ┌────────────────────────────────────────────────────────────────────────────┐               │
│     │                                                                            │               │
│     │   Run with a config directory mounted as a volume:                         │               │
│     │                                                                            │               │
│     │   $ docker run -d \                                                        │               │
│     │       -v /path/to/configs:/app/Configs \                                   │               │
│     │       -p 9999:9999 \                                                       │               │
│     │       -p 9998:9998 \                                                       │               │
│     │       --name dime \                                                        │               │
│     │       ladder99/dime:latest                                                 │               │
│     │                                                                            │               │
│     │   Expose additional ports as needed by your sinks:                         │               │
│     │                                                                            │               │
│     │   $ docker run -d \                                                        │               │
│     │       -v /path/to/configs:/app/Configs \                                   │               │
│     │       -p 9999:9999 \     Admin REST API                                    │               │
│     │       -p 9998:9998 \     Admin WebSocket                                   │               │
│     │       -p 5000:5000 \     MTConnect Agent (if configured)                   │               │
│     │       -p 7878:7878 \     MTConnect SHDR (if configured)                    │               │
│     │       -p 8092:8092 \     WebSocket Server (if configured)                  │               │
│     │       ladder99/dime:latest                                                 │               │
│     │                                                                            │               │
│     │   Available images:                                                        │               │
│     │     ladder99/dime:latest            Standard (x64 + ARM64)                 │               │
│     │     ladder99/dime:ros2-humble       ROS2 Humble base                       │               │
│     │     ladder99/dime:ros2-jazzy        ROS2 Jazzy base                        │               │
│     │                                                                            │               │
│     └────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT HAPPENS AT STARTUP                                                                        │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   When you run DIME, here's what happens inside — in order.                                      │
│                                                                                                  │
│   ┌─ 1 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  LOAD CONFIGURATION                                                                     │    │
│   │                                                                                         │    │
│   │  Read all *.yaml files from the config directory.                                       │    │
│   │  Merge them together. Load main.yaml last (overrides others).                           │    │
│   │  Parse app settings, source definitions, sink definitions.                              │    │
│   │                                                                                         │    │
│   │  Config directory:  --config flag, or ./Configs by default.                             │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                           │                                      │
│                                                           v                                      │
│   ┌─ 2 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  VALIDATE LICENSE                                                                       │    │
│   │                                                                                         │    │
│   │  Check the license key in app.license.                                                  │    │
│   │  Valid license ────── Full operation, no time limit.                                    │    │
│   │  No/invalid license ─ Demo mode: runs for 150 minutes, then stops.                      │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                           │                                      │
│                                                           v                                      │
│   ┌─ 3 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  START DISRUPTOR RING BUFFER                                                            │    │
│   │                                                                                         │    │
│   │  Create the ring buffer (default 4096 slots).                                           │    │
│   │  Register the SinkDispatcher as the event handler.                                      │    │
│   │  This is the backbone — all messages flow through here.                                 │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                           │                                      │
│                                                           v                                      │
│   ┌─ 4 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  CREATE CONNECTORS                                                                      │    │
│   │                                                                                         │    │
│   │  For each source in config ─── SourceConnectorFactory creates the right connector type. │    │
│   │  For each sink in config ───── SinkConnectorFactory creates it and registers with       │    │
│   │                                SinkDispatcher so it receives messages.                  │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                           │                                      │
│                                                           v                                      │
│   ┌─ 5 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  INITIALIZE & START ALL CONNECTORS                                                      │    │
│   │                                                                                         │    │
│   │  Each connector wrapped in a ConnectorRunner.                                           │    │
│   │  Each runner walks through: Initialize → Create → Connect → Read/Write loop.            │    │
│   │  Sources begin polling. Sinks begin listening. Data flows.                              │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                           │                                      │
│                                                           v                                      │
│   ┌─ 6 ─────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │  START ADMIN SERVER                                                                     │    │
│   │                                                                                         │    │
│   │  REST API ─── http://localhost:9999   (status, config, cache, runtime sink injection)   │    │
│   │  WebSocket ── ws://localhost:9998     (real-time events, telemetry, state changes)      │    │
│   │                                                                                         │    │
│   │  DIME is now running. Data is flowing.                                                  │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DIRECTORY LAYOUT                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   What you see after extracting and running DIME.                                                │
│                                                                                                  │
│     DIME/                                                                                        │
│     ├── DIME.exe                (or ./DIME on Linux)                                             │
│     ├── DIME.dll                                                                                 │
│     │                                                                                            │
│     ├── Configs/                                                                                 │
│     │   ├── main.yaml           App settings + connector references                              │
│     │   ├── source1.yaml        Source connector config                                          │
│     │   ├── sink1.yaml          Sink connector config                                            │
│     │   └── ...                 As many YAML files as you need                                   │
│     │                                                                                            │
│     ├── Logs/                   Created automatically at first run                               │
│     │   ├── 2026-02-19.log     Daily rolling log files                                           │
│     │   └── internal.log       NLog internal diagnostics                                         │
│     │                                                                                            │
│     ├── Lua/                    Lua utility libraries                                            │
│     ├── Python/                 Python scripts                                                   │
│     ├── nlog.config             Logging configuration                                            │
│     └── ...                     Runtime dependencies                                             │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   VERIFY IT WORKS                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   Three ways to confirm DIME is running and healthy.                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────┐       │
│   │                                                                                      │       │
│   │  1. CONSOLE OUTPUT                                                                   │       │
│   │                                                                                      │       │
│   │     If running standalone, you'll see connector activity in the terminal:            │       │
│   │                                                                                      │       │
│   │     DIME | Data In Motion Enterprise                                                 │       │
│   │     Machine simulator initialized                                                    │       │
│   │     machine state = IDLE                                                             │       │
│   │     machine state = SETUP                                                            │       │
│   │     machine state = RUNNING                                                          │       │
│   │     parts total = 1                                                                  │       │
│   │                                                                                      │       │
│   ├──────────────────────────────────────────────────────────────────────────────────────┤       │
│   │                                                                                      │       │
│   │  2. REST API                                                                         │       │
│   │                                                                                      │       │
│   │     $ curl http://localhost:9999/status                                              │       │
│   │                                                                                      │       │
│   │     Returns JSON with every connector's state, fault count,                          │       │
│   │     and performance metrics.                                                         │       │
│   │                                                                                      │       │
│   ├──────────────────────────────────────────────────────────────────────────────────────┤       │
│   │                                                                                      │       │
│   │  3. LOG FILES                                                                        │       │
│   │                                                                                      │       │
│   │     Check Logs/ directory for today's log.                                           │       │
│   │     Default level: WARN and above.                                                   │       │
│   │     Change log level in nlog.config for more detail.                                 │       │
│   │                                                                                      │       │
│   └──────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DEFAULT PORTS                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   ┌─────────┬──────────────────────────────────────┬─────────────────────────────┐               │
│   │  Port   │  Service                             │  Configured In              │               │
│   ├─────────┼──────────────────────────────────────┼─────────────────────────────┤               │
│   │  9999   │  Admin REST API (always on)          │  app.http_server_uri        │               │
│   │  9998   │  Admin WebSocket (always on)         │  app.ws_server_uri          │               │
│   │  5000   │  MTConnect Agent (if configured)     │  sink: port                 │               │
│   │  7878   │  MTConnect SHDR (if configured)      │  sink: port                 │               │
│   │  8080   │  HTTP Server (if configured)         │  sink: uri                  │               │
│   │  8092   │  WebSocket Server (if configured)    │  sink: uri                  │               │
│   └─────────┴──────────────────────────────────────┴─────────────────────────────┘               │
│                                                                                                  │
│   Only 9999 and 9998 are always active. All others depend on your sink configuration.            │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   QUICK START — ZERO TO RUNNING IN 60 SECONDS                                                    │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│       ┌───────────┐         ┌───────────┐         ┌───────────┐         ┌───────────┐            │
│       │           │         │           │         │           │         │           │            │
│       │  EXTRACT  │────────▶│  EDIT     │────────▶│  RUN      │────────▶│  VERIFY   │            │
│       │           │         │  YAML     │         │           │         │           │            │
│       │  Unzip    │         │           │         │  DIME.exe │         │  curl     │            │
│       │  the      │         │  Point at │         │           │         │  :9999    │            │
│       │  release  │         │  your     │         │  or       │         │  /status  │            │
│       │           │         │  device   │         │  ./DIME   │         │           │            │
│       │           │         │           │         │  run      │         │  Done.    │            │
│       └───────────┘         └───────────┘         └───────────┘         └───────────┘            │
│                                                                                                  │
│       No installer.  No dependencies.  No runtime.  Just extract and run.                        │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
