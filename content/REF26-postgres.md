
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF26 — Postgres                                                    CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from a PostgreSQL database.                                                   │
  │                                                                                           │
  │  Connector Type: Postgres                              Source ✓    Sink ✗                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "Postgres".                  │
  │  connection_string      string   Empty       Database connection string.                  │
  │  command_text           string   Empty       SQL query.                                   │
  │  items.address          string   Empty       DataTable column name.                       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: postgresSource1                                                                  │
  │    connector: Postgres                                                                    │
  │    connection_string: Host=172.16.10.43;Port=5342;Username=postgres;Password=postgres;…   │
  │    command_text: select * from public.fedex limit 3;                                      │
  │    items:                                                                                 │
  │      - name: TrackingNumber                                                               │
  │        address: package_tracking_number                                                   │
  │        script: return result[0];                                                          │
  │      - name: ShipToName                                                                   │
  │        address: ship_to_name                                                              │
  │        script: return result;                                                             │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Npgsql Github: https://github.com/npgsql/npgsql                                          │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
