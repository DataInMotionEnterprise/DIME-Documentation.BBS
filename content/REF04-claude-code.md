
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF04 — Claude Code                                                    CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Executes Claude AI prompts with optional context data for AI-powered analytics.          │
  │  Supports predictive maintenance, anomaly detection, and intelligent data analysis.       │
  │                                                                                           │
  │  Connector Type: ClaudeCode                        Source ✓    Sink ✗                     │
  │                                                                                           │
  │  Alpha Preview                                                                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "ClaudeCode".                │
  │  executable             string   "claude"    Path or name of the Claude CLI executable.   │
  │  timeout_ms             int      60000       Max time (ms) to wait for Claude response.   │
  │  model                  string   Empty       Optional model (e.g. "sonnet", "opus").      │
  │  additional_args        list     Empty       Additional CLI arguments for Claude.         │
  │  items.address          string   Empty       Claude prompt template to execute.           │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  NOTES
  ─────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Two-Phase Execution                                                                      │
  │  ───────────────────                                                                      │
  │  For each item, the connector first executes an optional context script (Lua or           │
  │  Python) to gather data, then calls Claude with the prompt plus the context data.         │
  │                                                                                           │
  │  The prompt is defined in items.address. Context data from the script is appended         │
  │  to the prompt before sending to Claude.                                                  │
  │                                                                                           │
  │  Response Parsing                                                                         │
  │  ────────────────                                                                         │
  │  Claude's response is parsed as JSON if possible, with automatic fallback to              │
  │  plain string. Markdown code fences are stripped automatically.                           │
  │                                                                                           │
  │  Executable                                                                               │
  │  ──────────                                                                               │
  │  The connector verifies the Claude CLI executable during initialization by running        │
  │  --version. On Windows, both .cmd and .exe variants are supported. The .cmd variant       │
  │  receives the prompt via stdin; .exe receives it as a command-line argument.              │
  │                                                                                           │
  │  Coordination                                                                             │
  │  ────────────                                                                             │
  │  Use wait_for_connectors to ensure data sources have populated before Claude              │
  │  analyzes their output. Use execute_every to control how often each item runs.            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: claude_rul                                                                       │
  │    connector: ClaudeCode                                                                  │
  │    executable: claude                                                                     │
  │    model: sonnet                                                                          │
  │    additional_args: ['-c']                                                                │
  │    timeout_ms: 30000                                                                      │
  │    scan_interval: 60000                                                                   │
  │    lang_script: python                                                                    │
  │    wait_for_connectors: ['dataset_generator']                                             │
  │    init_script: |                                                                         │
  │      def average(arr):                                                                    │
  │        return sum(arr) / len(arr) if arr else 0                                           │
  │    items:                                                                                 │
  │      - name: rul_prediction                                                               │
  │        address: |                                                                         │
  │          You are an industrial AI analyzing vibration data.                               │
  │          Analyze the data and predict Remaining Useful Life.                              │
  │          Return ONLY raw JSON with this format:                                           │
  │          {"rul_hours": 0, "confidence": 0.0, "risk_level": "low"}                         │
  │        script: |                                                                          │
  │          data, ts = dime.cache_ts('dataset_generator/vibration_dataset', None)            │
  │          {                                                                                │
  │            'vibration_data': {                                                            │
  │              'rms_avg': average(data['vibration_rms']),                                   │
  │              'peak_avg': average(data['vibration_peak'])                                  │
  │            }                                                                              │
  │          }                                                                                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
