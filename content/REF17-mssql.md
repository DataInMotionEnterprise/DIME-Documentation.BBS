
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF17 — MSSQL                                                      CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from a Microsoft SQL database.                                                │
  │                                                                                           │
  │  Connector Type: MSSQL                              Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MSSQL".                     │
  │  connection_string      string   Empty       Database connection string.                   │
  │  command_text           string   Empty       SQL query.                                    │
  │  items.address          string   Empty       DataTable column name.                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: msSqlSource1                                                                     │
  │    connector: MSSQL                                                                       │
  │    connection_string: Server=172.16.10.5;Database=Tykma;User Id=datareader;               │
  │      Password=datareader;Encrypt=True;TrustServerCertificate=True;                        │
  │    command_text: select top 5 * from dbo.SiliconeRubberOrders;                            │
  │    items:                                                                                 │
  │      - name: OrderNumber                                                                  │
  │        address: ManufacturingOrderNumber                                                  │
  │        script: return result[0];                                                          │
  │      - name: OrderQuantity                                                                │
  │        address: OrderQuantity                                                             │
  │        script: return result[0];                                                          │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
