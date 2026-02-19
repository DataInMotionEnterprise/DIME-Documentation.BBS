```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        10 — Cache API                                 │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Share state across connectors.                 │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Remember values between cycles.                │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE PROBLEM                                                                                    │
│   ───────────                                                                                    │
│                                                                                                  │
│   Sources run independently. Each has its own scan cycle and timer.                              │
│   But sometimes a script in Source A needs data that Source B collected.                         │
│                                                                                                  │
│    ┌──────────┐     scan cycle 1     ┌──────────────────┐                                        │
│    │ Source A │────────────────────▶ │   Ring Buffer    │    Source A has no way                 │
│    │  (PLC)   │     scan cycle 2     │                  │    to see Source B's                   │
│    └──────────┘────────────────────▶ │   Messages flow  │    temperature value.                  │
│                                      │   forward only.  │                                        │
│    ┌──────────┐     scan cycle 1     │                  │    Scripts run in                      │
│    │ Source B │────────────────────▶ │   No cross-read. │    isolation.                          │
│    │ (Weather)│     scan cycle 2     │                  │                                        │
│    └──────────┘────────────────────▶ └──────────────────┘                                        │
│                                                                                                  │
│   The cache API solves this. Every value that enters the ring buffer is cached.                  │
│   Any script, anywhere, can read any cached value at any time.                                   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   READING CACHED VALUES                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   cache( path, default )              Read the last known value for any message path.    │   │
│   │   ─────────────────────               Returns default if path has not been seen yet.     │   │
│   │                                                                                          │   │
│   │     local temp = cache('plc1/temperature', 0)        -- returns number or 0              │   │
│   │     local name = cache('erp/machine_name', 'unknown')  -- returns string or default      │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   cache_ts( path, default )           Read value AND its timestamp as a tuple.           │   │
│   │   ─────────────────────────           Use this to check data freshness.                  │   │
│   │                                                                                          │   │
│   │     local val, ts = cache_ts('plc1/temperature', 0)                                      │   │
│   │     if (os.time() - ts) > 60 then                                                        │   │
│   │       return -1  -- stale data, older than 60 seconds                                    │   │
│   │     end                                                                                  │   │
│   │     return val                                                                           │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WRITING TO THE CACHE                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   set( path, value )                  Write a custom value into the user cache.          │   │
│   │   ──────────────────                  Does NOT publish to the ring buffer.               │   │
│   │                                       Only stores for later cache() reads.               │   │
│   │                                                                                          │   │
│   │     local count = cache('my_counter', 0)                                                 │   │
│   │     set('my_counter', count + 1)            -- increment a persistent counter            │   │
│   │                                                                                          │   │
│   │     set('machine/state', 'RUNNING')         -- store a state machine value               │   │
│   │     set('batch/average', running_avg)       -- store a computed result                   │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   cache() vs emit()      cache() = read silently     set() = store silently              │   │
│   │   ──────────────────     emit()  = publish to ring buffer for all sinks                  │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CROSS-CONNECTOR ACCESS                                                                         │
│   ──────────────────────                                                                         │
│                                                                                                  │
│   Any script in any connector can read any path from any other connector.                        │
│                                                                                                  │
│    ┌──────────────┐                          ┌──────────────────────────────────┐                │
│    │  Source: plc1│───▶ plc1/temperature ──▶ │                                  │                │
│    │  (OPC-UA)    │───▶ plc1/pressure   ──▶  │         CACHE STORE              │                │
│    └──────────────┘                          │                                  │                │
│                                              │   plc1/temperature  = 72.5       │                │
│    ┌──────────────┐                          │   plc1/pressure     = 14.7       │                │
│    │  Source: wx  │───▶ wx/humidity     ──▶  │   wx/humidity       = 45.2       │                │
│    │  (Weather)   │───▶ wx/ambient_temp ──▶  │   wx/ambient_temp   = 68.1       │                │
│    └──────────────┘                          │   my_counter        = 17         │                │
│                                              │                                  │                │
│                                              └──────────┬───────────────────────┘                │
│                                                         │                                        │
│                              ┌──────────────────────────┘                                        │
│                              │  cache('plc1/temperature', 0)  ──▶ 72.5                           │
│                              │  cache('wx/humidity', 0)        ──▶ 45.2                          │
│                              │  cache('my_counter', 0)         ──▶ 17                            │
│                              ▼                                                                   │
│    ┌──────────────────────────────────────────┐                                                  │
│    │  Source: enricher (Script connector)     │                                                  │
│    │                                          │                                                  │
│    │  script: |                               │                                                  │
│    │    local temp = cache('plc1/temp', 0)    │                                                  │
│    │    local hum  = cache('wx/humidity', 0)  │                                                  │
│    │    emit('combined/comfort_index',        │                                                  │
│    │         temp - (0.55 * (1 - hum/100)     │                                                  │
│    │              * (temp - 58)))             │                                                  │
│    └──────────────────────────────────────────┘                                                  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   USE CASES                                                                                      │
│   ─────────                                                                                      │
│                                                                                                  │
│   ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐             │
│   │                        │  │                        │  │                        │             │
│   │   COMBINE DATA         │  │   RUNNING AVERAGES     │  │   STATE MACHINES       │             │
│   │                        │  │                        │  │                        │             │
│   │  Read PLC temp and     │  │  Accumulate values     │  │  Track machine state   │             │
│   │  weather humidity.     │  │  across scan cycles.   │  │  across cycles.        │             │
│   │  Compute comfort       │  │  Store running sum     │  │  set('state', 'RUN')   │             │
│   │  index in one output.  │  │  and count in cache.   │  │  Transition on events. │             │
│   │                        │  │                        │  │                        │             │
│   └────────────────────────┘  └────────────────────────┘  └────────────────────────┘             │
│                                                                                                  │
│   ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐             │
│   │                        │  │                        │  │                        │             │
│   │   CORRELATE EVENTS     │  │   THRESHOLD ALERTS     │  │   BATCH COUNTERS       │             │
│   │                        │  │                        │  │                        │             │
│   │  Match alarm from      │  │  Compare current       │  │  Count parts across    │             │
│   │  PLC with operator     │  │  value against a       │  │  cycles. Persist       │             │
│   │  action from MES.      │  │  cached limit.         │  │  between restarts.     │             │
│   │  Same timestamp?       │  │  Emit alert if over.   │  │  Reset on shift.       │             │
│   │                        │  │                        │  │                        │             │
│   └────────────────────────┘  └────────────────────────┘  └────────────────────────┘             │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DEPENDENCY ORDERING WITH wait_for_connectors                                                   │
│   ────────────────────────────────────────────                                                   │
│                                                                                                  │
│   Problem: If the enricher runs before plc1 has data, cache() returns the default.               │
│   Solution: wait_for_connectors delays a source until its dependencies have connected.           │
│                                                                                                  │
│    ┌───────────────────────────────────────────────────────────────────────────────────────┐     │
│    │                                                                                       │     │
│    │   sources:                                                                            │     │
│    │     - name: plc1                                                                      │     │
│    │       connector: OpcUA                  ─┐                                            │     │
│    │       address: 192.168.1.10              │  These must connect first.                 │     │
│    │                                          │                                            │     │
│    │     - name: weather                      │                                            │     │
│    │       connector: HttpClient             ─┘                                            │     │
│    │       address: https://api.weather.com                                                │     │
│    │                                                                                       │     │
│    │     - name: enricher                                                                  │     │
│    │       connector: Script                                                               │     │
│    │       wait_for_connectors:              ◀── Enricher waits until plc1 AND weather     │     │
│    │         - plc1                               have connected and produced data.        │     │
│    │         - weather                                                                     │     │
│    │       script: |                                                                       │     │
│    │         local t = cache('plc1/temperature', 0)                                        │     │
│    │         local h = cache('weather/humidity', 0)                                        │     │
│    │         return t .. ',' .. h                                                          │     │
│    │                                                                                       │     │
│    └───────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   ┌──────────┐      ┌──────────┐                    ┌────────────┐                               │
│   │  plc1    │─────▶│          │     cache()        │  enricher  │        ┌──────────┐           │
│   │  (OPC-UA)│      │  CACHE   │◀───────────────────│  (Script)  │───────▶│  Sink    │           │
│   └──────────┘      │  STORE   │     cache()        │            │        │  (MQTT)  │           │
│   ┌──────────┐      │          │◀───────────────────│  Reads     │        │          │           │
│   │  weather │─────▶│          │                    │  both.     │        │ Combined │           │
│   │  (HTTP)  │      └──────────┘                    │  Emits     │        │ output   │           │
│   └──────────┘                                      │  combined. │        └──────────┘           │
│                                                     └────────────┘                               │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
