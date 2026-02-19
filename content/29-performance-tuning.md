```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        29 — Performance Tuning                        │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Optimize for throughput, latency,              │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          or resource constraints.                       │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   RING BUFFER SIZING                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   The ring buffer is the heart of DIME. Size it correctly for your workload.                     │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   app:                                                                                 │     │
│   │     ring_buffer: !!int 4096     ◀── Must be a power of 2                               │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   VALID SIZES                    WHY POWER OF 2?                                       │     │
│   │   ───────────                    ────────────────                                      │     │
│   │   1024  — low-memory edge        The Disruptor pattern uses                            │     │
│   │   2048  — constrained ARM        bitwise AND for index wrapping:                       │     │
│   │   4096  — default (recommended)    index = sequence & (size - 1)                       │     │
│   │   8192  — high-throughput         This is faster than modulo and                       │     │
│   │   16384 — burst-heavy workloads   requires power-of-2 size.                            │     │
│   │   32768 — maximum burst capacity                                                       │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   SIZE TRADEOFFS                                                                       │     │
│   │   ──────────────                                                                       │     │
│   │                                                                                        │     │
│   │   Larger buffer:                          Smaller buffer:                              │     │
│   │     + More burst absorption capacity        + Lower memory footprint                   │     │
│   │     + Tolerates slow sinks longer            + Lower latency (tighter loop)            │     │
│   │     - Higher memory usage                    - Less burst headroom                     │     │
│   │     - Slightly higher latency                - Backpressure sooner                     │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SCAN INTERVAL TUNING                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   scan_interval controls how often a source reads from its device. Choose wisely.                │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   INTERVAL        USE CASE                    CPU IMPACT       NOTES                   │     │
│   │   ────────        ────────                    ──────────       ─────                   │     │
│   │    50ms           Vibration / high-speed       ████████        Device must support it  │     │
│   │   100ms           Real-time dashboards         ██████          10 reads/sec per item   │     │
│   │   500ms           Fast monitoring              ████            Good balance            │     │
│   │  1000ms           Typical monitoring           ███             Default, recommended    │     │
│   │  5000ms           Slow-changing data           █               Temperature, humidity   │     │
│   │ 30000ms           Environmental sensors        ▏               Energy meters, weather  │     │
│   │ 60000ms           Config polling               ▏               Check for changes only  │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   Combine with execute_every for per-item throttling:                                  │     │
│   │                                                                                        │     │
│   │   scan_interval: !!int 1000                                                            │     │
│   │   items:                                                                               │     │
│   │     - name: fast_temp                                                                  │     │
│   │       execute_every: !!int 1      ── Every cycle = 1 Hz                                │     │
│   │     - name: slow_humidity                                                              │     │
│   │       execute_every: !!int 30     ── Every 30th cycle = once per 30s                   │     │
│   │                                                                                        │     │
│   │   One source, two items, two different effective rates.                                │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   RBE IMPACT ON RING BUFFER PRESSURE                                                             │
│   ──────────────────────────────────                                                             │
│                                                                                                  │
│   Report By Exception dramatically reduces messages flowing through the ring buffer.             │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   100 items, 1-second scan, typical industrial data:                                   │     │
│   │                                                                                        │     │
│   │   WITHOUT RBE   ████████████████████████████████████████████  6,000 msg/min            │     │
│   │   WITH RBE      ███                                             300 msg/min            │     │
│   │                                                                                        │     │
│   │   95% reduction = ring buffer stays nearly empty = no backpressure risk.               │     │
│   │                                                                                        │     │
│   │   Enable RBE on every source unless you have a specific reason not to:                 │     │
│   │     rbe: !!bool true                                                                   │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   DOUBLE-BUFFER PATTERN                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   Sinks use a double-buffer to decouple ring buffer speed from write speed.                      │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │                          RING BUFFER (producer side)                                   │     │
│   │                                  │                                                     │     │
│   │                           SinkDispatcher                                               │     │
│   │                           pushes messages                                              │     │
│   │                                  │                                                     │     │
│   │                                  ▼                                                     │     │
│   │                      ┌─────────────────────┐                                           │     │
│   │                      │  RECEIVE BUFFER  [A]│◄── Messages accumulate here               │     │
│   │                      └──────────┬──────────┘                                           │     │
│   │                                 │                                                      │     │
│   │                          ATOMIC SWAP                                                   │     │
│   │                      (on sink timer tick)                                              │     │
│   │                                 │                                                      │     │
│   │                      ┌──────────┴──────────┐                                           │     │
│   │                      │  WRITE BUFFER    [B]│──── Sink writes from here                 │     │
│   │                      └─────────────────────┘                                           │     │
│   │                                 │                                                      │     │
│   │                                 ▼                                                      │     │
│   │                          DESTINATION                                                   │     │
│   │                      (InfluxDB, MQTT, etc.)                                            │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   Why this matters:                                                                    │     │
│   │     - Ring buffer is never blocked by slow sinks                                       │     │
│   │     - Receive buffer fills while write buffer drains                                   │     │
│   │     - Atomic swap is O(1) — just pointer exchange                                      │     │
│   │     - Each sink has its own buffer pair — full isolation                               │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BACKPRESSURE                                                                                   │
│   ────────────                                                                                   │
│                                                                                                  │
│   When a slow sink cannot keep up, the receive buffer grows.                                     │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   Normal operation:                                                                    │     │
│   │                                                                                        │     │
│   │   Sources ───▶ Ring Buffer ───▶ Sink Receive Buffer ───▶ Sink Write ───▶ Destination   │     │
│   │                                  [small, drains fast]                                  │     │
│   │                                                                                        │     │
│   │   Backpressure (slow sink):                                                            │     │
│   │                                                                                        │     │
│   │   Sources ───▶ Ring Buffer ───▶ Sink Receive Buffer ──X──▶ Slow Sink ···▶ Destination  │     │
│   │                                  [growing!]              write takes too long          │     │
│   │                                                                                        │     │
│   │   Symptoms:                                                                            │     │
│   │     - Memory usage grows steadily                                                      │     │
│   │     - $SYSTEM/TotalLoopTime increases on sinks                                         │     │
│   │     - Destination falls behind real-time                                               │     │
│   │                                                                                        │     │
│   │   Solutions:                                                                           │     │
│   │     1. Enable RBE to reduce message volume (rbe: !!bool true)                          │     │
│   │     2. Increase sink scan_interval to batch more writes                                │     │
│   │     3. Use execute_every to throttle low-priority items                                │     │
│   │     4. Check destination latency (network, database load)                              │     │
│   │     5. Add include_filter to sink — only receive what you need                         │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FINDING BOTTLENECKS WITH $SYSTEM METRICS                                                       │
│   ────────────────────────────────────────                                                       │
│                                                                                                  │
│   Every source publishes timing data automatically. Use it to find what is slow.                 │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   GET http://localhost:9999/status                                                     │     │
│   │                                                                                        │     │
│   │   Key metrics per source connector:                                                    │     │
│   │                                                                                        │     │
│   │   ┌──────────── One Scan Cycle ──────────────────────────────────────────┐             │     │
│   │   │                                                                      │             │     │
│   │   │  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌───────────────┐      │             │     │
│   │   │  │ ReadTime  │  │ ScriptTime │  │  RBE     │  │ Publish to    │      │             │     │
│   │   │  │ (device)  │  │ (Lua/Py)   │  │  check   │  │ ring buffer   │      │             │     │
│   │   │  └───────────┘  └────────────┘  └──────────┘  └───────────────┘      │             │     │
│   │   │                                                                      │             │     │
│   │   │  ◄─────────────── TotalLoopTime ───────────────────────────────────▶ │             │     │
│   │   │                                                                      │             │     │
│   │   └──────────────────────────────────────────────────────────────────────┘             │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   WHAT TO LOOK FOR                                                                     │     │
│   │   ────────────────                                                                     │     │
│   │                                                                                        │     │
│   │   TotalLoopTime > scan_interval  ── Source cannot keep up! Reduce items or increase    │     │
│   │                                      scan_interval.                                    │     │
│   │                                                                                        │     │
│   │   MaxReadTime >> MinReadTime     ── Device has intermittent latency. Check network     │     │
│   │                                      or device load.                                   │     │
│   │                                                                                        │     │
│   │   ScriptTime is high             ── Lua/Python script is too complex. Optimize or      │     │
│   │                                      move heavy logic to a downstream service.         │     │
│   │                                                                                        │     │
│   │   MessagesAttempted >> Accepted  ── RBE is working well. Most values unchanged.        │     │
│   │                                                                                        │     │
│   │   MessagesAttempted == Accepted  ── RBE not effective. Data volatile or RBE is off.    │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LUA OPTIMIZATION TIPS                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   Keep scripts fast. Every millisecond in ScriptTime is a millisecond added to TotalLoopTime.    │
│                                                                                                  │
│     1. Avoid heavy computation  ──  Move complex math to a downstream service                    │
│     2. Cache globals locally    ──  local floor = math.floor (avoids table lookups)              │
│     3. Minimize string concat   ──  Use table.concat() for building strings                      │
│     4. No file I/O in scripts   ──  Disk reads block the scan loop                               │
│     5. No HTTP calls in scripts ──  Network latency kills scan timing                            │
│     6. Prefer emit() over return──  emit() gives you path control                                │
│                                                                                                  │
│   Target: ScriptTime < 1ms for most transforms.                                                  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
