```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX05 — MODBUS TCP REGISTERS                                            DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Reads Modbus TCP holding registers from a Banner Engineering device. Demonstrates     │
  │  the ModbusTCP source connector with register-type addressing, multi-register reads,   │
  │  and Lua struct library for binary decoding. The init_script loads the Lua struct      │
  │  library once at startup; item scripts extract register values.                        │
  │  Multi-file YAML config with three files: source, sink, and main.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌───────────────────────────┐
      │   Modbus TCP Source       │          ┌──────────────────┐
      │   (modbusSource1)         │     ┌───▶│  Console Sink    │  stdout
      │                           │     │    │  (console)       │
      │   device: 192.168.111.215 │     │    └──────────────────┘
      │   port:   502             ├─────┘
      │   slave:  199             │
      │                           │
      │   Items (holding regs):   │
      │   · ResyncTimer      1 reg│
      │   · ResyncTimerRoll  2 reg│
      │   · RebootCause      2 reg│
      │   · WatchdogReset    2 reg│
      │   · HttpPushAttempts 2 reg│
      │                           │
      │   scan: 1000ms            │
      └───────────────────────────┘
             SOURCE                         RING BUFFER               SINK
       (Modbus TCP polling)               (4096 slots)          (console output)

  CONFIGURATION — 3 files                                                     [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── modbusSource1.yaml ────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  modbusSource1: &modbusSource1                                                         │
  │    name: modbusSource1                                                                 │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Poll every 1 second                 │
  │    connector: ModbusTCP                          # Modbus TCP client connector         │
  │    rbe: !!bool true                              # Only publish on change              │
  │    address: 192.168.111.215                      # Device IP address                   │
  │    port: !!int 502                               # Modbus TCP port (standard)          │
  │    slave: !!int 199                              # Modbus slave/unit ID                │
  │    timeout: !!int 1000                           # Connection timeout (ms)             │
  │    init_script: |                                                                      │
  │      struct = require('struct')                  # Load Lua struct for binary decode   │
  │    items:                                                                              │
  │      - name: ResyncTimer                                                               │
  │        enabled: !!bool true                                                            │
  │        type: !!int 3                             # 3 = Holding Register (FC 03)        │
  │        address: !!int 10011                      # Starting register address           │
  │        count: !!int 1                            # Read 1 register (16 bits)           │
  │        script: |                                                                       │
  │          return result[0]                        # Extract single register value       │
  │      - name: ResyncTimerRollover                                                       │
  │        enabled: !!bool true                                                            │
  │        type: !!int 3                             # Holding Register                    │
  │        address: !!int 10013                                                            │
  │        count: !!int 2                            # Read 2 registers (32 bits)          │
  │        script: |                                                                       │
  │          return result                           # Return register array               │
  │      - name: RebootCause                                                               │
  │        enabled: !!bool true                                                            │
  │        type: !!int 3                                                                   │
  │        address: !!int 10015                                                            │
  │        count: !!int 2                                                                  │
  │        script: |                                                                       │
  │          return result                                                                 │
  │      - name: WatchdogResetCount                                                        │
  │        enabled: !!bool true                                                            │
  │        type: !!int 3                                                                   │
  │        address: !!int 10017                                                            │
  │        count: !!int 2                                                                  │
  │        script: |                                                                       │
  │          return result                                                                 │
  │      - name: HttpPushAttempts                                                          │
  │        enabled: !!bool true                                                            │
  │        type: !!int 3                                                                   │
  │        address: !!int 10031                                                            │
  │        count: !!int 2                                                                  │
  │        script: |                                                                       │
  │          return result                                                                 │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # Write to console every 1s           │
  │    connector: Console                            # stdout output                       │
  │    exclude_filter:                                                                     │
  │      - modbusSource1/$SYSTEM                     # Suppress system heartbeat msgs      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/       # Admin REST API                      │
  │    ws_server_uri: ws://127.0.0.1:9998/            # Admin WebSocket                    │
  │                                                                                        │
  │  sinks:                                                                                │
  │    - *console                                    # Anchor from console.yaml            │
  │                                                                                        │
  │  sources:                                                                              │
  │    - *modbusSource1                              # Anchor from modbusSource1.yaml      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  • Modbus TCP Connector — DIME's ModbusTCP connector polls a Modbus slave device       │
  │    over TCP/IP on port 502. Each item specifies the function code (type), starting     │
  │    register address, and number of registers to read (count).                          │
  │                                                                                        │
  │  • Register Types — The type field maps to Modbus function codes:                      │
  │      1 = Coils (FC 01)          2 = Discrete Inputs (FC 02)                            │
  │      3 = Holding Registers (FC 03)   4 = Input Registers (FC 04)                       │
  │    This example reads holding registers (type: 3), the most common register type.      │
  │                                                                                        │
  │  • Multi-Register Reads — count: 2 reads two consecutive 16-bit registers (32 bits     │
  │    total). The result is an array indexed from 0. Use Lua struct library to decode     │
  │    multi-register values into floats, 32-bit integers, or other binary formats.        │
  │                                                                                        │
  │  • Lua struct Library — The init_script loads struct = require('struct'). This         │
  │    provides binary pack/unpack for converting raw register bytes into typed values.    │
  │    Example: struct.unpack('>f', bytes) decodes a big-endian 32-bit float.              │
  │                                                                                        │
  │  • Slave/Unit ID — Modbus TCP devices have a unit ID (slave). For single devices       │
  │    this is often 1 or 255. Gateways use it to route to downstream serial devices.      │
  │    This Banner device uses slave ID 199.                                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
