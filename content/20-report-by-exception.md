```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        20 — Report By Exception                       │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Only send what changed.                        │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Reduce data volume by 90%+.                    │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE PROBLEM                                                                                    │
│   ───────────                                                                                    │
│                                                                                                  │
│   A PLC reports temperature every second. The value only changes once a minute.                  │
│   59 out of 60 readings are duplicates. Your database stores all of them.                        │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   PLC reads temp every 1 second.  Value = 72.5 for 59 seconds, then 72.6.              │     │
│   │                                                                                        │     │
│   │   WITHOUT RBE  (60 messages per minute):                                               │     │
│   │                                                                                        │     │
│   │   t=0   t=1   t=2   t=3   t=4   ...  t=58  t=59                                        │     │
│   │    ●     ●     ●     ●     ●    ····   ●     ◆                                         │     │
│   │   72.5  72.5  72.5  72.5  72.5        72.5  72.6                                       │     │
│   │   ───────────────────────────────────────────────▶ time                                │     │
│   │   ALL sent. 59 duplicates. 1 real change.                                              │     │
│   │                                                                                        │     │
│   │   WITH RBE  (2 messages per minute):                                                   │     │
│   │                                                                                        │     │
│   │   t=0                                       t=59                                       │     │
│   │    ●                                          ◆                                        │     │
│   │   72.5                                       72.6                                      │     │
│   │   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶ time                                    │     │
│   │   Only changes sent. 58 duplicates eliminated.                                         │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   MESSAGE VOLUME COMPARISON                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   Messages per minute for a temperature sensor reading every 1 second:                           │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   WITHOUT RBE  ████████████████████████████████████████████████████████████  60 msg/min│     │
│   │                                                                                        │     │
│   │   WITH RBE     ██                                                            2 msg/min │     │
│   │                                                                                        │     │
│   │   10 sensors, 1-second scan, 1 hour:                                                   │     │
│   │                                                                                        │     │
│   │   WITHOUT RBE  ████████████████████████████████████████████████  36,000 messages       │     │
│   │                                                                                        │     │
│   │   WITH RBE     █                                                   ~600 messages       │     │
│   │                                                                                        │     │
│   │   Reduction: 98.3%                                                                     │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HOW RBE WORKS                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   Each source connector caches the last published value per item.                                │
│   Before publishing, compare new value to cached value. Same? Skip it.                           │
│                                                                                                  │
│       ┌─────────────┐     Read       ┌──────────────────┐     Compare      ┌──────────────┐      │
│       │   Device    │───────────────▶│   New value:     │────────────────▶ │  Same as     │      │
│       │   (PLC)     │                │   72.5           │                  │  last sent?  │      │
│       └─────────────┘                └──────────────────┘                 └──────┬───────┘       │
│                                                                                  │               │
│                                                                     ┌────────────┴──────────┐    │
│                                                                     │                       │    │
│                                                                    YES                     NO    │
│                                                                     │                       │    │
│                                                                     ▼                       ▼    │
│                                                              ┌────────────┐         ┌─────────┐  │
│                                                              │  SKIP      │         │ PUBLISH │  │
│                                                              │  (silent)  │         │ to ring │  │
│                                                              │            │         │ buffer  │  │
│                                                              │  Cache     │         │         │  │
│                                                              │  stays     │         │ Update  │  │
│                                                              │  same      │         │ cache   │  │
│                                                              └────────────┘         └─────────┘  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR-LEVEL RBE                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Enable RBE for ALL items on a source with one flag:                                            │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: plc1                                                                       │     │
│   │       connector: OpcUa                                                                 │     │
│   │       rbe: !!bool true            ◀── All items on this source use RBE                 │     │
│   │       scan_interval: !!int 1000                                                        │     │
│   │       items:                                                                           │     │
│   │         - name: temperature       ── RBE active (inherited)                            │     │
│   │         - name: pressure          ── RBE active (inherited)                            │     │
│   │         - name: flow_rate         ── RBE active (inherited)                            │     │
│   │         - name: vibration         ── RBE active (inherited)                            │     │
│   │                                                                                        │     │
│   │   One flag, all items covered. The most common pattern.                                │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ITEM-LEVEL RBE                                                                                 │
│   ──────────────                                                                                 │
│                                                                                                  │
│   Override RBE per item when some data needs every reading:                                      │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: plc1                                                                       │     │
│   │       connector: OpcUa                                                                 │     │
│   │       rbe: !!bool true            ◀── Default for this source                          │     │
│   │       items:                                                                           │     │
│   │         - name: temperature                                                            │     │
│   │           rbe: !!bool true        ── Changes only (uses source default)                │     │
│   │         - name: pressure                                                               │     │
│   │           rbe: !!bool true        ── Changes only                                      │     │
│   │         - name: alarm_count                                                            │     │
│   │           rbe: !!bool false       ── Every reading! Overrides source default           │     │
│   │         - name: heartbeat                                                              │     │
│   │           rbe: !!bool false       ── Always send (used for liveliness)                 │     │
│   │                                                                                        │     │
│   │   Item-level rbe overrides the source-level setting.                                   │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FORCE EMIT — BYPASSING RBE                                                                     │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   In a Lua script, pass true as the third argument to emit() to force publish:                   │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   emit( path, value )          ── Normal: RBE applies, skips if unchanged              │     │
│   │   emit( path, value, true )    ── Force:  Always publishes, RBE bypassed               │     │
│   │                                                                                        │     │
│   │   script: |                                                                            │     │
│   │     -- Normal emit: RBE will suppress duplicates                                       │     │
│   │     emit('sensor/temperature', result)                                                 │     │
│   │                                                                                        │     │
│   │     -- Force emit: always publish, even if same value                                  │     │
│   │     emit('critical/alarm', result, true)                                               │     │
│   │                                                                                        │     │
│   │     -- Use case: heartbeats, watchdogs, "I am alive" signals                           │     │
│   │     emit('system/heartbeat', os.time(), true)                                          │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   execute_every — COMPLEMENTARY THROTTLE                                                         │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   RBE suppresses unchanged values. execute_every skips entire scan cycles for slow items.        │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   scan_interval: 1000ms, execute_every: 10                                             │     │
│   │                                                                                        │     │
│   │   Cycle:  1    2    3    4    5    6    7    8    9    10   11   12  ...               │     │
│   │           ─    ─    ─    ─    ─    ─    ─    ─    ─    ●    ─    ─                     │     │
│   │          skip skip skip skip skip skip skip skip skip READ skip skip                   │     │
│   │                                                                                        │     │
│   │   Item is only read every 10th cycle = effectively every 10 seconds.                   │     │
│   │   Other items on the same source still read every cycle.                               │     │
│   │                                                                                        │     │
│   │   items:                                                                               │     │
│   │     - name: fast_sensor                                                                │     │
│   │       execute_every: !!int 1      ── Every cycle (default)                             │     │
│   │     - name: slow_sensor                                                                │     │
│   │       execute_every: !!int 10     ── Every 10th cycle                                  │     │
│   │     - name: glacial_sensor                                                             │     │
│   │       execute_every: !!int 60     ── Every 60th cycle (once per minute at 1s scan)     │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WHEN NOT TO USE RBE                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   RBE is perfect for most sensor data. But some data streams need every reading:                 │
│                                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│   │                          │  │                          │  │                          │       │
│   │   EVENT STREAMS          │  │   PRODUCTION COUNTS      │  │   ALARMS                 │       │
│   │                          │  │                          │  │                          │       │
│   │   Machine start/stop     │  │   Part counter may       │  │   Same alarm can fire    │       │
│   │   events that happen     │  │   increment by 1 each    │  │   repeatedly. Each       │       │
│   │   to have same value     │  │   time. Value "1" is     │  │   occurrence matters.    │       │
│   │   (e.g., "STOP" twice)   │  │   not a duplicate —      │  │   Do not suppress.       │       │
│   │   are NOT duplicates.    │  │   it's a new count.      │  │                          │       │
│   │                          │  │                          │  │   rbe: !!bool false      │       │
│   │   rbe: !!bool false      │  │   rbe: !!bool false      │  │                          │       │
│   │                          │  │                          │  │                          │       │
│   └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                                                  │
│   Rule of thumb: if the same value twice means two different things, disable RBE.                │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   QUICK REFERENCE                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────┐       │
│   │                                                                                      │       │
│   │   Feature            Config                          Level                           │       │
│   │   ─────────────────  ──────────────────────────────  ──────────                      │       │
│   │   RBE on/off         rbe: !!bool true/false          Source or Item                  │       │
│   │   Force publish      emit(path, val, true)           Script only                     │       │
│   │   Cycle throttle     execute_every: !!int N          Item only                       │       │
│   │   Scan interval      scan_interval: !!int ms         Source only                     │       │
│   │                                                                                      │       │
│   │   Combine RBE + execute_every for maximum reduction:                                 │       │
│   │   Read every 10th cycle, then suppress if unchanged = minimal traffic.               │       │
│   │                                                                                      │       │
│   └──────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
