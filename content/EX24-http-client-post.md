```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX24 — HTTP CLIENT POST                                                DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Posts data to an external HTTP endpoint using the HTTPClient sink. A Lua Script       │
  │  source simulates a machine press generating Execution, SystemCondition, and Position  │
  │  data. A Scriban template formats the combined state into a custom payload before      │
  │  POSTing. Demonstrates custom headers, Authorization, and template formatting.         │
  │  Multi-file YAML config — 3 files composed with anchors.                               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   Script Source (press1) │
      │                          │
      │   Items:                 │         ┌──────────────────────────┐
      │   · Execution            │         │  HTTPClient Sink         │
      │     (Active/Ready)       │         │                          │
      │   · SystemCondition      ├────────▶│  POST to webhook URL     │
      │     (Fault/Normal)       │         │  Content-Type: text/plain│
      │   · Position             │         │  Authorization: None     │
      │     (-100 to 100)        │         │                          │
      │   · ModelInstance        │         │  Scriban template        │
      │     (combined state)     │         │  formats payload         │
      │                          │         └──────────────────────────┘
      │   scan: 1000ms           │
      └──────────────────────────┘
              SOURCE                       RING BUFFER              SINK
        (Lua simulation)                 (4096 slots)       (HTTP POST output)

  CONFIGURATION — 3 files                                                      [multi-file]
  ───────────────────────

  ── mtInstance1.yaml (source) ─────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mtInstance1: &mtInstance1                                                             │
  │    name: press1                                                                        │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                     # 1-second scan cycle                 │
  │    connector: Script                             # Lua script source                   │
  │    rbe: !!bool true                              # Report By Exception                 │
  │    init_script: |                                                                      │
  │      json = require('json');                     # Load JSON library                   │
  │    items:                                                                              │
  │      - name: Execution                                                                 │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                                                                │
  │        script: |                                                                       │
  │          local n = math.random(0, 1);                                                  │
  │          set("Execution", n==1 and 'Active' or 'Ready');                               │
  │          return nil;                             # set() stores; nil suppresses output │
  │      - name: SystemCondition                                                           │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                                                                │
  │        script: |                                                                       │
  │          local n = math.random(0, 1);                                                  │
  │          set("SystemCondition", n==1 and 'Fault' or 'Normal');                         │
  │          return nil;                                                                   │
  │      - name: Position                                                                  │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                                                                │
  │        script: |                                                                       │
  │          set("Position", math.random(-100, 100));                                      │
  │          return nil;                                                                   │
  │      - name: ModelInstance                       # Combines cached state               │
  │        enabled: !!bool true                                                            │
  │        rbe: !!bool true                                                                │
  │        script: |                                                                       │
  │          return {                                                                      │
  │            type = "press",                                                             │
  │            name = configuration().Name,          # Connector name from config          │
  │            available = cache("./$SYSTEM/IsConnected", false),                          │
  │            execution = cache("./Execution", false),                                    │
  │            system = cache("./SystemCondition", "NORMAL"),                              │
  │            position = cache("./Position", 0)                                           │
  │          }                                                                             │
  │        sink:                                                                           │
  │          transform:                                                                    │
  │            type: scriban                         # Scriban template engine             │
  │            template: >-                                                                │
  │              {{-Message.Data["type"]}},name={{Message.Data["name"]}}                   │
  │              {{for o in Message.Data}}{{o.Key}}={{o.Value}}                            │
  │              {{if !for.last}},{{end}}{{end}}                                           │
  │              {{Message.Timestamp}}                                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── httpClientSink1.yaml ──────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  httpClientSink1: &httpClientSink1                                                     │
  │    name: httpClientSink1                                                               │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: HTTPClient                         # HTTP POST sink                      │
  │    uri: https://webhook-test.com/...             # Target webhook endpoint             │
  │    headers:                                      # Custom HTTP headers                 │
  │      Content-Type: text/plain                                                          │
  │      Authorization: None                         # Placeholder for Bearer token        │
  │    exclude_filter:                                                                     │
  │      - press1/$SYSTEM                            # Filter system messages              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── main.yaml ─────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://localhost:9999/                                             │
  │    ws_server_uri: ws://localhost:9998/                                                 │
  │  sinks:                                                                                │
  │    - *httpClientSink1                            # HTTP POST to webhook                │
  │  sources:                                                                              │
  │    - *mtInstance1                                # Script source (press1)              │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * HTTPClient Sink -- Posts data to an external HTTP endpoint. Unlike HTTPServer       │
  │    (which listens), HTTPClient actively sends outbound requests. Set the uri to any    │
  │    REST endpoint, webhook, or API gateway.                                             │
  │                                                                                        │
  │  * Custom Headers -- The headers map adds HTTP headers to every request. Use           │
  │    Content-Type to set the payload format. The Authorization header supports Bearer    │
  │    tokens, API keys, or any auth scheme your target API requires.                      │
  │                                                                                        │
  │  * Scriban Templates -- The sink.transform.type "scriban" enables the Scriban          │
  │    template engine. Access message data with {{Message.Data["key"]}}. Loop over        │
  │    key-value pairs with {{for o in Message.Data}}. Use {{if !for.last}} for            │
  │    conditional separators. Scriban uses {{- for whitespace trimming.                   │
  │                                                                                        │
  │  * Cache-Based State Assembly -- Individual items use set() to cache values (and       │
  │    return nil to suppress direct output). The ModelInstance item then assembles all    │
  │    cached values into a single Lua table. This pattern produces one combined message   │
  │    per scan cycle from multiple independent data points.                               │
  │                                                                                        │
  │  * configuration() API -- The Lua configuration() function returns the current         │
  │    connector's config object. configuration().Name yields the connector name. This     │
  │    lets scripts adapt to their runtime context without hardcoded values.               │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
