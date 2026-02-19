```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX29 — MULTI-MACHINE SHOP FLOOR                                     DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Connects diverse CNC machines from a real shop floor into a single ring buffer.       │
  │  Haas via SHDR, TCP-ASCII, and XML scraping. Mazak via MTConnect Agent. Rockwell PLC   │
  │  via EtherNet/IP. Output to Console, MQTT, SHDR, CSV, HTTP, and WebSocket sinks.       │
  │  14-file config demonstrating multi-protocol, multi-vendor integration.                │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌──────────────────┐ SHDR
       │  haas1           │ :9998    ┌───────────────────────────────┐
       │  HaasSHDR        │──────┐   │                               │
       └──────────────────┘      │   │    Disruptor Ring Buffer      │
       ┌──────────────────┐ XML  │   │    4096 slots                 │
       │  haas2           │ :8082│   │                               │
       │  XMLWebScraper   │──────┤   │  ┌─────────────────────────┐  │
       └──────────────────┘      ├──▶│  │  One unified data model │  │
       ┌──────────────────┐ TCP  │   │  │  from 5 diverse sources │  │
       │  haas5           │ :5051│   │  └─────────────────────────┘  │
       │  TcpASCII        │──────┤   │                               │
       └──────────────────┘      │   └──────────┬────────────────────┘
       ┌──────────────────┐ HTTP │              │
       │  mazak1          │ :5719│         ┌────┴────┐
       │  MTConnectAgent  │──────┤         │ Routing │
       └──────────────────┘      │         └────┬────┘
       ┌──────────────────┐ EIP  │              │
       │  rock1           │      │   ┌──────────┼──────────────┐
       │  EthernetIP      │──────┘   │          │              │
       └──────────────────┘           ▼          ▼              ▼
                               ┌─────────┐ ┌────────┐ ┌──────────┐
                               │ Console │ │  MQTT  │ │   SHDR   │
                               └─────────┘ └────────┘ └──────────┘

         5 SOURCES                                      6+ SINKS
    (5 different protocols)                     (Console, MQTT, SHDR,
                                                CSV, HTTP, WebSocket)

  CONFIGURATION                                                         [14 files, 0 folders]
  ─────────────

  ┌─ haas1.yaml — HaasSHDR connector ────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  haas1: &haas1                                                                           │
  │    name: haas1                                                                           │
  │    connector: HaasSHDR                    # Native Haas SHDR protocol                    │
  │    address: 192.168.111.216                                                              │
  │    port: !!int 9998                                                                      │
  │    timeout: !!int 1000                                                                   │
  │    heartbeat_interval: !!int 0                                                           │
  │    retry_interval: !!int 10000                                                           │
  │    create_dummy_messages_on_startup: !!bool true                                         │
  │    sink:                                                                                 │
  │      transform:                                                                          │
  │        type: script                                                                      │
  │        template: Message.Data                                                            │
  │    items:                                                                                │
  │      - name: CPU                          # Spindle load percentage                      │
  │        address: CPU                                                                      │
  │        sink:                                                                             │
  │          mtconnect: Device[name=device1]/Controller/Load[category=Sample]                │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ haas2.yaml — XMLWebScraper connector ───────────────────────────────────────────────────┐
  │                                                                                          │
  │  haas2: &haas2                                                                           │
  │    connector: XMLWebScraper               # Scrape MTConnect XML endpoint                │
  │    uri: http://192.168.111.216:8082/current                                              │
  │    namespaces:                                                                           │
  │      mt: urn:mtconnect.org:MTConnectStreams:1.2                                          │
  │    item_script: |                         # XPath extraction                             │
  │      return result.InnerText                                                             │
  │    items:                                                                                │
  │      - name: SpindleLoad                                                                 │
  │        address: //mt:Message[@dataItemId='sp2maxpwr']                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ haas5.yaml — TcpASCII connector ────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  haas5: &haas5                                                                           │
  │    connector: TcpASCII                    # Raw TCP Q-commands to Haas                   │
  │    address: 192.168.111.216                                                              │
  │    port: !!int 5051                                                                      │
  │    read_delay: !!int 600                                                                 │
  │    scan_interval: !!int 7000              # Slow poll for macro variables                │
  │    init_script: |                                                                        │
  │      stringx = require('pl.stringx')      # Penlight string utilities                    │
  │      clean_response = function(response) ... end                                         │
  │      get_value = function(response) ... end                                              │
  │    items:                                 # Q-codes: ?Q100=serial, ?Q104=mode, etc.      │
  │      - name: SerialNumber                                                                │
  │        address: ?Q100                                                                    │
  │      - name: Mode                                                                        │
  │        address: ?Q104                                                                    │
  │      - name: ToolNumber                                                                  │
  │        address: ?Q201                                                                    │
  │      - name: XActualPosition                                                             │
  │        address: ?Q600 5041                # Macro variable read                          │
  │      - name: SpindleSpeed                                                                │
  │        address: ?Q600 3027                                                               │
  │      # ... 16 items including ThreeInOne using emit()                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ mazak1.yaml — MTConnectAgent connector ─────────────────────────────────────────────────┐
  │                                                                                          │
  │  mazak1: &mazak1                                                                         │
  │    connector: MTConnectAgent              # Standard MTConnect HTTP agent                │
  │    address: mtconnect.mazakcorp.com                                                      │
  │    port: !!int 5719                                                                      │
  │    itemized_read: !!bool true                                                            │
  │    sink:                                                                                 │
  │      transform:                                                                          │
  │        type: script                                                                      │
  │        template: >-                                                                      │
  │          Message.Data[0].Value            # Extract first data item value                │
  │    items:                                                                                │
  │      - name: XLoad                                                                       │
  │        address: Xload                                                                    │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ rock1.yaml — EthernetIP connector ──────────────────────────────────────────────────────┐
  │                                                                                          │
  │  rock1: &rock1                                                                           │
  │    connector: EthernetIP                  # Allen-Bradley MicroLogix PLC                 │
  │    type: micrologix                                                                      │
  │    address: 192.168.111.20                                                               │
  │    path: 1,0                                                                             │
  │    bypass_ping: !!bool true                                                              │
  │    items:                                                                                │
  │      - name: Execution                                                                   │
  │        type: bool                                                                        │
  │        address: N77:1                                                                    │
  │        script: |                          # Map 0/1 to Ready/Active                      │
  │          local m = { [0]='Ready', [1]='Active' }                                         │
  │          return m[result and 1 or 0]                                                     │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ sink files: console.yaml, mqtt1.yaml, shdr.yaml, csv1.yaml, etc. ───────────────────────┐
  │                                                                                          │
  │  console: &console                        # Debug output                                 │
  │    connector: Console                                                                    │
  │    exclude_filter: [/\$SYSTEM]                                                           │
  │                                                                                          │
  │  mqtt1: &mqtt1                            # Publish to MQTT broker                       │
  │    connector: MQTT                                                                       │
  │    address: wss.sharc.tech                                                               │
  │    base_topic: mtconnect_demo                                                            │
  │                                                                                          │
  │  shdr: &shdr                              # Re-publish as MTConnect SHDR                 │
  │    connector: MTConnectSHDR                                                              │
  │    port: !!int 7878                                                                      │
  │    heartbeat_interval: !!int 10000                                                       │
  │                                                                                          │
  │  csv1: &csv1                              # Log to CSV file                              │
  │    connector: CSVWriter                                                                  │
  │    filename: ./Output/haas1.csv                                                          │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                      │
  │    ring_buffer: !!int 4096                                                               │
  │  sources:                                                                                │
  │    - *haas1                               # Enable/disable by commenting                 │
  │    - *haas5                                                                              │
  │    - *mazak1                                                                             │
  │    - *rock1                                                                              │
  │  sinks:                                                                                  │
  │    - *console                                                                            │
  │    - *mqtt1                                                                              │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * Multi-Protocol Sources -- Five connectors using five different protocols (SHDR,     │
  │    XML scraping, TCP-ASCII, MTConnect HTTP, EtherNet/IP) all feed the same ring        │
  │    buffer. DIME normalizes them into MessageBoxMessage format.                         │
  │                                                                                        │
  │  * MTConnect Metadata -- Each item carries sink.mtconnect annotations that describe    │
  │    its position in an MTConnect device model (Device/Axes/Path). The SHDR and          │
  │    MTConnectAgent sinks use this metadata for standards-compliant output.              │
  │                                                                                        │
  │  * emit() for Multi-Value Responses -- haas5's ThreeInOne item sends one TCP command   │
  │    (?Q500) but receives program name, status, and part count in one response. The      │
  │    emit_mtconnect() function publishes each as a separate observation with its own     │
  │    MTConnect annotation, then returns nil to suppress the raw response.                │
  │                                                                                        │
  │  * Penlight String Library -- The TcpASCII source uses Penlight's pl.stringx for       │
  │    parsing comma-separated responses from the Haas controller. Libraries loaded in     │
  │    init_script persist for all item evaluations.                                       │
  │                                                                                        │
  │  * Flexible Sink Routing -- main.yaml enables/disables sinks by commenting aliases.    │
  │    The same data can flow to Console for debugging, MQTT for cloud, SHDR for           │
  │    MTConnect agents, and CSV for offline analysis simultaneously.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```