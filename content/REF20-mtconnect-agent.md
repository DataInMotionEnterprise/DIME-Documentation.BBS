
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF20 — MTConnect Agent                                            CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads streaming data from an external MTConnect Agent. Serves an MTConnect embedded      │
  │  Agent.                                                                                   │
  │                                                                                           │
  │  Connector Type: MTConnectAgent                      Source ✓    Sink ✓                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MTConnectAgent".            │
  │  address                string   Empty       Agent hostname or IP address.                │
  │  port                   int      5000        Agent port.                                  │
  │  device                 string   Empty       Device name to query.                        │
  │  itemized_read          bool     FALSE       Match streaming data against items list.     │
  │  items.address          string   Empty       DataItem ID to read.                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: mtConnectSource1                                                                 │
  │    connector: MTConnectAgent                                                              │
  │    address: mtconnect.mazakcorp.com                                                       │
  │    port: !!int 5719                                                                       │
  │    device: HCN001                                                                         │
  │    interval: !!int 100                                                                    │
  │    items:                                                                                 │
  │      - name: PathPositionSample                                                           │
  │        address: pathpos                                                                   │
  │        script: |                                                                          │
  │          return result[0].Value;                                                          │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MTConnectAgent".            │
  │  address                string   Empty       Agent hostname or IP address.                │
  │  port                   int      5000        Agent port.                                  │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: mtConnectSink1                                                                   │
  │    connector: MTConnectAgent                                                              │
  │    port: !!int 5000                                                                       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  MTConnect.NET Github: https://github.com/TrakHound/MTConnect.NET                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
