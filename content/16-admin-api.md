```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        16 — Admin REST API                            │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Manage a running instance.                     │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Swagger UI included.                           │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ADMIN REST API — OVERVIEW                                                                      │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Every DIME instance runs a built-in HTTP server. No extra config. Always on.                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Default endpoint:    http://localhost:9999/                                            │   │
│   │   Swagger UI:          http://localhost:9999/swagger                                     │   │
│   │                                                                                          │   │
│   │   ┌──────────────┐          ┌───────────────┐          ┌──────────────────────┐          │   │
│   │   │              │   HTTP   │               │  control │                      │          │   │
│   │   │  Browser /   │────────▶ │   REST API    │────────▶ │    DIME Engine       │          │   │
│   │   │  curl / app  │◀──────── │   :9999       │◀──────── │                      │          │   │
│   │   │              │   JSON   │               │  status  │  Sources ←→ Sinks    │          │   │
│   │   └──────────────┘          └───────────────┘          └──────────────────────┘          │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ENDPOINT CATALOG                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   ┌────────┬───────────────────────────────┬────────────────────────────────────────────────┐    │
│   │ METHOD │ PATH                          │ DESCRIPTION                                    │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  GET   │ /status                       │ All connector health and metrics               │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  GET   │ /config/yaml                  │ Current running YAML configuration             │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /config/yaml                  │ Push new config (hot reload)                   │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /service/restart              │ Restart entire service                         │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /connector/start/{name}       │ Start one connector by name                    │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /connector/stop/{name}        │ Stop one connector by name                     │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /connector/add/source         │ Add source at runtime                          │    │
│   ├────────┼───────────────────────────────┼────────────────────────────────────────────────┤    │
│   │  POST  │ /connector/add/sink           │ Add sink at runtime                            │    │
│   └────────┴───────────────────────────────┴────────────────────────────────────────────────┘    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   GET /status — RESPONSE ANATOMY                                                                 │
│   ───────────────────────────────                                                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   $ curl http://localhost:9999/status                                                    │   │
│   │                                                                                          │   │
│   │   {                                                                                      │   │
│   │     "connectors": [                                                                      │   │
│   │       {                                                                                  │   │
│   │         "name":          "plc1",              ◀── connector name from YAML               │   │
│   │         "isConnected":   true,                ◀── connection alive?                      │   │
│   │         "isFaulted":     false,               ◀── in error state?                        │   │
│   │         "faultReason":   null,                ◀── last error message                     │   │
│   │         "metrics": {                                                                     │   │
│   │           "totalLoopTime":     23,            ◀── full cycle (ms)                        │   │
│   │           "deviceReadTime":    12,            ◀── hardware response (ms)                 │   │
│   │           "scriptExecTime":     4,            ◀── Lua/Python time (ms)                   │   │
│   │           "messagesAccepted":  1420,          ◀── messages processed                     │   │
│   │           "faultCount":        0              ◀── cumulative faults                      │   │
│   │         }                                                                                │   │
│   │       },                                                                                 │   │
│   │       { "name": "mqtt_src", ... },                                                       │   │
│   │       { "name": "influx_sink", ... }                                                     │   │
│   │     ]                                                                                    │   │
│   │   }                                                                                      │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Sources and sinks both appear. One endpoint gives you the full picture.                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   GET/POST /config/yaml — CONFIGURATION MANAGEMENT                                               │
│   ────────────────────────────────────────────────                                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   READ current config:                                                                   │   │
│   │   ────────────────────                                                                   │   │
│   │   $ curl http://localhost:9999/config/yaml                                               │   │
│   │                                                                                          │   │
│   │   Returns the full merged YAML that is currently running.                                │   │
│   │   Useful for debugging, backup, or auditing.                                             │   │
│   │                                                                                          │   │
│   │   PUSH new config (hot reload):                                                          │   │
│   │   ─────────────────────────────                                                          │   │
│   │   $ curl -X POST http://localhost:9999/config/yaml \                                     │   │
│   │       -H "Content-Type: text/yaml" \                                                     │   │
│   │       -d @new-config.yaml                                                                │   │
│   │                                                                                          │   │
│   │   DIME will:  1. Parse the new YAML                                                      │   │
│   │               2. Diff against running config                                             │   │
│   │               3. Apply changes (start/stop connectors as needed)                         │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR CONTROL — START / STOP / ADD                                                         │
│   ───────────────────────────────────────                                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   STOP a connector:                                                                      │   │
│   │   $ curl -X POST http://localhost:9999/connector/stop/plc1                               │   │
│   │                                                                                          │   │
│   │   START a connector:                                                                     │   │
│   │   $ curl -X POST http://localhost:9999/connector/start/plc1                              │   │
│   │                                                                                          │   │
│   │   ADD a new source at runtime:                                                           │   │
│   │   $ curl -X POST http://localhost:9999/connector/add/source \                            │   │
│   │       -H "Content-Type: application/json" \                                              │   │
│   │       -d '{"name":"new_plc","connector":"S7","address":"10.0.0.5"}'                      │   │
│   │                                                                                          │   │
│   │   ADD a new sink at runtime:                                                             │   │
│   │   $ curl -X POST http://localhost:9999/connector/add/sink \                              │   │
│   │       -H "Content-Type: application/json" \                                              │   │
│   │       -d '{"name":"debug","connector":"Console"}'                                        │   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────────────────────┐    │   │
│   │   │                     CONNECTOR LIFECYCLE VIA API                                 │    │   │
│   │   │                                                                                 │    │   │
│   │   │   POST /connector/stop/plc1         POST /connector/start/plc1                  │    │   │
│   │   │          │                                    │                                  │    │  │
│   │   │          ▼                                    ▼                                  │    │  │
│   │   │   ┌──────────────┐                     ┌─────────────┐                          │    │   │
│   │   │   │  DISCONNECT  │                     │  INITIALIZE │                          │    │   │
│   │   │   │  DEINITIALIZE│                     │  CREATE     │                          │    │   │
│   │   │   │  (graceful)  │                     │  CONNECT    │                          │    │   │
│   │   │   └──────────────┘                     │  READ/WRITE │                          │    │   │
│   │   │                                        └─────────────┘                          │    │   │
│   │   │                                                                                 │    │   │
│   │   └─────────────────────────────────────────────────────────────────────────────────┘    │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SWAGGER UI — INTERACTIVE API EXPLORER                                                          │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Open in browser:   http://localhost:9999/swagger                                       │   │
│   │                                                                                          │   │
│   │   ┌────────────────────────────────────────────────────────────────────────────────┐     │   │
│   │   │  ┌──────────────────────────────────────────────────────────────────────────┐  │     │   │
│   │   │  │  DIME Admin API                                                 v1.0     │  │     │   │
│   │   │  └──────────────────────────────────────────────────────────────────────────┘  │     │   │
│   │   │                                                                                │     │   │
│   │   │  ┌─ GET ───┐  /status                    All connector health and metrics      │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ GET ───┐  /config/yaml               Current running YAML                  │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /config/yaml               Push new configuration                │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /service/restart            Restart entire service               │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /connector/start/{name}    Start one connector                   │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /connector/stop/{name}     Stop one connector                    │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /connector/add/source      Add source at runtime                 │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /connector/add/sink        Add sink at runtime                   │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │                                                                                │     │   │
│   │   │  Try it out — send real requests directly from the browser.                    │     │   │
│   │   │  No curl needed. Responses shown inline.                                       │     │   │
│   │   └────────────────────────────────────────────────────────────────────────────────┘     │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HOT RECONFIGURATION — ZERO DOWNTIME                                                            │
│   ────────────────────────────────────                                                           │
│                                                                                                  │
│   Add, remove, or restart connectors without stopping the service.                               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Running DIME instance                                                                  │   │
│   │   ┌────────────────────────────────────────────────────────────────┐                     │   │
│   │   │                                                                │                     │   │
│   │   │   [plc1]  ──▶  Ring Buffer  ──▶  [influxdb]                    │   All running.      │   │
│   │   │   [mqtt]  ──▶              ──▶  [splunk]                       │   No interruption.  │   │
│   │   │                                                                │                     │   │
│   │   └────────────────────────────────────────────────────────────────┘                     │   │
│   │                            │                                                             │   │
│   │      POST /connector/add/sink  { "name":"debug", "connector":"Console" }                 │   │
│   │                            │                                                             │   │
│   │                            ▼                                                             │   │
│   │   ┌────────────────────────────────────────────────────────────────┐                     │   │
│   │   │                                                                │                     │   │
│   │   │   [plc1]  ──▶  Ring Buffer  ──▶  [influxdb]                    │   Console sink      │   │
│   │   │   [mqtt]  ──▶              ──▶  [splunk]                       │   added live.       │   │
│   │   │                            ──▶  [debug]  ◀── NEW               │   Zero downtime.    │   │
│   │   │                                                                │                     │   │
│   │   └────────────────────────────────────────────────────────────────┘                     │   │
│   │                                                                                          │   │
│   │   Existing connectors are unaffected. The new sink immediately                           │   │
│   │   begins receiving from the ring buffer.                                                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
