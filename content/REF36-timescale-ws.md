
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF36 — TimescaleWS                                                 CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Subscribes to data from a Timescale Historian via a WebSocket.                           │
  │                                                                                           │
  │  Connector Type: TimebaseWS                             Source ✓    Sink ✗                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "TimebaseWS".                │
  │  address                string   Empty       Hostname or IP address.                      │
  │  port                   int      4511        Port.                                        │
  │  items.address          string   Empty       Path to historian item.                      │
  │  items.group            string   Empty       Historian item group.                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: timebaseWsSource1                                                                │
  │    connector: TimebaseWS                                                                  │
  │    address: localhost                                                                     │
  │    port: 4511                                                                             │
  │    items:                                                                                 │
  │      - name: plcExecution                                                                 │
  │        group: MQTT Data                                                                   │
  │        address: dime/eipSource1/Execution/Data                                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
