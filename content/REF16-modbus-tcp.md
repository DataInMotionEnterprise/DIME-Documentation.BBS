
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF16 — Modbus TCP                                                  CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from a Modbus/TCP device.                                                     │
  │                                                                                           │
  │  Connector Type: ModbusTCP                               Source ✓    Sink ✗               │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "ModbusTCP".                 │
  │  address                string   Empty       Device hostname or IP address.               │
  │  port                   int      502         Port number.                                 │
  │  slave                  int      1           Modbus slave ID.                             │
  │  timeout                int      1000        Read timeout in milliseconds.                │
  │  items.address          string   Empty       Register address.                            │
  │  items.type             string   1           Register type (1-coil, 2-input, 3-holding,   │
  │                                              4-input register).                           │
  │  items.count            int      1           Number of consecutive registers to read.     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: modbusSource1                                                                    │
  │    connector: ModbusTCP                                                                   │
  │    address: 192.168.111.20                                                                │
  │    port: !!int 502                                                                        │
  │    slave: !!int 1                                                                         │
  │    timeout: !!int 1000                                                                    │
  │    init_script: struct = require('struct')                                                │
  │    items:                                                                                 │
  │      - name: coilTags                                                                     │
  │        type: !!int 1                                                                      │
  │        address: !!int 1                                                                   │
  │        count: !!int 10                                                                    │
  │      - name: holdingTags                                                                  │
  │        type: !!int 3                                                                      │
  │        address: !!int 24                                                                  │
  │        count: !!int 2                                                                     │
  │        script: |                                                                          │
  │          return struct.unpack('<I', struct.pack('<HH', result[0], result[1]));            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
