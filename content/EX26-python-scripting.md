```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX26 — PYTHON SCRIPTING                                                DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Demonstrates DIME's embedded Python runtime as an alternative to Lua. Uses .NET CLR   │
  │  interop (System.Random), Python standard library modules (random, math, sys), custom  │
  │  module imports, tuple creation, and the DIME cache API from Python.                   │
  │  Multi-file YAML config — 3 files. Ten items showcase different Python capabilities.   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌────────────────────────────┐
      │   Script Source (Python)   │
      │   lang_script: python      │
      │                            │       ┌─────────────────────┐
      │   init: import clr,        │       │  Console Sink       │
      │     System.Random          │       │                     │
      │                            ├──────▶│  use_sink_transform │  stdout
      │   Items (10):              │       │    !!bool true      │
      │   · SysPath    (sys.path)  │       │                     │
      │   · Swallow    (None)      │       │  transform: script  │
      │   · CLRRandom  (.NET)      │       │  Message.Data       │
      │   · PyRandom   (random)    │       └─────────────────────┘
      │   · Tuple      (1,2,3)     │
      │   · Module     (example)   │
      │   · Math       (math.pi)   │
      │   · CacheSet   (dime.set)  │
      │   · CacheGet   (dime.cache)│
      │   · Counter    (global var)│
      │                            │
      │   scan: 1000ms             │
      └────────────────────────────┘
              SOURCE                       RING BUFFER              SINK
        (Python embedded)                (4096 slots)         (Console output)

  CONFIGURATION — 3 files                                                      [multi-file]
  ───────────────────────

  ── script.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  script: &script                                                                       │
  │    name: script                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # 1-second scan cycle                 │
  │    connector: Script                                                                   │
  │    rbe: !!bool true                              # Report By Exception                 │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: Message.Data                    # Extract raw data for sink           │
  │    lang_script: python                           # Switch runtime to Python            │
  │    init_script: |                                # Runs once at startup                │
  │      print('hello world from script.init_script')                                      │
  │      import clr                                  # .NET CLR bridge                     │
  │      clr.AddReference("System")                  # Load System assembly                │
  │      from System import Random                   # Import .NET Random class            │
  │      counter = 0                                 # Global state variable               │
  │    items:                                                                              │
  │      - name: SysPath                             # Show Python module paths            │
  │        script: |                                                                       │
  │          import sys                                                                    │
  │          sys.path                                # Last expression = return value      │
  │      - name: Swallow                             # Return None (nil equivalent)        │
  │        script: |                                                                       │
  │          None                                                                          │
  │      - name: CLRRandom                           # .NET System.Random via CLR          │
  │        script: |                                                                       │
  │          Random().NextDouble()                   # Call .NET method directly           │
  │      - name: PyRandom                            # Python standard random              │
  │        script: |                                                                       │
  │          import random                                                                 │
  │          random.random()                         # Python-native random float          │
  │      - name: Tuple                               # Python tuples as return values      │
  │        script: |                                                                       │
  │          (1, 2, 3)                                                                     │
  │      - name: Module                              # Import custom module                │
  │        script: |                                                                       │
  │          from example import add                 # example.py in Python/ directory     │
  │          add(100, 100)                           # Call exported function              │
  │      - name: Math                                # Python math library                 │
  │        script: |                                                                       │
  │          import math as m                                                              │
  │          m.pi                                    # Returns 3.14159...                  │
  │      - name: CacheSet                            # Store value in DIME cache           │
  │        script: |                                                                       │
  │          dime.set('cacheTest', 555)              # Python cache API                    │
  │          None                                    # Suppress output                     │
  │      - name: CacheGet                            # Retrieve from DIME cache            │
  │        script: |                                                                       │
  │          dime.cache('cacheTest', 0)              # Get cached value (default: 0)       │
  │      - name: Counter                             # Global variable persistence         │
  │        script: |                                                                       │
  │          counter = counter + 1                                                         │
  │          counter                                 # Increments across scan cycles       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                            # Prints to stdout                    │
  │    use_sink_transform: !!bool true               # Apply source's transform template   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *console                                    # Console output                      │
  │  sources:                                                                              │
  │    - *script                                     # Python script source                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Python Runtime (lang_script: python) -- DIME embeds a Python runtime alongside      │
  │    Lua. Set lang_script: python at the connector level. All items in that connector    │
  │    then execute Python instead of Lua. The last expression in each script block        │
  │    becomes the return value (no explicit return needed).                               │
  │                                                                                        │
  │  * .NET CLR Interop -- The clr module bridges Python to the .NET runtime. Use          │
  │    clr.AddReference("System") to load assemblies, then import classes directly:        │
  │    from System import Random. This gives Python scripts access to the full .NET        │
  │    ecosystem including System, LINQ, and custom assemblies.                            │
  │                                                                                        │
  │  * Python Cache API -- In Python, the DIME cache uses the dime module:                 │
  │    dime.set('key', value) to store, dime.cache('key', default) to retrieve. This       │
  │    differs from Lua's set()/cache() syntax but provides identical functionality.       │
  │    Cache entries persist across scan cycles for stateful processing.                   │
  │                                                                                        │
  │  * Custom Modules -- Place .py files in DIME's Python/ directory. Import them with     │
  │    standard Python syntax: from example import add. The paths_script property can      │
  │    add additional module search paths if needed.                                       │
  │                                                                                        │
  │  * Global Variables -- Variables defined in init_script (like counter = 0) persist     │
  │    across scan cycles in the Python runtime. Item scripts can read and modify them.    │
  │    This enables stateful computation without the cache API.                            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
