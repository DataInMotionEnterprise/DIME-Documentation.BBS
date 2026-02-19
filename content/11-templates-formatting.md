```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        11 — Templates                                 │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Reshape output for any format.                 │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Liquid and Scriban engines.                    │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE IDEA                                                                                       │
│   ────────                                                                                       │
│                                                                                                  │
│   Templates are defined on sources, rendered by sinks. They bridge the format gap.               │
│                                                                                                  │
│    ┌────────────┐      ┌────────────────┐      ┌───────────────┐      ┌────────────────┐         │
│    │            │      │                │      │               │      │                │         │
│    │  Raw Data  │─────▶│   Template     │─────▶│  Formatted    │─────▶│     Sink       │         │
│    │            │      │   Engine       │      │  Output       │      │                │         │
│    │ Path: ...  │      │                │      │               │      │ HTTP, MQTT,    │         │
│    │ Data: 72.5 │      │ Liquid/Scriban │      │ {"device":    │      │ InfluxDB, ...  │         │
│    │ Time: ...  │      │ expressions    │      │  "plc1", ...} │      │                │         │
│    │            │      │                │      │               │      │                │         │
│    └────────────┘      └────────────────┘      └───────────────┘      └────────────────┘         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HOW TEMPLATES WORK                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   Templates are defined on the SOURCE under sink.transform.                                      │
│   Set use_sink_transform: true on each SINK that should render the template.                     │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   SOURCE (where the template is defined)                                                 │   │
│   │                                                                                          │   │
│   │   sources:                                                                               │   │
│   │     - name: my_source                                                                    │   │
│   │       connector: OpcUa                                                                   │   │
│   │       sink:                                                                              │   │
│   │         transform:                                                                       │   │
│   │           type: scriban                      ◀── script | scriban | liquid                │   │
│   │           template: |                                                                    │   │
│   │             {                                                                            │   │
│   │               "device": "{{ Message.Path }}",                                            │   │
│   │               "value": {{ Message.Data }},                                               │   │
│   │               "timestamp": {{ Message.Timestamp }}                                       │   │
│   │             }                                                                            │   │
│   │                                                                                          │   │
│   │   SINK (where template execution is enabled)                                             │   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: my_api                                                                       │   │
│   │       connector: HttpClient                                                              │   │
│   │       address: https://api.example.com/data                                              │   │
│   │       use_sink_transform: !!bool true        ◀── renders the source template             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TEMPLATE MODES                                                                                 │
│   ──────────────                                                                                 │
│                                                                                                  │
│   DIME supports three modes, all powered by the Scriban library.                                 │
│   Set the mode via sink.transform.type on the source.                                            │
│                                                                                                  │
│   ┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│   │                            │  │                            │  │                            │  │
│   │   type: script             │  │   type: scriban            │  │   type: liquid             │  │
│   │                            │  │                            │  │                            │  │
│   │   Expression evaluation.   │  │   Full template syntax.    │  │   Liquid-compatible mode.  │  │
│   │   Simplest mode.           │  │   Loops, conditionals.     │  │   Shopify/Jekyll syntax.   │  │
│   │                            │  │                            │  │                            │  │
│   │   template: Message.Data   │  │   template: |              │  │   template: |              │  │
│   │                            │  │     {{ Message.Data }}     │  │     {{ Message.Data }}     │  │
│   │   Returns the evaluated    │  │     {{ if x > 100 }}      │  │     {% if x > 100 %}       │  │
│   │   result directly.         │  │       ALARM                │  │       ALARM                │  │
│   │                            │  │     {{ end }}              │  │     {% endif %}             │  │
│   │   Also exposes print()     │  │                            │  │                            │  │
│   │   and type() functions.    │  │   .NET-native expressions  │  │   Ruby-inspired syntax.    │  │
│   │                            │  │   with full formatting.    │  │   Widely known.            │  │
│   │                            │  │                            │  │                            │  │
│   └────────────────────────────┘  └────────────────────────────┘  └────────────────────────────┘  │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TEMPLATE CONTEXT VARIABLES                                                                     │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Every template has access to these objects (from the rendering sink):                          │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   OBJECT              PROPERTY             DESCRIPTION                                   │   │
│   │   ────────────────    ────────────────     ──────────────────────────────────────────    │   │
│   │                                                                                          │   │
│   │   Message              .Path               Source path, e.g. "plc1/temperature"          │   │
│   │                        .Data               The raw value (number, string, JSON)          │   │
│   │                        .Timestamp           Unix epoch timestamp of the reading          │   │
│   │                                                                                          │   │
│   │   Connector            .Name               Name of the rendering sink connector          │   │
│   │                        .Type               Connector type, e.g. "HttpClient"             │   │
│   │                                                                                          │   │
│   │   Configuration        .Address             Sink address / URL                           │   │
│   │                        (varies)             Other sink-specific settings                 │   │
│   │                                                                                          │   │
│   │   print()              (script mode)        Write to console for debugging               │   │
│   │   type()               (script mode)        Returns .NET type name of an object          │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   JSON RESHAPING EXAMPLE                                                                         │
│   ──────────────────────                                                                         │
│                                                                                                  │
│   Define on the source, render on the sink.  Reshape into nested JSON for a REST API:            │
│                                                                                                  │
│    INPUT (raw message)                          OUTPUT (after template)                          │
│    ───────────────────                          ──────────────────────                           │
│                                                                                                  │
│    Path: plc1/temperature                       {                                                │
│    Data: 72.5                                     "device": "plc1/temperature",                  │
│    Timestamp: 1700000000                          "readings": {                                  │
│                                                       "value": 72.5,                             │
│                                                       "unit": "F"                                │
│                                                   },                                             │
│    ┌─────────────────────────────────┐            "meta": {                                      │
│    │  sink:                          │                "ts": 1700000000,                          │
│    │    transform:                   │                "source": "dime-edge-01"                   │
│    │      type: scriban              │            }                                              │
│    │      template: |                │          }                                                │
│    │        {                        │                                                           │
│    │          "device":              │ ─▶  Defined on the SOURCE.                                │
│    │            "{{ Message.Path }}" │     Rendered by any sink                                  │
│    │          "readings": {          │     with use_sink_transform:                              │
│    │            "value":             │     !!bool true                                           │
│    │              {{ Message.Data }} │                                                           │
│    │            "unit": "F"          │                                                           │
│    │          },                     │                                                           │
│    │          "meta": {              │                                                           │
│    │            "ts":                │                                                           │
│    │              {{ Message.Timestamp }},│                                                      │
│    │            "source":            │                                                           │
│    │              "dime-edge-01"     │                                                           │
│    │          }                      │                                                           │
│    │        }                        │                                                           │
│    └─────────────────────────────────┘                                                           │
│                                                                                                  │
│   OTHER FORMATS                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   ┌─────────────────────────────────┐  ┌─────────────────────────────────┐                       │
│   │  CSV Line                       │  │  Log String                       │                       │
│   │                                 │  │                                 │                       │
│   │  sink:                          │  │  sink:                          │                       │
│   │    transform:                   │  │    transform:                   │                       │
│   │      type: scriban              │  │      type: scriban              │                       │
│   │      template: |                │  │      template: |                │                       │
│   │        {{ Message.Timestamp }}, │  │        [{{ Message.Timestamp }}]│                       │
│   │        {{ Message.Path }},      │  │        {{ Message.Path }}:      │                       │
│   │        {{ Message.Data }}       │  │        {{ Message.Data }}       │                       │
│   └─────────────────────────────────┘  └─────────────────────────────────┘                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TEMPLATES vs SCRIPTS — WHEN TO USE EACH                                                        │
│   ───────────────────────────────────────                                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐     │
│   │                                          │  │                                          │     │
│   │   TEMPLATES                              │  │   LUA / PYTHON SCRIPTS                   │     │
│   │                                          │  │                                          │     │
│   │   Best for OUTPUT FORMATTING:            │  │   Best for DATA LOGIC:                   │     │
│   │                                          │  │                                          │     │
│   │   ✓ Reshaping JSON structure             │  │   ✓ Math and unit conversions            │     │
│   │   ✓ Building CSV or log lines            │  │   ✓ Conditional branching                │     │
│   │   ✓ Protocol-specific payloads           │  │   ✓ State machines and counters          │     │
│   │   ✓ Adding static metadata               │  │   ✓ Parsing complex input                │     │
│   │   ✓ Simple variable substitution         │  │   ✓ emit() to fork messages              │     │
│   │                                          │  │   ✓ cache() for cross-connector reads    │     │
│   │   Defined on the SOURCE.                 │  │   ✓ Aggregation and filtering            │     │
│   │   Rendered by the SINK                   │  │                                          │     │
│   │   (when use_sink_transform: true).       │  │   Runs on the SOURCE side.               │     │
│   │   No access to cache or emit.            │  │   Full API access.                       │     │
│   │   Pure string formatting.                │  │   Turing-complete logic.                 │     │
│   │                                          │  │                                          │     │
│   └──────────────────────────────────────────┘  └──────────────────────────────────────────┘     │
│                                                                                                  │
│   TIP: Use Lua scripts to transform and enrich data on the source, then templates               │
│   to format the final output per sink. They work together.                                       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
