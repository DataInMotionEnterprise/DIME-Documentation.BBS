```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        09 — Scripting                                 │
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
│   Scripts hook into five points in the connector lifecycle.                                      │
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
│   │          ▼                          ┌──────────────────────────────────────────┐        │    │
│   │   ┌──────────────────┐              │                                          │        │    │
│   │   │  enter_script    │              │   Runs ONCE per scan cycle, BEFORE       │        │    │
│   │   └──────┬───────────┘              │   any items are read. Good for           │        │    │
│   │          │                          │   resetting per-loop accumulators.       │        │    │
│   │          ▼                          └──────────────────────────────────────────┘        │    │
│   │   ┌──────────────────┐                                                                  │    │
│   │   │  item_script     │◄──── Runs ONCE PER ITEM, every scan cycle.                       │    │
│   │   │  (or "script")   │      This is where transforms happen.                            │    │
│   │   │                  │      The "result" variable holds the raw value.                  │    │
│   │   └──────┬───────────┘      Return the transformed value.                               │    │
│   │          │ (repeats                                                                     │    │
│   │          │  for each item)                                                              │    │
│   │          ▼                          ┌──────────────────────────────────────────┐        │    │
│   │   ┌──────────────────┐              │                                          │        │    │
│   │   │  exit_script     │              │   Runs ONCE per scan cycle, AFTER        │        │    │
│   │   └──────┬───────────┘              │   all items are read. Good for           │        │    │
│   │          │                          │   aggregations, summaries, batch emits.  │        │    │
│   │          │                          └──────────────────────────────────────────┘        │    │
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
│   Inside item_script (or "script"), the variable "result" holds the raw value                    │
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
│   CHOOSING A LANGUAGE                                                                            │
│   ───────────────────                                                                            │
│                                                                                                  │
│   Set lang_script at the connector level.  Default is Lua.                                       │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   ┌──────────────────────────────┬──────────────────────────────────────────┐            │   │
│   │   │  lang_script: lua            │  lang_script: python                     │            │   │
│   │   │  (default if omitted)        │                                          │            │   │
│   │   ├──────────────────────────────┼──────────────────────────────────────────┤            │   │
│   │   │  NLua runtime                │  IronPython runtime (CLR-hosted)         │            │   │
│   │   │  Fast startup, low overhead  │  Python 3.4 standard library             │            │   │
│   │   │                              │  Full .NET framework access              │            │   │
│   │   │  Globals:                    │  Prefixed with dime.*:                   │            │   │
│   │   │    cache(), emit(),          │    dime.cache(), dime.emit(),            │            │   │
│   │   │    from_json(), set()        │    dime.from_json(), dime.set()          │            │   │
│   │   │                              │                                          │            │   │
│   │   │  Best for: quick math,       │  Best for: complex parsing,              │            │   │
│   │   │  simple transforms           │  library-heavy transforms                │            │   │
│   │   └──────────────────────────────┴──────────────────────────────────────────┘            │   │
│   │                                                                                          │   │
│   │   YAML:                                                                                  │   │
│   │   ─────                                                                                  │   │
│   │   sources:                                                                               │   │
│   │     - name: my_device                                                                    │   │
│   │       connector: OpcUa                                                                   │   │
│   │       lang_script: python          # omit for Lua (default)                              │   │
│   │       script: "return result * 2"                                                        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BASIC TRANSFORMS                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Lua                                                                                    │   │
│   │   ───                                                                                    │   │
│   │                                                                                          │   │
│   │   return result * 2                            -- Scale a value                          │   │
│   │   return (result - 32) * 5 / 9                 -- Fahrenheit to Celsius                  │   │
│   │                                                                                          │   │
│   │   local d = from_json(result)                  -- Extract JSON field                     │   │
│   │   return d.value                                                                         │   │
│   │                                                                                          │   │
│   │   if result > 100 then return 100 end          -- Clamp to range                         │   │
│   │   if result < 0 then return 0 end                                                        │   │
│   │   return result                                                                          │   │
│   │                                                                                          │   │
│   │   local prev = cache('last_val')               -- Suppress unchanged (manual RBE)        │   │
│   │   if result == prev then return nil end                                                  │   │
│   │   set('last_val', result)                                                                │   │
│   │   return result                                                                          │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   Python  (lang_script: python)                                                          │   │
│   │   ─────────────────────────────                                                          │   │
│   │                                                                                          │   │
│   │   return result * 2                            # Scale a value                           │   │
│   │   return (result - 32) * 5 / 9                 # Fahrenheit to Celsius                   │   │
│   │                                                                                          │   │
│   │   import json                                  # Extract JSON field                      │   │
│   │   d = json.loads(result)                                                                 │   │
│   │   return d['value']                                                                      │   │
│   │                                                                                          │   │
│   │   return min(max(result, 0), 100)              # Clamp to range                          │   │
│   │                                                                                          │   │
│   │   prev = dime.cache('last_val')                # Suppress unchanged (manual RBE)         │   │
│   │   if result == prev: return None                                                         │   │
│   │   dime.set('last_val', result)                                                           │   │
│   │   return result                                                                          │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
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
│   │   Lua Script:                          Output:                                         │     │
│   │   ───────────                          ───────                                         │     │
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
│   │   Python Script:                       Output:                                         │     │
│   │   ──────────────                       ───────                                         │     │
│   │                                                                                        │     │
│   │   import json                          ┌─────────────────────────────┐                 │     │
│   │   data = json.loads(result)            │ dime.emit('temperature',    │                 │     │
│   │                                        │       72.5)                 │                 │     │
│   │   dime.emit('temperature',             │ dime.emit('pressure',       │                 │     │
│   │             data['temp'])              │       14.7)                 │                 │     │
│   │   dime.emit('pressure',                │ dime.emit('status',         │                 │     │
│   │             data['psi'])               │       True)                 │                 │     │
│   │   dime.emit('status',                  └─────────────────────────────┘                 │     │
│   │             data['running'])                                                           │     │
│   │   return None  # suppress original                                                     │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   ┌───────────┐         ┌──────────────┐         ┌──────────────────────────┐          │     │
│   │   │  Source   │         │   Script     │         │ Ring Buffer receives:    │          │     │
│   │   │  reads    │────────▶│   parse JSON │────────▶│   src/temperature = 72.5 │          │     │
│   │   │  1 JSON   │         │   emit() x3  │         │   src/pressure = 14.7    │          │     │
│   │   │  payload  │         │   return nil │         │   src/status = true      │          │     │
│   │   └───────────┘         └──────────────┘         └──────────────────────────┘          │     │
│   │                                                                                        │     │
│   │   emit_mtconnect(path, value, type)  ── emit with MTConnect DataItem mapping           │     │
│   │   Python: dime.emit_mtconnect(path, value, type)                                       │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BUILT-IN HELPERS — LUA vs PYTHON                                                               │
│   ────────────────────────────────                                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Lua                                Python                                              │   │
│   │   ───                                ──────                                              │   │
│   │                                                                                          │   │
│   │   from_json(str)                     dime.from_json(str)             Parse JSON          │   │
│   │   to_json(tbl)                       dime.to_json(obj)               Serialize JSON      │   │
│   │                                                                                          │   │
│   │   cache(key)                         dime.cache(key)                 Read cache          │   │
│   │   cache(key, default)                dime.cache(key, default)        Read w/ default     │   │
│   │   cache_ts(key)                      dime.cache_ts(key)              Read + timestamp    │   │
│   │                                                                                          │   │
│   │   set(path, val)                     dime.set(path, val)             Write to cache      │   │
│   │   env(name, default)                 dime.env(name, default)         Read env var        │   │
│   │                                                                                          │   │
│   │   emit(path, val)                    dime.emit(path, val)            Emit message        │   │
│   │   emit_mtconnect(p,v,t)              dime.emit_mtconnect(p,v,t)      Emit MTConnect      │   │
│   │                                                                                          │   │
│   │   connector()                        dime.connector()                Connector ref       │   │
│   │   configuration()                    dime.configuration()            Config ref          │   │
│   │                                                                                          │   │
│   │   The cache persists across scan cycles — use it to track state between reads.           │   │
│   │   Python can also import standard library modules: json, math, re, datetime, etc.        │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   PRACTICAL EXAMPLES                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   EXAMPLE 1: Unit Conversion (inline script)                                             │   │
│   │   ──────────────────────────────────────────                                             │   │
│   │                                                                                          │   │
│   │   Lua:     script: "return (result - 32) * 5 / 9"                                        │   │
│   │   Python:  script: "return (result - 32) * 5 / 9"                                        │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   EXAMPLE 2: JSON Parsing + Multi-Emit                                                   │   │
│   │   ─────────────────────────────────────                                                  │   │
│   │                                                                                          │   │
│   │   Lua:                                     Python (lang_script: python):                 │   │
│   │   ────                                     ──────                                        │   │
│   │   local data = from_json(result)           import json                                   │   │
│   │   for key, val in pairs(data) do           data = json.loads(result)                     │   │
│   │     emit(key, val)                         for key in data:                              │   │
│   │   end                                        dime.emit(key, data[key])                   │   │
│   │   return nil                               return None                                   │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   EXAMPLE 3: State Machine with Cache                                                    │   │
│   │   ───────────────────────────────────                                                    │   │
│   │                                                                                          │   │
│   │   Lua:                                     Python (lang_script: python):                 │   │
│   │   ────                                     ──────                                        │   │
│   │   local prev = cache('machine_state')      prev = dime.cache('machine_state')            │   │
│   │   if result ~= prev then                   if result != prev:                            │   │
│   │     set('machine_state', result)             dime.set('machine_state', result)           │   │
│   │     emit('state_changed', to_json({          dime.emit('state_changed',                  │   │
│   │       from = prev, to = result                 dime.to_json({                            │   │
│   │     }))                                          'from': prev, 'to': result              │   │
│   │   end                                          }))                                       │   │
│   │   return result                            return result                                 │   │
│   │                                                                                          │   │
│   │                                                                                          │   │
│   │   Scripts can be inline one-liners or multiline YAML blocks (using | or >).               │   │
│   │   Use paths_script: to add directories where Lua require() can find modules.             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
