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
│   ┌────────┬──────────────────────────────────────────┬─────────────────────────────────────────┐    │
│   │ METHOD │ PATH                                     │ DESCRIPTION                             │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  GET   │ /status                                  │ All connector health and metrics         │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  GET   │ /config/yaml                             │ Current running YAML configuration       │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  GET   │ /config/json                             │ Current running JSON configuration       │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /config/yaml                             │ Write new config to disk                 │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /config/reload                           │ Reload config from disk and restart      │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /config/save                             │ Persist runtime config to disk           │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /connector/start/{type}/{name}           │ Start one connector (type=source|sink)  │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /connector/stop/{type}/{name}            │ Stop one connector (type=source|sink)   │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /connector/add/{type}/{name}             │ Add connector at runtime                 │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /connector/edit/{type}/{name}            │ Edit connector at runtime                │    │
│   ├────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤    │
│   │  POST  │ /connector/delete/{type}/{name}          │ Delete connector at runtime              │    │
│   └────────┴──────────────────────────────────────────┴─────────────────────────────────────────┘    │
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
│   │     "version": "3.1.5.0",                                                                │   │
│   │     "connectors": {                                                                      │   │
│   │       "plc1": {                                                                          │   │
│   │         "name":             "plc1",           ◀── connector name from YAML               │   │
│   │         "direction":        "Source",          ◀── Source or Sink                         │   │
│   │         "connectorType":    "OpcUa",           ◀── connector type                        │   │
│   │         "isRunning":        true,              ◀── timer active?                         │   │
│   │         "isConnected":      true,              ◀── connection alive?                     │   │
│   │         "isFaulted":        false,             ◀── in error state?                       │   │
│   │         "faultMessage":     "",                ◀── last error message                    │   │
│   │         "messagesAttempted": 5000,             ◀── total reads attempted                 │   │
│   │         "messagesAccepted":  1420,             ◀── passed RBE filter                     │   │
│   │         "lastReadMs":       12,                ◀── last device read (ms)                 │   │
│   │         "lastScriptMs":      4,                ◀── last script exec (ms)                 │   │
│   │         "lastLoopMs":       23,                ◀── last full cycle (ms)                  │   │
│   │         "connectCount":      1,                ◀── total connections                     │   │
│   │         "faultCount":        0                 ◀── cumulative faults                     │   │
│   │       },                                                                                 │   │
│   │       "influx_sink": { ... }                                                             │   │
│   │     }                                                                                    │   │
│   │   }                                                                                      │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Sources and sinks both appear. One endpoint gives you the full picture.                        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONFIGURATION MANAGEMENT                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   READ current config:                                                                   │   │
│   │   ────────────────────                                                                   │   │
│   │   $ curl http://localhost:9999/config/yaml                                               │   │
│   │   $ curl http://localhost:9999/config/json                                               │   │
│   │                                                                                          │   │
│   │   Returns the runtime configuration (includes any unsaved API changes).                  │   │
│   │   Useful for debugging, backup, or auditing.                                             │   │
│   │                                                                                          │   │
│   │   WRITE config to disk:                                                                  │   │
│   │   ─────────────────────                                                                  │   │
│   │   $ curl -X POST http://localhost:9999/config/yaml \                                     │   │
│   │       -H "Content-Type: text/plain" \                                                    │   │
│   │       -d @new-config.yaml                                                                │   │
│   │                                                                                          │   │
│   │   Writes config to disk. Does NOT reload running connectors.                             │   │
│   │   Call POST /config/reload to apply changes.                                             │   │
│   │                                                                                          │   │
│   │   RELOAD from disk:                                                                      │   │
│   │   ──────────────────                                                                     │   │
│   │   $ curl -X POST http://localhost:9999/config/reload                                     │   │
│   │                                                                                          │   │
│   │   Reloads configuration from disk and restarts all connectors.                           │   │
│   │                                                                                          │   │
│   │   SAVE runtime config to disk:                                                           │   │
│   │   ────────────────────────────                                                           │   │
│   │   $ curl -X POST http://localhost:9999/config/save                                       │   │
│   │                                                                                          │   │
│   │   Persists runtime configuration (after add/edit/delete operations) to disk.             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR CONTROL — START / STOP / ADD / EDIT / DELETE                                         │
│   ──────────────────────────────────────────────────────                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Paths include type (source or sink) and connector name:                                │   │
│   │                                                                                          │   │
│   │   STOP a source connector:                                                               │   │
│   │   $ curl -X POST http://localhost:9999/connector/stop/source/plc1                        │   │
│   │                                                                                          │   │
│   │   START a source connector:                                                              │   │
│   │   $ curl -X POST http://localhost:9999/connector/start/source/plc1                       │   │
│   │                                                                                          │   │
│   │   ADD a new source at runtime (body is YAML):                                            │   │
│   │   $ curl -X POST http://localhost:9999/connector/add/source/new_plc \                    │   │
│   │       -H "Content-Type: text/plain" \                                                    │   │
│   │       -d 'connector: S7                                                                  │   │
│   │   address: 10.0.0.5'                                                                     │   │
│   │                                                                                          │   │
│   │   ADD a new sink at runtime:                                                             │   │
│   │   $ curl -X POST http://localhost:9999/connector/add/sink/debug \                        │   │
│   │       -H "Content-Type: text/plain" \                                                    │   │
│   │       -d 'connector: Console'                                                            │   │
│   │                                                                                          │   │
│   │   EDIT / DELETE follow the same pattern:                                                 │   │
│   │   $ curl -X POST http://localhost:9999/connector/edit/source/plc1 ...                    │   │
│   │   $ curl -X POST http://localhost:9999/connector/delete/sink/debug                       │   │
│   │                                                                                          │   │
│   │   After add/edit/delete, call POST /config/save to persist changes to disk.              │   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────────────────────┐    │   │
│   │   │                     CONNECTOR LIFECYCLE VIA API                                 │    │   │
│   │   │                                                                                 │    │   │
│   │   │   POST /connector/stop/source/plc1  POST /connector/start/source/plc1           │    │   │
│   │   │          │                                    │                                 │    │   │
│   │   │          ▼                                    ▼                                 │    │   │
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
│   │   │  ┌─ GET ───┐  /status                              Health and metrics           │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ GET ───┐  /config/yaml                         Running YAML config          │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ GET ───┐  /config/json                         Running JSON config          │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /config/yaml                         Write config to disk         │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /config/reload                       Reload and restart           │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /config/save                         Save runtime to disk         │     │   │
│   │   │  └─────────┘                                                                   │     │   │
│   │   │  ┌─ POST ──┐  /connector/{action}/{type}/{name}    Connector management         │     │   │
│   │   │  └─────────┘   action = start|stop|add|edit|delete                              │     │   │
│   │   │                type = source|sink                                                │     │   │
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
│   │      POST /connector/add/sink/debug  (body: "connector: Console")                        │   │
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
