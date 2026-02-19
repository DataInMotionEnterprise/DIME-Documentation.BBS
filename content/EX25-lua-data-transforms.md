```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX25 — LUA DATA TRANSFORMS                                             DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  The simplest multi-file configuration. A Lua Script source generates two random        │
  │  numbers via math.random() and publishes them to a Console sink. Demonstrates          │
  │  modular YAML with anchors, minimal Script connector setup, and system message          │
  │  filtering. Three files — the building blocks of every multi-file DIME config.         │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   Script Source           │
      │                          │         ┌─────────────────────┐
      │   Items:                 │         │  Console Sink       │
      │   · number1              ├────────▶│                     │  stdout
      │     math.random(100)     │         │  exclude_filter:    │
      │   · number2              │         │    script/$SYSTEM   │
      │     math.random(200)     │         └─────────────────────┘
      │                          │
      │   (defaults apply:       │
      │    scan_interval, rbe)   │
      └──────────────────────────┘
              SOURCE                       RING BUFFER              SINK
         (Lua random gen)                (4096 slots)         (Console output)

  CONFIGURATION — 3 files                                                      [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── script.yaml ───────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  script: &script                                                                       │
  │    name: script                                                                        │
  │    connector: Script                             # Lua script connector                │
  │    items:                                                                              │
  │      - name: number1                                                                   │
  │        script: return math.random(100);          # Random 1-100                        │
  │      - name: number2                                                                   │
  │        script: return math.random(200);          # Random 1-200                        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── console.yaml ──────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    connector: Console                            # Prints to stdout                    │
  │    exclude_filter:                                                                     │
  │      - script/$SYSTEM                            # Filter system messages              │
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
  │    - *console                                    # Console output sink                 │
  │  sources:                                                                              │
  │    - *script                                     # Script source                       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Minimal Multi-File Config -- This is the simplest possible multi-file setup:        │
  │    one source file, one sink file, one main.yaml. Each file defines an anchor          │
  │    (&name) and main.yaml references them with aliases (*name). DIME loads all YAML     │
  │    files in the directory and merges them automatically.                                │
  │                                                                                        │
  │  * Config Defaults -- When properties like scan_interval, enabled, or rbe are           │
  │    omitted, DIME applies sensible defaults. The Script source here uses default         │
  │    scan_interval (1000ms) and default rbe (true). This keeps minimal configs clean     │
  │    while still being fully functional.                                                 │
  │                                                                                        │
  │  * Lua math.random() -- The Script connector's embedded Lua runtime provides the       │
  │    full Lua standard library. math.random(n) returns an integer from 1 to n. No        │
  │    init_script is needed here because no libraries or state are required.               │
  │                                                                                        │
  │  * System Message Filtering -- Every connector publishes to a $SYSTEM path             │
  │    (e.g. script/$SYSTEM) with health data like IsConnected and FaultCount. The          │
  │    Console sink uses exclude_filter to suppress these, showing only data items.         │
  │                                                                                        │
  │  * Modular YAML Pattern -- Separating connectors into individual files makes it easy   │
  │    to add, remove, or swap connectors. To add an HTTP sink, create a new YAML file     │
  │    with an anchor and add its alias to main.yaml's sinks array.                        │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
