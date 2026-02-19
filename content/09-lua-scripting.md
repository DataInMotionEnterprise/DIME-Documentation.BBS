```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        09 — Lua Scripting                             │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Transform, enrich, and fork                    │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          data with Lua or Python.                       │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SCRIPT EXECUTION LIFECYCLE                                                                     │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Scripts hook into six points in the connector lifecycle.                                       │
│   Each runs at a different stage — from startup to shutdown.                                     │
│                                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                                         │    │
│   │   CONNECTOR START                                                                       │    │
│   │        │                                                                                │    │
│   │        ▼                                                                                │    │
│   │   ┌──────────────┐   Runs ONCE at connector initialization.                             │    │
│   │   │  init_script │   Set up caches, load lookup tables, initialize state.               │    │
│   │   └──────┬───────┘                                                                      │    │
│   │          │                                                                              │    │
│   │          ▼                          ┌──────────────────────────────────────────┐         │   │
│   │   ┌──────────────────┐              │                                          │         │   │
│   │   │ loop_enter_script│              │   Runs ONCE per scan cycle, BEFORE       │         │   │
│   │   └──────┬───────────┘              │   any items are read. Good for           │         │   │
│   │          │                          │   resetting per-loop accumulators.        │         │  │
│   │          ▼                          └──────────────────────────────────────────┘         │   │
│   │   ┌──────────────────┐                                                                  │    │
│   │   │ loop_item_script │◄──── Runs ONCE PER ITEM, every scan cycle.                       │    │
│   │   │  (or "script")   │      This is where transforms happen.                            │    │
│   │   │                  │      The "result" variable holds the raw value.                  │    │
│   │   └──────┬───────────┘      Return the transformed value.                               │    │
│   │          │ (repeats                                                                     │    │
│   │          │  for each item)                                                              │    │
│   │          ▼                          ┌──────────────────────────────────────────┐         │   │
│   │   ┌──────────────────┐              │                                          │         │   │
│   │   │ loop_exit_script │              │   Runs ONCE per scan cycle, AFTER        │         │   │
│   │   └──────┬───────────┘              │   all items are read. Good for           │         │   │
│   │          │                          │   aggregations, summaries, batch emits.  │         │   │
│   │          │                          └──────────────────────────────────────────┘         │   │
│   │          │                                                                              │    │
│   │    (loop repeats every scan_interval)                                                   │    │
│   │          │                                                                              │    │
│   │          ▼  (on shutdown)                                                               │    │
│   │   ┌────────────────┐   Runs ONCE at connector shutdown.                                 │    │
│   │   │  deinit_script │   Clean up resources, flush caches, close connections.             │    │
│   │   └────────────────┘                                                                    │    │
│   │                                                                                         │    │
│   └─────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE "result" VARIABLE                                                                          │
│   ─────────────────────                                                                          │
│                                                                                                  │
│   Inside loop_item_script (or "script"), the variable "result" holds the raw value               │
│   read from the source device for the current item.                                              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   result             What it contains                                        │               │
│   │   ──────             ──────────────────                                      │               │
│   │                                                                              │               │
│   │   A number           72.5  (from a PLC register, OPC node, etc.)             │               │
│   │   A string           "RUNNING"  (from a status tag)                          │               │
│   │   A JSON string      '{"temp":72.5,"psi":14.7}'  (from MQTT, HTTP, etc.)     │               │
│   │   A boolean          true / false                                            │               │
│   │   nil                The source returned no data for this item               │               │
│   │                                                                              │               │
│   │   Return value:      Whatever you return becomes the published message data. │               │
│   │                      Return nil to suppress the message entirely.            │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BASIC TRANSFORMS                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   -- Scale a value                                                           │               │
│   │   return result * 2                                                          │               │
│   │                                                                              │               │
│   │   -- Fahrenheit to Celsius                                                   │               │
│   │   return (result - 32) * 5 / 9                                               │               │
│   │                                                                              │               │
│   │   -- Extract a field from JSON                                               │               │
│   │   local data = from_json(result)                                             │               │
│   │   return data.value                                                          │               │
│   │                                                                              │               │
│   │   -- Clamp to range                                                          │               │
│   │   if result > 100 then return 100 end                                        │               │
│   │   if result < 0 then return 0 end                                            │               │
│   │   return result                                                              │               │
│   │                                                                              │               │
│   │   -- Suppress unchanged values (manual RBE)                                  │               │
│   │   local prev = cache('last_val')                                             │               │
│   │   if result == prev then return nil end                                      │               │
│   │   cache('last_val', result)                                                  │               │
│   │   return result                                                              │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   emit() — FORK ONE MESSAGE INTO MANY                                                            │
│   ───────────────────────────────────                                                            │
│                                                                                                  │
│   Use emit() to publish additional messages from within a script.                                │
│   One source read can produce multiple output paths.                                             │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   Source reads one JSON payload:                                                       │     │
│   │   ─────────────────────────────                                                        │     │
│   │   result = '{"temp":72.5, "psi":14.7, "running":true}'                                 │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   Script:                              Output:                                         │     │
│   │   ───────                              ───────                                         │     │
│   │                                                                                        │     │
│   │   local data = from_json(result)       ┌─────────────────────────┐                     │     │
│   │                                        │ emit('temperature',     │                     │     │
│   │   emit('temperature', data.temp)       │       72.5)             │                     │     │
│   │   emit('pressure',    data.psi)        │ emit('pressure',        │                     │     │
│   │   emit('status',      data.running)    │       14.7)             │                     │     │
│   │                                        │ emit('status',          │                     │     │
│   │   return nil                           │       true)             │                     │     │
│   │   -- suppress original msg             └─────────────────────────┘                     │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   ┌───────────┐         ┌──────────────┐         ┌──────────────────────────┐          │     │
│   │   │  Source   │         │   Script     │         │ Ring Buffer receives:    │          │     │
│   │   │  reads    │────────▶│   from_json  │────────▶│   src/temperature = 72.5 │          │     │
│   │   │  1 JSON   │         │   emit() x3  │         │   src/pressure = 14.7    │          │     │
│   │   │  payload  │         │   return nil │         │   src/status = true      │          │     │
│   │   └───────────┘         └──────────────┘         └──────────────────────────┘          │     │
│   │                                                                                        │     │
│   │   emit_mtconnect(path, value, type)  ── emit with MTConnect DataItem mapping           │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BUILT-IN HELPER FUNCTIONS                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   from_json(str)         Parse JSON string into a Lua table                  │               │
│   │   to_json(table)         Serialize a Lua table to JSON string                │               │
│   │                                                                              │               │
│   │   cache(key)             Read a value from the persistent cache              │               │
│   │   cache(key, value)      Write a value to the persistent cache               │               │
│   │   cache_ts(key)          Get the timestamp of a cached value                 │               │
│   │                                                                              │               │
│   │   set(path, value)       Set a value in the connector's item map             │               │
│   │   env(name)              Read an environment variable                        │               │
│   │                                                                              │               │
│   │   connector              Reference to the current connector object           │               │
│   │   configuration          Reference to the connector's config object          │               │
│   │                                                                              │               │
│   │   emit(path, value)              Publish a new message to the ring buffer    │               │
│   │   emit_mtconnect(p, v, type)     Publish with MTConnect DataItem mapping     │               │
│   │                                                                              │               │
│   │   log_info(msg)          Log at INFO level                                   │               │
│   │   log_warn(msg)          Log at WARN level                                   │               │
│   │   log_error(msg)         Log at ERROR level                                  │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│   The cache persists across scan cycles — use it to track state between reads.                   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PYTHON ALTERNATIVE                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   Set lang_script to use Python instead of Lua. Same lifecycle hooks, same helpers.              │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   YAML:                                                                      │               │
│   │   ─────                                                                      │               │
│   │   lang_script: python                                                        │               │
│   │   script: |                                                                  │               │
│   │     import json                                                              │               │
│   │     data = json.loads(result)                                                │               │
│   │     emit('temperature', data['temp'])                                        │               │
│   │     emit('pressure', data['psi'])                                            │               │
│   │     return None  # suppress original                                         │               │
│   │                                                                              │               │
│   │   KEY DIFFERENCES:                                                           │               │
│   │   ────────────────                                                           │               │
│   │                                                                              │               │
│   │   ┌────────────────────┬────────────────────────────────────────┐             │              │
│   │   │  Feature           │  Details                               │             │              │
│   │   ├────────────────────┼────────────────────────────────────────┤             │              │
│   │   │  Runtime           │  Embedded CLR Python (IronPython)      │             │              │
│   │   │  Module imports    │  Standard library + custom modules     │             │              │
│   │   │  Performance       │  Slower than Lua — use for complex     │             │              │
│   │   │                    │  transforms only                       │             │              │
│   │   │  Default (if not   │  Lua — faster startup, lower overhead  │             │              │
│   │   │  specified)        │                                        │             │              │
│   │   └────────────────────┴────────────────────────────────────────┘             │              │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PRACTICAL EXAMPLES                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────┐               │
│   │                                                                              │               │
│   │   EXAMPLE 1: Unit Conversion (inline script)                                 │               │
│   │   ──────────────────────────────────────────                                 │               │
│   │                                                                              │               │
│   │   script: "return (result - 32) * 5 / 9"    -- Fahrenheit to Celsius         │               │
│   │                                                                              │               │
│   │                                                                              │               │
│   │   EXAMPLE 2: JSON Parsing + Multi-Emit                                       │               │
│   │   ─────────────────────────────────────                                      │               │
│   │                                                                              │               │
│   │   script: |                                                                  │               │
│   │     local data = from_json(result)                                           │               │
│   │     for key, val in pairs(data) do                                           │               │
│   │       emit(key, val)                                                         │               │
│   │     end                                                                      │               │
│   │     return nil                                                               │               │
│   │                                                                              │               │
│   │                                                                              │               │
│   │   EXAMPLE 3: State Machine with Cache                                        │               │
│   │   ───────────────────────────────────                                        │               │
│   │                                                                              │               │
│   │   script: |                                                                  │               │
│   │     local prev = cache('machine_state')                                      │               │
│   │     if result ~= prev then                                                   │               │
│   │       cache('machine_state', result)                                         │               │
│   │       emit('state_changed', to_json({                                        │               │
│   │         from = prev,                                                         │               │
│   │         to = result,                                                         │               │
│   │         timestamp = os.time()                                                │               │
│   │       }))                                                                    │               │
│   │     end                                                                      │               │
│   │     return result                                                            │               │
│   │                                                                              │               │
│   └──────────────────────────────────────────────────────────────────────────────┘               │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
