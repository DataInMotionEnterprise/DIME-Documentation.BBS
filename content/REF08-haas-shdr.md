
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF08 — Haas SHDR                                                   CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Receives SHDR-like streaming data from a Haas controller over an                         │
  │  undocumented port.                                                                       │
  │                                                                                           │
  │  Connector Type: HaasSHDR                            Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "HaasSHDR".                  │
  │  itemized_read          bool     FALSE       Match streaming data against items list.     │
  │  address                string   Empty       Controller IP hostname or address.           │
  │  port                   int      9998        Controller port number.                      │
  │  timeout                int      1000        Connection timeout in milliseconds.          │
  │  heartbeat_interval     int      4000        Heartbeat frequency in milliseconds.         │
  │  retry_interval         int      10000       Retry frequency in milliseconds.             │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: haasSource1                                                                      │
  │    connector: HaasSHDR                                                                    │
  │    itemized_read: !!bool true                                                             │
  │    address: 192.168.111.221                                                               │
  │    port: !!int 9998                                                                       │
  │    timeout: !!int 1000                                                                    │
  │    heartbeat_interval: !!int 4000                                                         │
  │    retry_interval: !!int 10000                                                            │
  │    items:                                                                                 │
  │      - name: CPU                                                                          │
  │        enabled: !!bool true                                                               │
  │        address: CPU                                                                       │
  │        script: |                                                                          │
  │          if tonumber(result) > 0.5 then                                                   │
  │            return 'HIGH';                                                                 │
  │          else                                                                             │
  │            return 'LOW';                                                                  │
  │          end                                                                              │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  NOTES
  ─────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  This source connector is experimental and communicates with the Haas controller          │
  │  using an undocumented port. In newer NGC software releases this port has been             │
  │  closed; use Haas Q or XML Web Scraper source connectors instead. There is a known        │
  │  issue where the controller stops streaming data and the NGC must be restarted.            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
