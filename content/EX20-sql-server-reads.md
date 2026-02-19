```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX20 — SQL SERVER READS                                                DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Polls a Microsoft SQL Server database on a timer, reading manufacturing order         │
  │  data with encrypted connections. Uses standard ADO.NET connection strings with        │
  │  Encrypt=True and TrustServerCertificate=True for secure database access.              │
  │  Each item maps to a column in the result set via the address field.                   │
  │  Multi-file YAML — 3 files with anchors.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   MSSQL Source           │
      │                          │          ┌──────────────────┐
      │   172.16.10.5            │     ┌───▶│  Console Sink    │  stdout
      │   Database: Tykma        ├─────┘    └──────────────────┘
      │   Encrypt: True          │
      │                          │
      │   SQL:                   │
      │   select top 5 * from    │
      │     dbo.Silicone         │
      │     RubberOrders         │
      │                          │
      │   Items:                 │
      │   · OrderNumber          │
      │   · OrderQuantity        │
      │                          │
      │   scan: 1000ms           │
      └──────────────────────────┘
              SOURCE                        RING BUFFER              SINK
        (SQL Server polling)              (4096 slots)           (Console)

  CONFIGURATION — 3 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── msSqlSource1.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  msSqlSource1: &msSqlSource1                                                           │
  │    name: msSqlSource1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Poll every 1 second                 │
  │    connector: MSSQL                              # Microsoft SQL Server connector      │
  │    rbe: !!bool true                              # Only publish changes                │
  │    connection_string: >-                                                               │
  │      Server=172.16.10.5;                                                               │
  │      Database=Tykma;                                                                   │
  │      User Id=datareader;                                                               │
  │      Password=datareader;                                                              │
  │      Encrypt=True;                               # TLS encryption enabled              │
  │      TrustServerCertificate=True;                # Accept self-signed certs            │
  │    command_text: select top 5 * from dbo.SiliconeRubberOrders;                         │
  │    init_script: ~                                                                      │
  │    deinit_script: ~                                                                    │
  │    enter_script: ~                                                                     │
  │    exit_script: ~                                                                      │
  │    items:                                                                              │
  │      - name: OrderNumber                                                               │
  │        enabled: !!bool true                                                            │
  │        address: ManufacturingOrderNumber          # SQL column name                    │
  │        script: return result[0];                  # First row value                    │
  │      - name: OrderQuantity                                                             │
  │        enabled: !!bool true                                                            │
  │        address: OrderQuantity                     # SQL column name                    │
  │        script: return result[0];                  # First row value                    │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink1.yaml ─────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink1: &consoleSink1                                                           │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *consoleSink1                                                                     │
  │  sources:                                                                              │
  │    - *msSqlSource1                                                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • MSSQL Connector — DIME includes a native Microsoft SQL Server source connector.     │
  │    Uses ADO.NET under the hood with full support for connection string parameters.     │
  │    Each scan executes the command_text query and maps results to items.                │
  │                                                                                        │
  │  • Encrypted Connections — The connection string includes Encrypt=True for TLS         │
  │    encryption and TrustServerCertificate=True to accept self-signed certificates.      │
  │    In production, use proper CA-signed certificates and remove TrustServerCert.        │
  │                                                                                        │
  │  • Column-to-Item Mapping — Each item's address field corresponds to a SQL column      │
  │    name. The script: return result[0] extracts the first row's value. For multiple     │
  │    rows, use result[n] to access the nth row.                                          │
  │                                                                                        │
  │  • Lifecycle Scripts — All four lifecycle scripts (init, deinit, enter, exit) are      │
  │    set to ~ (null), meaning no custom logic. Compare with EX19 where enter_script      │
  │    dynamically modifies the SQL query each cycle.                                      │
  │                                                                                        │
  │  • Minimal Sink — The Console sink has no filters, receiving all messages including    │
  │    $SYSTEM. For production, add exclude_filter to suppress health messages.            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
