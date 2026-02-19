```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX22 — JSON WEB SCRAPER                                                DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Scrapes a public JSON REST API using the JSONWebScraper connector. Extracts nested    │
  │  values with JSON path queries ($.catalog.manifestID), transforms them via Lua, and    │
  │  publishes to Console, MTConnect Agent, and MTConnect SHDR sinks.                      │
  │  Multi-file YAML config — 5 files composed with anchors.                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   JSONWebScraper Source  │         ┌─────────────────────┐
      │                          │    ┌────▶│  Console Sink       │  stdout
      │   uri: GitHub raw JSON   │    │     └─────────────────────┘
      │                          │    │
      │   Item: node1            │    │     ┌─────────────────────┐
      │   address: $.catalog     ├────┼────▶│  MTConnect Agent    │  port 5000
      │     .manifestID          │    │     │  (XML endpoint)     │
      │                          │    │     └─────────────────────┘
      │   Lua: json.decode()     │    │
      │   to extract first match │    │     ┌─────────────────────┐
      │                          │    └────▶│  MTConnect SHDR     │  port 7878
      │   scan: 5000ms           │          │  (pipe-delimited)   │
      └──────────────────────────┘          └─────────────────────┘
              SOURCE                        RING BUFFER              SINKS
        (REST API polling)                (4096 slots)          (3 destinations)

  CONFIGURATION — 5 files                                                      [multi-file]
  ───────────────────────

  Each file defines a YAML anchor (&name). The main.yaml references them with aliases (*).

  ── json1.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  json1: &json1                                                                         │
  │    name: json1                                                                         │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 5000                     # Poll API every 5 seconds            │
  │    connector: JSONWebScraper                     # REST API scraper connector          │
  │    rbe: !!bool true                              # Only publish on change              │
  │    uri: https://raw.githubusercontent.com/       # Target URL (GitHub raw JSON)        │
  │      jpadfield/simple-site/refs/heads/                                                 │
  │      master/build/mirador.json                                                         │
  │    sink:                                                                               │
  │      transform:                                                                        │
  │        type: script                                                                    │
  │        template: Message.Data                    # Extract raw data for sinks          │
  │    init_script: |                                                                      │
  │      json = require('json');                     # Load JSON library once              │
  │    items:                                                                              │
  │      - name: node1                                                                     │
  │        enabled: !!bool true                                                            │
  │        address: $.catalog.manifestID             # JSON path query                     │
  │        script: |                                                                       │
  │          return json.decode(result)[1];          # Decode + take first element         │
  │        sink:                                                                           │
  │          mtconnect: Device[name=device1]/        # MTConnect data item mapping         │
  │            Controller/Load[category=Sample]                                            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── agent.yaml ────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  agent: &agent                                                                         │
  │    name: agent                                                                         │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MTConnectAgent                     # Serves MTConnect XML on port 5000   │
  │    port: !!int 5000                                                                    │
  │    use_sink_transform: !!bool true               # Apply sink.transform from source    │
  │    exclude_filter:                                                                     │
  │      - xml1/$SYSTEM                              # Filter out system messages          │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── shdr.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  shdr: &shdr                                                                           │
  │    name: shdr                                                                          │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MTConnectSHDR                      # SHDR adapter (pipe-delimited)       │
  │    port: !!int 7878                              # TCP port for agent connection       │
  │    device_key: ~                                 # Null = default device               │
  │    heartbeat_interval: !!int 10000               # Keep-alive every 10 seconds         │
  │    filter_duplicates: !!bool true                # Suppress duplicate values           │
  │    use_sink_transform: !!bool true                                                     │
  │    exclude_filter:                                                                     │
  │      - xml1/$SYSTEM                                                                    │
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
  │    use_sink_transform: !!bool false                                                    │
  │    exclude_filter:                                                                     │
  │      - haas1/$SYSTEM                             # Filter system messages              │
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
  │    - *console                                    # Console for debugging               │
  │    - *agent                                      # MTConnect Agent XML endpoint        │
  │    - *shdr                                       # MTConnect SHDR adapter              │
  │  sources:                                                                              │
  │    - *json1                                      # JSONWebScraper source               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * JSONWebScraper Connector -- Polls any HTTP endpoint returning JSON. The uri         │
  │    property specifies the target URL. Each item's address uses JSON path syntax        │
  │    ($.path.to.field) to extract nested values from the response.                       │
  │                                                                                        │
  │  * JSON Path Queries -- The address "$.catalog.manifestID" navigates into the JSON     │
  │    response tree. The result variable in the item script contains the matched value.   │
  │    When the path returns an array, Lua json.decode(result)[1] extracts the first       │
  │    element.                                                                            │
  │                                                                                        │
  │  * MTConnect Sink Mapping -- The sink.mtconnect property on each item maps data to     │
  │    the MTConnect information model. The path Device[name=device1]/Controller/          │
  │    Load[category=Sample] places the value into a specific MTConnect data item.         │
  │                                                                                        │
  │  * MTConnect SHDR -- The SHDR sink produces pipe-delimited output on a TCP port.       │
  │    An external MTConnect Agent can connect to this port to collect adapter data.       │
  │    filter_duplicates and heartbeat_interval manage connection health.                  │
  │                                                                                        │
  │  * Lua JSON Library -- The init_script loads json = require('json') once at startup.   │
  │    Item scripts then use json.decode() and json.encode() for parsing and formatting.   │
  │    Libraries should always be loaded in init_script, not per-item scripts.             │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
