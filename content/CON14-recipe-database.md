```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        14 — Database Logging                          │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Capture history.                               │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          InfluxDB, SQL, MongoDB, and CSV.               │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   VISUAL OVERVIEW — FAN-OUT TO MULTIPLE DATABASES                                                │
│   ────────────────────────────────────────────────                                               │
│                                                                                                  │
│   DIME reads from any number of sources, buffers centrally, then writes                          │
│   to any combination of databases simultaneously.                                                │
│                                                                                                  │
│    Sources                         Ring Buffer                     Database Sinks                │
│    ───────                         ───────────                     ──────────────                │
│                                                                                                  │
│    ┌──────────┐                ┌──────────────┐              ┌──────────────────┐                │
│    │ PLC      │──────┐         │              │       ┌─────▶│ InfluxDB         │                │
│    │ (OPC-UA) │      │         │  ┌────────┐  │       │      │ time-series      │                │
│    └──────────┘      │         │  │  ····  │  │       │      │ bucket: factory  │                │
│                      ├────────▶│  │  msgs  │  │───────┤      └──────────────────┘                │
│    ┌──────────┐      │         │  │  ····  │  │       │                                          │
│    │ MQTT     │──────┤         │  └────────┘  │       ├─────▶┌──────────────────┐                │
│    │ Sensors  │      │         │              │       │      │ SQL Server       │                │
│    └──────────┘      │         │  4096 slots  │       │      │ relational       │                │
│                      │         │              │       │      │ table: readings  │                │
│    ┌──────────┐      │         └──────────────┘       │      └──────────────────┘                │
│    │ Modbus   │──────┘                                │                                          │
│    │ RTU      │                                       ├─────▶┌──────────────────┐                │
│    └──────────┘                                       │      │ MongoDB          │                │
│                                                       │      │ documents        │                │
│                                                       │      │ coll: readings   │                │
│                                                       │      └──────────────────┘                │
│                                                       │                                          │
│                                                       └─────▶┌──────────────────┐                │
│                                                              │ CSV File         │                │
│                                                              │ readings.csv     │                │
│                                                              └──────────────────┘                │
│                                                                                                  │
│   All sinks run in parallel. Each has its own filters, timing, and format.                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   INFLUXDB SINK — TIME-SERIES HISTORIAN                                                          │
│   ─────────────────────────────────────                                                          │
│                                                                                                  │
│   Uses the InfluxDB Line Protocol (InfluxLP). DIME automatically formats                         │
│   each message into line-protocol syntax for InfluxDB v2.                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: InfluxLP                                                        │               │
│   │                                                                              │               │
│   │   Required fields:                                                           │               │
│   │     url ───────────── http://influx.local:8086     Server address            │               │
│   │     bucket ────────── factory_data                 Target bucket             │               │
│   │     org ───────────── myorg                        InfluxDB organization     │               │
│   │     token ─────────── my-influx-token              API auth token            │               │
│   │                                                                              │               │
│   │   Automatic behavior:                                                        │               │
│   │     • Converts Path to measurement name                                      │               │
│   │     • Timestamps in nanosecond precision                                     │               │
│   │     • Batch writes for performance                                           │               │
│   │     • Retry on transient failures                                            │               │
│   │                                                                              │               │
│   │   Line protocol generated:                                                   │               │
│   │     temperature,source=plc1 value=72.5 1708300800000000000                   │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   Best for: high-frequency sensor data, trend analysis, Grafana dashboards.                      │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SQL SERVER & POSTGRESQL SINKS — RELATIONAL DATABASES                                           │
│   ─────────────────────────────────────────────────────                                          │
│                                                                                                  │
│   Store data in structured tables with batch inserts for performance.                            │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   SQL Server Sink                        PostgreSQL Sink                     │               │
│   │   ───────────────                        ───────────────                     │               │
│   │                                                                              │               │
│   │   connector: SqlServer                   connector: PostgreSql               │               │
│   │                                                                              │               │
│   │   connection_string:                     connection_string:                  │               │
│   │     "Server=db.local;                      "Host=pg.local;                   │               │
│   │      Database=dime;                         Database=dime;                   │               │
│   │      User Id=sa;                            Username=dime;                   │               │
│   │      Password=pass;"                        Password=pass;"                  │               │
│   │                                                                              │               │
│   │   Features:                              Features:                           │               │
│   │     • Table auto-mapping                   • Query templates                 │               │
│   │     • Batch inserts                        • Parameterized inserts           │               │
│   │     • Column-to-path mapping               • Schema-aware writes             │               │
│   │     • Stored procedure calls               • Connection pooling              │               │
│   │                                                                              │               │
│   │   Insert flow:                                                               │               │
│   │     message ──▶ map path to column ──▶ batch ──▶ INSERT INTO table           │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   Best for: relational reporting, ERP integration, audit trails.                                 │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MONGODB SINK — DOCUMENT STORAGE                                                                │
│   ───────────────────────────────                                                                │
│                                                                                                  │
│   Store each reading as a flexible JSON-like document.                                           │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   connector: MongoDB                                                         │               │
│   │                                                                              │               │
│   │   Required fields:                                                           │               │
│   │     connection_string ── "mongodb://mongo.local:27017"                       │               │
│   │     database ────────── factory                                              │               │
│   │     collection ──────── readings                                             │               │
│   │                                                                              │               │
│   │   Document structure (auto-generated):                                       │               │
│   │   ┌──────────────────────────────────────┐                                   │               │
│   │   │ {                                    │                                   │               │
│   │   │   "path": "plc1/temperature",        │                                   │               │
│   │   │   "value": 72.5,                     │                                   │               │
│   │   │   "timestamp": 1708300800000,        │                                   │               │
│   │   │   "source": "plc1",                  │                                   │               │
│   │   │   "item": "temperature"              │                                   │               │
│   │   │ }                                    │                                   │               │
│   │   └──────────────────────────────────────┘                                   │               │
│   │                                                                              │               │
│   │   Features:                                                                  │               │
│   │     • Schema-free — no table migration needed                                │               │
│   │     • Automatic BSON conversion                                              │               │
│   │     • Bulk write operations                                                  │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   Best for: flexible schemas, nested data, rapid prototyping.                                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CSV WRITER & LOGGER SINKS — FILE-BASED OUTPUT                                                  │
│   ──────────────────────────────────────────────                                                 │
│                                                                                                  │
│   Write data to local files. Simple, portable, no database needed.                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   CsvWriter Sink                         Logger Sink                         │               │
│   │   ──────────────                         ───────────                         │               │
│   │                                                                              │               │
│   │   connector: CsvWriter                   connector: Logger                   │               │
│   │                                                                              │               │
│   │   filename: readings.csv                 NLog-based structured logging:      │               │
│   │                                                                              │               │
│   │   Options:                                 • Writes to rolling log files     │               │
│   │     filter_duplicate_paths:                • Configurable NLog targets       │               │
│   │       !!bool false                         • Structured JSON output          │               │
│   │     auto_headers: true                     • Path, value, timestamp          │               │
│   │                                              per log entry                   │               │
│   │   Output format:                                                             │               │
│   │   ┌──────────────────────────────┐                                           │               │
│   │   │ path,value,timestamp         │       Use Logger when you need:           │               │
│   │   │ plc1/temp,72.5,17083008...   │         • Audit trail with rotation       │               │
│   │   │ plc1/psi,14.7,17083008...    │         • Integration with log systems    │               │
│   │   └──────────────────────────────┘         • NLog ecosystem support          │               │
│   │                                                                              │               │
│   │   filter_duplicate_paths:                                                    │               │
│   │     true  ── only one row per unique path (latest value)                     │               │
│   │     false ── append every reading (full history)                             │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   Best for: quick exports, Excel import, archival, debugging.                                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DATABASE AS SOURCE — READING FROM DATABASES                                                    │
│   ────────────────────────────────────────────                                                   │
│                                                                                                  │
│   DIME can also READ from SQL Server and PostgreSQL using BatchPolling.                          │
│   Useful for pulling ERP data, work orders, or recipe parameters.                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   BatchPollingSourceConnector                                                │               │
│   │   ───────────────────────────                                                │               │
│   │                                                                              │               │
│   │   connector: SqlServer  (or PostgreSql)                                      │               │
│   │                                                                              │               │
│   │   connection_string: "Server=db.local;Database=erp;"                         │               │
│   │   query: "SELECT id, value FROM sensors WHERE updated > @last_run"           │               │
│   │                                                                              │               │
│   │   Flow:                                                                      │               │
│   │     Timer fires ──▶ Execute query ──▶ Iterate rows ──▶ Publish each          │               │
│   │                                                                              │               │
│   │   ┌─────────┐      ┌─────────────┐      ┌────────────┐      ┌──────────┐     │               │
│   │   │  Timer  │─────▶│  SQL Query  │─────▶│  Row 1     │─────▶│ Ring     │     │               │
│   │   │  fires  │      │  executes   │      │  Row 2     │      │ Buffer   │     │               │
│   │   │         │      │             │      │  Row 3...  │      │          │     │               │
│   │   └─────────┘      └─────────────┘      └────────────┘      └──────────┘     │               │
│   │                                                                              │               │
│   │   Each column becomes a path:  db_reader/query1/col_name                     │               │
│   │   scan_interval controls how often the query runs.                           │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   COMPARISON — WHEN TO USE WHICH DATABASE                                                        │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   ┌──────────────┬──────────────────┬──────────────────────────────────────────┐                 │
│   │  Connector   │  Best For        │  When to Choose                          │                 │
│   ├──────────────┼──────────────────┼──────────────────────────────────────────┤                 │
│   │              │                  │                                          │                 │
│   │  InfluxDB    │  Time-series     │  High-frequency sensor data. Grafana     │                 │
│   │              │                  │  dashboards. Trend analysis. Downsampling│                 │
│   │              │                  │                                          │                 │
│   ├──────────────┼──────────────────┼──────────────────────────────────────────┤                 │
│   │              │                  │                                          │                 │
│   │  SQL Server  │  Relational      │  ERP integration. Audit trails.          │                 │
│   │  PostgreSQL  │  queries         │  Joins across tables. Reporting.         │                 │
│   │              │                  │                                          │                 │
│   ├──────────────┼──────────────────┼──────────────────────────────────────────┤                 │
│   │              │                  │                                          │                 │
│   │  MongoDB     │  Documents       │  Flexible schemas. Nested payloads.      │                 │
│   │              │                  │  Rapid prototyping. Schema evolution.    │                 │
│   │              │                  │                                          │                 │
│   ├──────────────┼──────────────────┼──────────────────────────────────────────┤                 │
│   │              │                  │                                          │                 │
│   │  CSV Writer  │  Simple export   │  Quick file dumps. Excel import.         │                 │
│   │              │                  │  No infrastructure needed.               │                 │
│   │              │                  │                                          │                 │
│   ├──────────────┼──────────────────┼──────────────────────────────────────────┤                 │
│   │              │                  │                                          │                 │
│   │  Logger      │  Structured logs │  NLog integration. Rolling files.        │                 │
│   │              │                  │  Audit compliance. Debug traces.         │                 │
│   │              │                  │                                          │                 │
│   └──────────────┴──────────────────┴──────────────────────────────────────────┘                 │
│                                                                                                  │
│   You can run ALL of these simultaneously from a single DIME instance.                           │
│   The ring buffer fans out to every sink in parallel — no performance penalty.                   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
