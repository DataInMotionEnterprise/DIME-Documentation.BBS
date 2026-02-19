```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        23 — Service Deployment                        │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Windows Service. Linux systemd.                │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Production-ready.                              │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   OVERVIEW — OS SERVICE MANAGEMENT                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   DIME runs as a native OS service on both Windows and Linux. Start on boot, survive             │
│   logouts, restart on failure — the OS manages the process lifecycle.                            │
│                                                                                                  │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐    │
│   │                 │      │                 │      │                 │      │              │    │
│   │  OS Service     │─────▶│  DIME Process   │─────▶│  YAML Configs   │      │  Log Files   │    │
│   │  Manager        │      │                 │      │                 │      │              │    │
│   │                 │      │  Sources        │      │ /Configs/*.yaml │      │  Daily roll  │    │
│   │  Windows SCM    │◀─────│  Ring Buffer    │      │  Merged at      │      │  nlog.config │    │
│   │  or systemd     │ stat │  Sinks          │      │  startup        │      │  JSON / text │    │
│   │                 │      │  Admin API      │      │                 │      │              │    │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘      └──────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WINDOWS SERVICE                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   Install DIME as a Windows service using the built-in installer.                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   INSTALL                                                                                │   │
│   │   ───────                                                                                │   │
│   │   > DIME.exe install                           # default service name "DIME"             │   │
│   │   > DIME.exe install /instance:Plant1          # named instance "DIME$Plant1"            │   │
│   │   > DIME.exe install /instance:Plant2          # another named instance                  │   │
│   │                                                                                          │   │
│   │   CONTROL                                                                                │   │
│   │   ───────                                                                                │   │
│   │   > net start DIME                             # start default service                   │   │
│   │   > net stop  DIME                             # stop default service                    │   │
│   │   > net start "DIME$Plant1"                    # start named instance                    │   │
│   │   > net stop  "DIME$Plant1"                    # stop named instance                     │   │
│   │                                                                                          │   │
│   │   UNINSTALL                                                                              │   │
│   │   ─────────                                                                              │   │
│   │   > DIME.exe uninstall                         # remove default service                  │   │
│   │   > DIME.exe uninstall /instance:Plant1        # remove named instance                   │   │
│   │                                                                                          │   │
│   │   POWERSHELL                                                                             │   │
│   │   ──────────                                                                             │   │
│   │   > Get-Service DIME* | Format-Table Name, Status, StartType                             │   │
│   │   > Restart-Service DIME                                                                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Named instances let you run multiple DIME services on one Windows machine,                     │
│   each with different configs, different ports, different devices.                               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LINUX systemd                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   Install DIME as a systemd service using the provided install script.                           │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   INSTALL                                                                                │   │
│   │   ───────                                                                                │   │
│   │   $ sudo ./install-dime-connector.sh \                                                   │   │
│   │       dime-connector-linux-x64.tar.gz                                                    │   │
│   │                                                                                          │   │
│   │   WITH CUSTOM CONFIG DIRECTORY                                                           │   │
│   │   ────────────────────────────                                                           │   │
│   │   $ sudo ./install-dime-connector.sh \                                                   │   │
│   │       -d /etc/dime/plant1 \                                                              │   │
│   │       dime-connector-linux-x64.tar.gz                                                    │   │
│   │                                                                                          │   │
│   │   CONTROL                                                                                │   │
│   │   ───────                                                                                │   │
│   │   $ sudo systemctl start   dime-connector                                                │   │
│   │   $ sudo systemctl stop    dime-connector                                                │   │
│   │   $ sudo systemctl status  dime-connector                                                │   │
│   │   $ sudo systemctl restart dime-connector                                                │   │
│   │   $ sudo systemctl enable  dime-connector      # start on boot                           │   │
│   │                                                                                          │   │
│   │   LOGS                                                                                   │   │
│   │   ────                                                                                   │   │
│   │   $ sudo journalctl -u dime-connector -f       # live log stream                         │   │
│   │   $ ls /opt/dime-connector/Logs/                # file-based logs                        │   │
│   │                                                                                          │   │
│   │   UNINSTALL                                                                              │   │
│   │   ─────────                                                                              │   │
│   │   $ sudo ./install-dime-connector.sh -U                                                  │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   The -d flag points DIME to a custom config directory. Useful for running multiple              │
│   instances with separate configurations on one Linux machine.                                   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MULTIPLE INSTANCES ON ONE MACHINE                                                              │
│   ─────────────────────────────────                                                              │
│                                                                                                  │
│   Run several DIME instances side by side. Each gets its own port, config, and logs.             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Instance         REST Port   WS Port   Config Directory                                │   │
│   │   ────────────────────────────────────────────────────────                               │   │
│   │   DIME (default)   9999        9998      ./Configs/                                      │   │
│   │   DIME$Plant1      9001        9002      C:\DIME\Plant1\Configs\                         │   │
│   │   DIME$Plant2      9003        9004      C:\DIME\Plant2\Configs\                         │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────────┐  ┌──────────────────────────┐                             │   │
│   │   │  DIME$Plant1             │  │  DIME$Plant2             │                             │   │
│   │   │  :9001 / :9002           │  │  :9003 / :9004           │                             │   │
│   │   │                          │  │                          │                             │   │
│   │   │  ┌─ Sources ─┐           │  │ ┌─ Sources ─┐            │                             │   │
│   │   │  │ PLC Line 1│──▶ Ring   │  │ │ PLC Line 2│──▶ Ring    │                             │   │
│   │   │  └───────────┘   ──▶MQTT │  │ └───────────┘   ──▶MQTT  │                             │   │
│   │   │                          │  │                          │                             │   │
│   │   └──────────────────────────┘  └──────────────────────────┘                             │   │
│   │                                                                                          │   │
│   │   Each instance is fully isolated: own process, own ring buffer, own connectors.         │   │
│   │   Set ports in the app section of each instance's YAML config.                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DIRECTORY LAYOUT                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐     │
│   │  WINDOWS                                 │  │  LINUX                                   │     │
│   │                                          │  │                                          │     │
│   │  C:\Program Files\DIME\                  │  │  /opt/dime-connector/                    │     │
│   │  ├── DIME.exe                            │  │   ├── DIME                               │     │
│   │  ├── Configs\                            │  │   ├── Configs/                           │     │
│   │  │   ├── main.yaml                       │  │   │   ├── main.yaml                      │     │
│   │  │   ├── sources.yaml                    │  │   │   ├── sources.yaml                   │     │
│   │  │   └── sinks.yaml                      │  │   │   └── sinks.yaml                     │     │
│   │  ├── Logs\                               │  │   ├── Logs/                              │     │
│   │  │   ├── 2026-02-19.log                  │  │   │   ├── 2026-02-19.log                 │     │
│   │  │   └── 2026-02-18.log                  │  │   │   └── 2026-02-18.log                 │     │
│   │  ├── Scripts\                            │  │   ├── Scripts/                           │     │
│   │  └── nlog.config                         │  │   └── nlog.config                        │     │
│   │                                          │  │                                          │     │
│   └──────────────────────────────────────────┘  └──────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LOG ROTATION & MANAGEMENT                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   DIME uses NLog. Logging is configured in nlog.config.                                          │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   nlog.config controls:                                                                  │   │
│   │                                                                                          │   │
│   │   ┌────────────────────┬────────────────────────────────────────────────────────┐        │   │
│   │   │ Setting            │ Description                                            │        │   │
│   │   ├────────────────────┼────────────────────────────────────────────────────────┤        │   │
│   │   │ File target        │ Logs/${shortdate}.log — daily rolling file             │        │   │
│   │   ├────────────────────┼────────────────────────────────────────────────────────┤        │   │
│   │   │ Min level          │ Warn (default). Set to Info, Debug, or Trace to expand │        │   │
│   │   ├────────────────────┼────────────────────────────────────────────────────────┤        │   │
│   │   │ Archive            │ Max 14 files. Configurable retention.                  │        │   │
│   │   ├────────────────────┼────────────────────────────────────────────────────────┤        │   │
│   │   │ JSON layout        │ Optional structured JSON format for log aggregation    │        │   │
│   │   ├────────────────────┼────────────────────────────────────────────────────────┤        │   │
│   │   │ Console target     │ Enabled when running interactively (not as service)    │        │   │
│   │   └────────────────────┴────────────────────────────────────────────────────────┘        │   │
│   │                                                                                          │   │
│   │   Change log levels at runtime by editing nlog.config — NLog watches for changes.        │   │
│   │   No restart required.                                                                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
