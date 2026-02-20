
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF03 — Beckhoff ADS                                                CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from Beckhoff PLCs.                                                           │
  │                                                                                           │
  │  Connector Type: BeckhoffADS                         Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "BeckhoffADS".               │
  │  local_netid            string   Empty       Local AMS Net ID.                            │
  │  address                string   Empty       Remote AMS Net ID.                           │
  │  target_ip              string   Empty       IPv4 address to remote AMS Net ID.           │
  │  port                   int      851         ADS port.                                    │
  │  items.type             string   Empty       PLC register type ('bool','sbyte',           │
  │                                              'short','int','long','float','string').      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: ads1                                                                             │
  │    connector: BeckhoffADS                                                                 │
  │    local_netid: 1.1.1.1.1.1                                                               │
  │    target_ip: 192.168.111.191                                                             │
  │    address: 192.168.111.191.1.1                                                           │
  │    port: !!int 851                                                                        │
  │    items:                                                                                 │
  │      - name: boolTag1                                                                     │
  │        type: bool                                                                         │
  │        address: MAIN.someBool                                                             │
  │      - name: intTag2                                                                      │
  │        type: int                                                                          │
  │        address: MAIN.someInt                                                              │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  TwinCAT 3 | ADS Basics:                                                                  │
  │  https://infosys.beckhoff.com/english.php?content=../content/1033/                        │
  │  tc3_ads_intro/index.html                                                                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
