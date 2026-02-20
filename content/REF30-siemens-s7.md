
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF30 — Siemens S7                                                  CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads registers from a Siemens S7 PLC.                                                   │
  │                                                                                           │
  │  Connector Type: SiemensS7                             Source ✓    Sink ✗                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "SiemensS7".                 │
  │  type                   string   S71200      PLC type ('S71200','S7200','S7300',          │
  │                                              'S7400','S7200Smart','S71500',               │
  │                                              'Logo0BA8').                                 │
  │  address                string   Empty       PLC hostname or IP address.                  │
  │  port                   int      102         PLC port.                                    │
  │  rack                   int      0           PLC rack.                                    │
  │  slot                   int      0           PLC slot.                                    │
  │  bypass_ping            bool     FALSE       Ping PLC before reading.                     │
  │  items.address          string   Empty       Register address.                            │
  │  items.type             string   Empty       PLC register type ('bool','sbyte',           │
  │                                              'short','int','long','float','string').      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: plcSource1                                                                       │
  │    connector: SiemensS7                                                                   │
  │    type: S71200                                                                           │
  │    address: 192.168.111.20                                                                │
  │    port: !!int 102                                                                        │
  │    rack: !!int 0                                                                          │
  │    slot: !!int 0                                                                          │
  │    bypass_ping: !!bool true                                                               │
  │    items:                                                                                 │
  │      - name: input0                                                                       │
  │        type: bool                                                                         │
  │        address: I0.0                                                                      │
  │      - name: output0                                                                      │
  │        type: bool                                                                         │
  │        address: Q0.0                                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  S7netplus Github: https://github.com/S7NetPlus/s7netplus                                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
