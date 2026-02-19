```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX19 — POSTGRESQL POLLING                                              DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Polls a PostgreSQL database on a timer, executing SQL queries with dynamic            │
  │  parameterization. The {top} placeholder in the SQL query is replaced at runtime       │
  │  via Lua scripting in enter_script — each scan uses a random row limit.                │
  │  Results are mapped to named items and output to the Console sink.                     │
  │  Multi-file YAML — 3 files with anchors.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌─────────────────────────┐
      │   Postgres Source        │
      │                          │          ┌──────────────────┐
      │   172.16.10.43:5342      │     ┌───▶│  Console Sink   │  stdout
      │   Database: postgres     ├─────┘    └──────────────────┘
      │                          │
      │   SQL:                   │
      │   select * from          │
      │     public.fedex         │
      │     limit {top}          │
      │                          │
      │   {top} replaced each    │
      │   scan with random 1-9   │
      │                          │
      │   Items:                 │
      │   · TrackingNumber       │
      │   · ShipToName           │
      │                          │
      │   scan: 1000ms           │
      └─────────────────────────┘
              SOURCE                        RING BUFFER              SINK
       (PostgreSQL polling)               (4096 slots)           (Console)

  CONFIGURATION — 3 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── postgresSource1.yaml ──────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  postgresSource1: &postgresSource1                                                     │
  │    name: postgresSource1                                                               │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Poll every 1 second                 │
  │    connector: Postgres                           # PostgreSQL source connector         │
  │    rbe: !!bool true                              # Only publish changes                │
  │    connection_string: Host=172.16.10.43;Port=5342;Username=postgres;                   │
  │                       Password=postgres;Database=postgres;                              │
  │    command_text: select * from public.fedex limit {top};                                │
  │    init_script: |                                                                      │
  │      top = "{top}"                               # Store placeholder for gsub          │
  │    deinit_script: ~                                                                    │
  │    enter_script: |                               # Runs before each scan cycle         │
  │      local conn = configuration().CommandText;                                         │
  │      next_num = math.random(1, 9);               # Random row limit 1-9               │
  │      conn = string.gsub(conn, top, next_num);    # Replace {top} or last value        │
  │      top = next_num;                              # Update for next gsub               │
  │      configuration().CommandText = conn;          # Apply modified query               │
  │      print(conn);                                 # Debug: show actual SQL             │
  │    items:                                                                              │
  │      - name: TrackingNumber                                                            │
  │        enabled: !!bool true                                                            │
  │        address: package_tracking_number           # Column name in result set          │
  │        script: return result[0];                  # First row value                    │
  │      - name: ShipToName                                                                │
  │        enabled: !!bool true                                                            │
  │        address: ship_to_name                      # Column name in result set          │
  │        script: return result;                     # Full result                        │
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
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *consoleSink1                                                                     │
  │  sources:                                                                              │
  │    - *postgresSource1                                                                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Postgres Connector — DIME includes a native PostgreSQL source connector. It         │
  │    executes command_text as a SQL query each scan cycle. The address field on each     │
  │    item maps to a column name in the result set.                                       │
  │                                                                                        │
  │  • Dynamic Query Parameterization — The {top} placeholder in the SQL query is          │
  │    replaced at runtime using Lua string.gsub() in the enter_script. The init_script   │
  │    stores the original placeholder pattern, and enter_script swaps it before each      │
  │    scan. This enables dynamic queries without restarting DIME.                         │
  │                                                                                        │
  │  • configuration() API — Lua's configuration() function returns the connector's       │
  │    live configuration object. Modifying configuration().CommandText directly changes   │
  │    the SQL query for the next scan cycle. This is powerful but use with caution.       │
  │                                                                                        │
  │  • enter_script vs init_script — init_script runs once at startup (stores the {top}   │
  │    pattern). enter_script runs before every scan cycle (modifies the query). This      │
  │    separation enables one-time setup vs. per-cycle logic.                              │
  │                                                                                        │
  │  • Column-to-Item Mapping — Each item's address field corresponds to a column name    │
  │    in the SQL result set. The script processes the result (e.g., result[0] for first   │
  │    row). Multiple items can map to different columns from the same query.              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
