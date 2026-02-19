```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        Data In Motion Enterprise                      │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘        ─────────────────────────                      │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Connect Once. Use Everywhere.                  │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘                                                         │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐        The universal connector for                    │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘        industrial & enterprise data.                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE PROBLEM                                                                                    │
│   ───────────                                                                                    │
│                                                                                                  │
│   Every device needs a custom integration to every destination.                                  │
│   5 devices x 4 destinations = 20 custom integrations to build and maintain.                     │
│                                                                                                  │
│    CNC ──────────┬──────────────┬──────────────┬──────────────┐                                  │
│                  │              │              │              │                                  │
│    PLC ──────────┼──────────────┼──────────────┼──────────────┤                                  │
│                  │              │              │              │                                  │
│    Robot ────────┼──────────────┼──────────────┼──────────────┤                                  │
│                  │              │              │              │                                  │
│    Sensor ───────┼──────────────┼──────────────┼──────────────┤                                  │
│                  │              │              │              │                                  │
│    MQTT ─────────┼──────────────┼──────────────┼──────────────┤                                  │
│                  │              │              │              │                                  │
│                  ▼              ▼              ▼              ▼                                  │
│              InfluxDB       Splunk        Dashboard       MongoDB                                │
│                                                                                                  │
│                  20 point-to-point integrations.                                                 │
│                  20 things to build. 20 things that break.                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE DIME SOLUTION                                                                              │
│   ─────────────────                                                                              │
│                                                                                                  │
│   Every device connects to DIME. DIME connects to every destination.                             │
│   5 devices + 4 destinations = 9 simple YAML configs. That's it.                                 │
│                                                                                                  │
│                                  ┌───────────────────┐                                           │
│                                  │                   │                                           │
│    CNC ─────────────────────────▶│                   │──────────────────────▶ InfluxDB           │
│                                  │                   │                                           │
│    PLC ─────────────────────────▶│       DIME        │──────────────────────▶ Splunk             │
│                                  │                   │                                           │
│    Robot ───────────────────────▶│    ╭───────────╮  │──────────────────────▶ Dashboard          │
│                                  │    │Ring Buffer│  │                                           │
│    Sensor ──────────────────────▶│    │  < 1ms    │  │──────────────────────▶ MongoDB            │
│                                  │    │  1M+ /sec │  │                                           │
│    MQTT ────────────────────────▶│    ╰───────────╯  │                                           │
│                                  │                   │                                           │
│                                  └───────────────────┘                                           │
│                                                                                                  │
│                  9 configs.  Zero custom code.  One platform.                                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HOW IT WORKS                                                                                   │
│   ────────────                                                                                   │
│                                                                                                  │
│      ┌─────────────┐          ┌───────────┐          ┌──────────────┐                            │
│      │             │          │           │          │              │                            │
│      │   SOURCES   │─────────▶│   RING    │─────────▶│    SINKS     │                            │
│      │             │          │  BUFFER   │          │              │                            │
│      │  Read data  │          │           │          │  Write data  │                            │
│      │  from any   │          │  Lock-free│          │  to any      │                            │
│      │  device or  │          │  message  │          │  database,   │                            │
│      │  protocol   │          │  passing  │          │  queue, or   │                            │
│      │             │          │           │          │  API         │                            │
│      └─────────────┘          └───────────┘          └──────────────┘                            │
│                                      │                                                           │
│                              ┌───────┴───────┐                                                   │
│                              │  Lua/Python   │                                                   │
│                              │  transforms   │                                                   │
│                              │  at any stage │                                                   │
│                              └───────────────┘                                                   │
│                                                                                                  │
│      1. Configure a SOURCE       Point it at your device.                                        │
│      2. Configure a SINK         Point it at your destination.                                   │
│      3. Run DIME                 Data flows. Done.                                               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHAT CAN IT CONNECT?                                                                           │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   INDUSTRIAL              MESSAGING            DATABASES           WEB & API             │   │
│   │   ──────────              ─────────            ─────────           ─────────             │   │
│   │                                                                                          │   │
│   │   OPC-UA                  MQTT                 InfluxDB            HTTP / REST           │   │
│   │   OPC-DA                  SparkplugB           MongoDB             WebSocket             │   │
│   │   Siemens S7              ActiveMQ             SQL Server          JSON Scraper          │   │
│   │   Modbus TCP              Redis Pub/Sub        PostgreSQL          XML Scraper           │   │
│   │   EtherNet/IP                                                      UDP Server            │   │
│   │   Beckhoff ADS            MANUFACTURING        ANALYTICS                                 │   │
│   │   MTConnect               ─────────────        ─────────           SCRIPTING             │   │
│   │   FANUC Robot                                                      ─────────             │   │
│   │   Yaskawa Robot           MTConnect Agent       Splunk HEC                               │   │
│   │   Haas SHDR               MTConnect SHDR        Splunk Edge Hub    Lua                   │   │
│   │   SNMP                    SmartPac              CSV / File         Python                │   │
│   │   ROS2                                                                                   │   │
│   │                                                                                          │   │
│   │                                    47+ connector types                                   │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHY DIME?                                                                                      │
│   ─────────                                                                                      │
│                                                                                                  │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │    ZERO CODE      │  │   SUB-MILLISECOND │  │    RUN ANYWHERE   │  │    ZERO DOWNTIME  │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │  YAML config.     │  │  Lock-free ring   │  │  Windows Service  │  │  Add connectors   │     │
│   │  Lua/Python for   │  │  buffer. Handles  │  │  Linux daemon     │  │  at runtime via   │     │
│   │  transforms.      │  │  1M+ messages     │  │  Docker container │  │  REST API. No     │     │
│   │  No compiling.    │  │  per second.      │  │  x86, x64, ARM64  │  │  restart needed.  │     │
│   │  No deploying.    │  │                   │  │                   │  │                   │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘     │
│                                                                                                  │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │    47+ PROTOCOLS  │  │    SMART ROUTING  │  │    SCRIPTABLE     │  │    CHAINABLE      │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   │  Industrial,      │  │  Report By        │  │  Lua & Python     │  │  Link instances   │     │
│   │  enterprise,      │  │  Exception.       │  │  inline or file.  │  │  edge to cloud.   │     │
│   │  cloud, and       │  │  Include/exclude  │  │  Transform, fork, │  │  Any DIME sink    │     │
│   │  IoT protocols    │  │  regex filters    │  │  aggregate, and   │  │  feeds any DIME   │     │
│   │  out of the box.  │  │  per sink.        │  │  enrich data.     │  │  source.          │     │
│   │                   │  │                   │  │                   │  │                   │     │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FROM PLC TO DATABASE IN 12 LINES OF YAML                                                       │
│   ─────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   sources:                                                                   │               │
│   │     - name: my_plc                                                           │               │
│   │       connector: OpcUA                                                       │               │
│   │       address: 192.168.1.10                                                  │               │
│   │       items:                                                                 │               │
│   │         - name: Temperature                                                  │               │
│   │           address: ns=2;s=PLC.Temp                                           │               │
│   │                                                                              │               │
│   │   sinks:                                                                     │               │
│   │     - name: my_database                                                      │               │
│   │       connector: InfluxLP                                                    │               │
│   │       address: https://my-influxdb.com                                       │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   That's a complete, working integration.  PLC data in a time-series database.                   │
│   Need Splunk too?  Add 3 lines.   Need 50 more machines?  Copy the source block.                │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
