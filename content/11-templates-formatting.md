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
│   Sources produce raw data. Sinks need specific formats. Templates bridge the gap.               │
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
│   ENABLING TEMPLATES: use_sink_transform                                                         │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   By default, source-side transforms (scripts) do not run on the sink.                           │
│   Set use_sink_transform to apply formatting on the sink side.                                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: my_api                                                                       │   │
│   │       connector: HttpClient                                                              │   │
│   │       address: https://api.example.com/data                                              │   │
│   │       use_sink_transform: !!bool true        ◀── enables template processing             │   │
│   │       template: |                                                                        │   │
│   │         {                                                                                │   │
│   │           "device": "{{ Message.Path }}",                                                │   │
│   │           "value": {{ Message.Data }},                                                   │   │
│   │           "timestamp": {{ Message.Timestamp }}                                           │   │
│   │         }                                                                                │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TEMPLATE ENGINES                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   DIME supports two template engines. Both use the same context variables.                       │
│                                                                                                  │
│   ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐       │
│   │                                         │  │                                         │       │
│   │   LIQUID                                │  │   SCRIBAN                               │       │
│   │                                         │  │                                         │       │
│   │   {{ Message.Data }}                    │  │   {{ Message.Data }}                    │       │
│   │   {{ Message.Path | upcase }}           │  │   {{ Message.Path | string.upcase }}    │       │
│   │                                         │  │                                         │       │
│   │   {% if Message.Data > 100 %}           │  │   {{ if Message.Data > 100 }}           │       │
│   │     ALARM                               │  │     ALARM                               │       │
│   │   {% endif %}                           │  │   {{ end }}                             │       │
│   │                                         │  │                                         │       │
│   │   Ruby-inspired syntax.                 │  │   .NET-native expressions.              │       │
│   │   Widely known from Shopify,            │  │   Supports math, functions,             │       │
│   │   Jekyll, and many web tools.           │  │   and advanced formatting.              │       │
│   │                                         │  │                                         │       │
│   └─────────────────────────────────────────┘  └─────────────────────────────────────────┘       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TEMPLATE CONTEXT VARIABLES                                                                     │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Every template has access to these objects:                                                    │
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
│   │   Connector            .Name               Name of the sink connector                    │   │
│   │                        .Type               Connector type, e.g. "HttpClient"             │   │
│   │                                                                                          │   │
│   │   Configuration        .Address             Sink address / URL                           │   │
│   │                        (varies)             Other sink-specific settings                 │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   JSON RESHAPING EXAMPLE                                                                         │
│   ──────────────────────                                                                         │
│                                                                                                  │
│   Transform flat message data into a nested JSON structure for a REST API:                       │
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
│    ┌───────────────────────────┐                  "meta": {                                      │
│    │  template: |              │                      "ts": 1700000000,                          │
│    │    {                      │                      "source": "dime-edge-01"                   │
│    │      "device":            │ ────────────▶    }                                              │
│    │      "{{ Message.Path }}",│                }                                                │
│    │      "readings": {        │                                                                 │
│    │        "value":           │                                                                 │
│    │        {{ Message.Data }},│                                                                 │
│    │        "unit": "F"        │                                                                 │
│    │      },                   │                                                                 │
│    │      "meta": {            │                                                                 │
│    │        "ts":              │                                                                 │
│    │          {{ Message.Timestamp }},│                                                          │
│    │        "source":          │                                                                 │
│    │          "dime-edge-01"   │                                                                 │
│    │      }                    │                                                                 │
│    │    }                      │                                                                 │
│    └───────────────────────────┘                                                                 │
│                                                                                                  │
│   OTHER FORMATS                                                                                  │
│   ─────────────                                                                                  │
│                                                                                                  │
│   ┌──────────────────────────────┐  ┌──────────────────────────────┐                             │
│   │  CSV Line                    │  │  Log String                  │                             │
│   │                              │  │                              │                             │
│   │  template: |                 │  │  template: |                 │                             │
│   │    {{ Message.Timestamp }},  │  │    [{{ Message.Timestamp }}] │                             │
│   │    {{ Message.Path }},       │  │    {{ Message.Path }}:       │                             │
│   │    {{ Message.Data }}        │  │    {{ Message.Data }}        │                             │
│   └──────────────────────────────┘  └──────────────────────────────┘                             │
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
│   │   Runs on the SINK side.                 │  │   ✓ Aggregation and filtering            │     │
│   │   No access to cache or emit.            │  │                                          │     │
│   │   Pure string formatting.                │  │   Runs on the SOURCE side.               │     │
│   │                                          │  │   Full API access.                       │     │
│   │                                          │  │   Turing-complete logic.                 │     │
│   │                                          │  │                                          │     │
│   └──────────────────────────────────────────┘  └──────────────────────────────────────────┘     │
│                                                                                                  │
│   TIP: Use Lua scripts to transform and enrich data, then templates to format                    │
│   the final output for each sink. They work together.                                            │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
