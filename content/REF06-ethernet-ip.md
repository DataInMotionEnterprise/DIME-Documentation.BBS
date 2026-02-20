
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF06 — Ethernet/IP                                                 CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from Allen-Bradley PLCs.                                                      │
  │                                                                                           │
  │  Connector Type: EthernetIP                          Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "EthernetIP".                │
  │  type                   string   ControlLogix PLC type ('ControlLogix','Plc5',            │
  │                                              'Slc500','LogixPccc','Micro800',              │
  │                                              'MicroLogix','Omron').                        │
  │  address                string   Empty       PLC hostname, IP address.                    │
  │  path                   string   1,0         Connection path.                             │
  │  log                    int      0           Library log level (0-5).                     │
  │  timeout                int      1000        PLC read timeout in milliseconds.            │
  │  bypass_ping            bool     FALSE       Ping PLC before reading.                     │
  │  items.type             string   Empty       PLC register type ('bool','ubyte',           │
  │                                              'byte','ushort','short','uint','int',         │
  │                                              'ulong','long','float','double','string').    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: plcSource1                                                                       │
  │    connector: EthernetIP                                                                  │
  │    type: MicroLogix                                                                       │
  │    address: 192.168.111.20                                                                │
  │    path: 1,0                                                                              │
  │    log: !!int 0                                                                           │
  │    timeout: !!int 1000                                                                    │
  │    bypass_ping: !!bool true                                                               │
  │    items:                                                                                 │
  │      - name: boolTag1                                                                     │
  │        type: bool                                                                         │
  │        address: B3:0/2                                                                    │
  │      - name: intTag2                                                                      │
  │        type: int                                                                          │
  │        address: N7:1                                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Libplctag.NET Github: https://github.com/libplctag/libplctag.NET                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
