```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX34 — UDP BINARY PROTOCOL                                          DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Parses binary UDP packets from an overhead crane controller using Lua bitwise         │
  │  operations. A 30-byte binary message encodes microspeed, anti-sway, crane status,     │
  │  3-axis motion (bridge/trolley/hoist), motor current, frequency, and load cell data.   │
  │  The script uses emit() to fan out 20+ observations from one packet, with deadzone     │
  │  filtering to suppress noise on analog values.                                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌─────────────────────────────┐
       │   Crane Controller          │
       │   (UDP binary packets)      │
       │                             │
       │   30 bytes per message:     │
       │   [0]  microspeed           │
       │   [1]  anti_sway            │
       │   [2]  load_centering       │
       │   [3]  hoist_upper_limit    │
       │   [4]  crane_latch_status   │
       │   [5]  receiver_status      │
       │   ...                       │
       │   [10-11] move north/south  │
       │   [12-13] move east/west    │         ┌───────────────────────┐
       │   [14-15] move up/down      │         │  Disruptor Ring       │
       │   [16-27] freq + current    │────────▶│  Buffer (4096)        │
       │   [28-29] hoist load cell   │  UDP    │                       │
       └─────────────────────────────┘  :2232  └───────────┬───────────┘
                                                           │
            1 SOURCE                                       ▼
        (UdpServer connector                         ┌────────────┐
         100ms scan)                                 │  Console   │
                                                     │  Sink      │
                 Lua emit() fans out:                └────────────┘
                 ./X/Current, ./X/Frequency,
                 ./X/State, ./X/Direction,              1 SINK
                 ./X/Velocity, ./X/Condition,
                 ./Y/*, ./Z/*, ./Z/Mass, ./Z/Load

  CONFIGURATION                                                          [3 files, 0 folders]
  ─────────────

  ┌─ udp.yaml ───────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  udp: &udp                                                                               │
  │    name: 2232                              # Named after the port number                 │
  │    connector: UdpServer                                                                  │
  │    address: 127.0.0.1                                                                    │
  │    port: !!int 2232                                                                      │
  │    scan_interval: !!int 100                # 10Hz polling for responsive crane control   │
  │    itemized_read: !!bool true                                                            │
  │    sink:                                                                                 │
  │      transform:                                                                          │
  │        type: script                                                                      │
  │        template: Message.Data                                                            │
  │    init_script: |                                                                        │
  │      moses = require('moses')              # Utility library for table operations        │
  │                                                                                          │
  │      filter = function(variable_name, current_value, deadzone)                           │
  │        if not _G[variable_name] then                                                     │
  │          _G[variable_name] = 0                                                           │
  │        end                                                                               │
  │        local difference = math.abs(current_value - _G[variable_name])                    │
  │        if difference > deadzone then                                                     │
  │          _G[variable_name] = current_value                                               │
  │          return false                      # NOT filtered -- value changed significantly │
  │        else                                                                              │
  │          _G[variable_name] = current_value                                               │
  │          return true                       # Filtered -- change within deadzone          │
  │        end                                                                               │
  │      end                                                                                 │
  │                                                                                          │
  │    items:                                                                                │
  │      - name: message                                                                     │
  │        address: message                                                                  │
  │        script: |                                                                         │
  │          -- TROLLEY (X axis): move East/West                                             │
  │          local x_stopped = result[12] == 0 and result[13] == 0                           │
  │          local x_moving_east = result[12] > 0                                            │
  │          local x_current = ((result[22] << 8) + result[23]) / 10                         │
  │          local x_frequency = ((result[20] << 8) + result[21]) / 100                      │
  │                                                                                          │
  │          -- Deadzone filter: only emit if change > threshold                             │
  │          if not filter("x_current", x_current, 0.5) then                                 │
  │            emit('./X/Current', x_current)                                                │
  │          end                                                                             │
  │          if not filter("x_frequency", x_frequency, 1) then                               │
  │            emit('./X/Frequency', x_frequency)                                            │
  │          end                                                                             │
  │          emit('./X/State', x_stopped and "STOPPED" or "TRAVEL")                          │
  │          emit('./X/Condition',                                                           │
  │            moses.include({4}, result[8]) and "FAULT" or "NORMAL")                        │
  │          emit('./X/Direction',                                                           │
  │            x_stopped and "NONE" or x_moving_east and "POSITIVE" or "NEGATIVE")           │
  │          emit('./X/Velocity',                                                            │
  │            x_stopped and 0 or x_moving_east and result[12] or result[13]*-1)             │
  │                                                                                          │
  │          -- BRIDGE (Y axis): move North/South   (similar pattern)                        │
  │          -- HOIST (Z axis): move Up/Down + load cell + mass                              │
  │          local z_mass = ((result[28] << 8) + result[29]) / 2.205                         │
  │          local z_load = (z_mass / 5500) * 100   # Load as percentage                     │
  │          ...                                                                             │
  │          emit('./Z/Mass', z_mass)                                                        │
  │          emit('./Z/Load', z_load)                                                        │
  │                                                                                          │
  │          return nil                        # All output via emit()                       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ console.yaml ───────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  console: &console                                                                       │
  │    connector: Console                                                                    │
  │    use_sink_transform: !!bool true                                                       │
  │    exclude_filter:                                                                       │
  │      - 2232/$SYSTEM                       # Exclude system messages by source name       │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *udp                                                                                │
  │  sinks:                                                                                  │
  │    - *console                                                                            │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  BINARY MESSAGE FORMAT
  ─────────────────────

  ┌─ Byte Map ───────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  Byte  Description                    Values                                             │
  │  ────  ────────────────────────────── ──────────────────────────                         │
  │  [0]   microspeed                     0=off, 1=on                                        │
  │  [1]   anti_sway                      0=disabled, 1=enabled                              │
  │  [2]   load_centering                 0=disabled, 1=enabled                              │
  │  [3]   hoist_upper_limit              0=below, 1=at limit                                │
  │  [4]   crane_latch_status             0=unlatched, 1=latched                             │
  │  [5]   receiver_status                0=idle, 1=active, 2=not released                   │
  │  [6]   group_control_switch           0=all, 1=north, 2=center, 3=south                  │
  │  [7]   tandem_status                  0=inactive, 1=single, 2=two pt, 3=three pt         │
  │  [8]   fault                          0=none, 3=bridge, 4=trolley, 5=hoist ...           │
  │  [9]   mode                           10=normal, 20=latching, 80=recovery ...            │
  │  [10]  move north (speed 0-5)                                                            │
  │  [11]  move south (speed 0-5)                                                            │
  │  [12]  move east  (speed 0-5)                                                            │
  │  [13]  move west  (speed 0-5)                                                            │
  │  [14]  move up    (speed 0-5)                                                            │
  │  [15]  move down  (speed 0-5)                                                            │
  │  [16-17] bridge frequency    (big-endian uint16 / 100)                                   │
  │  [18-19] bridge current      (big-endian uint16 / 10)                                    │
  │  [20-21] trolley frequency   (big-endian uint16 / 100)                                   │
  │  [22-23] trolley current     (big-endian uint16 / 10)                                    │
  │  [24-25] hoist frequency     (big-endian uint16 / 100)                                   │
  │  [26-27] hoist current       (big-endian uint16 / 10)                                    │
  │  [28-29] hoist load cell     (big-endian uint16 / 2.205 for lbs-to-kg)                   │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Binary Parsing in Lua -- The result variable is a byte array. Lua bitwise shift     │
  │    operators (<< and >>) combine big-endian uint16 values: ((result[22] << 8) +        │
  │    result[23]) / 10 extracts trolley current from bytes 22-23.                         │
  │                                                                                        │
  │  * Deadzone Filtering -- The filter() function tracks previous values in Lua global    │
  │    variables (_G). If the change is less than the deadzone threshold, the emit is      │
  │    suppressed. Current uses 0.5A deadzone; frequency uses 1 Hz. This dramatically      │
  │    reduces message traffic from noisy analog sensors.                                  │
  │                                                                                        │
  │  * emit() Fan-Out -- One UDP packet produces 20+ observations via emit(). Each axis    │
  │    (X/Y/Z) gets Current, Frequency, State, Direction, Velocity, and Condition.         │
  │    The hoist (Z) additionally gets Mass and Load. Returning nil suppresses the raw     │
  │    packet.                                                                             │
  │                                                                                        │
  │  * Fault Code Mapping -- The fault byte (result[8]) maps to specific drive faults.     │
  │    moses.include({4}, result[8]) checks if the fault code is trolley-specific.         │
  │    Different fault codes map to different axis Condition items.                        │
  │                                                                                        │
  │  * UdpServer Connector -- DIME listens as a UDP server on the specified port. The      │
  │    100ms scan_interval provides responsive crane control monitoring. Unlike TCP,       │
  │    UDP is connectionless so no handshake overhead per message.                         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```