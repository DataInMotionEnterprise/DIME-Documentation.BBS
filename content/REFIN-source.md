
═══════════════════════════════════════════════════════════════════════════════════════════════
  REFIN — Source                                                       CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Common properties shared by all source connectors.                                       │
  │                                                                                           │
  │  Each connector reference page lists only the properties specific to that connector.      │
  │  The properties below apply to every source connector and do not need to be repeated.     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                            Type      Default     Description                        │
  │  ──────────────────────────────  ────────  ──────────  ──────────────────────────────────  │
  │  name                            string    "Unnamed"   Unique connector name.              │
  │  enabled                         boolean   TRUE        Is connector enabled.               │
  │  connector                       string    "Undefined" Connector type.                     │
  │  scan_interval                   int       1000        Scanning frequency in milliseconds. │
  │  rbe                             boolean   TRUE        Report data by exception.           │
  │  itemized_read                   boolean   FALSE       Process incoming data based on      │
  │                                                        items array.                        │
  │  lang_script                     string    Lua         Python or Lua scripting language.   │
  │  paths_script                    string[]  Empty       Additional paths for scripting      │
  │                                                        libraries.                          │
  │  init_script                     string    Empty       Startup script.                     │
  │  deinit_script                   string    Empty       Shutdown script.                    │
  │  enter_script                    string    Empty       Execution loop entry script.        │
  │  exit_script                     string    Empty       Execution loop exit script.         │
  │  item_script                     string    Empty       Script executed for each item       │
  │                                                        when undefined at item level.       │
  │  sink                            dict      Empty       Sink metadata.                      │
  │  strip_path_prefix               boolean   FALSE       Remove connector name from          │
  │                                                        messages placed in outbox.          │
  │  create_dummy_messages_on_startup boolean  FALSE       For itemized_read connectors,       │
  │                                                        create a zero value message for     │
  │                                                        each item on startup.               │
  │  ignore_errors_on_read           boolean   FALSE       Ignore exceptions on read and       │
  │                                                        continue reading remaining items.   │
  │  wait_for_connectors             list      Empty       Block execution until dependency    │
  │                                                        connectors complete their scan      │
  │                                                        cycle, ensuring cache() access to   │
  │                                                        fresh data.                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  ITEM PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  items.name             string   "Unnamed"   Unique item name.                            │
  │  items.enabled          boolean  TRUE        Is item enabled.                             │
  │  items.rbe              boolean  TRUE        Report by exception override at item level.  │
  │  items.every            int      1           Execute item every x scan_interval.          │
  │  items.address          string   Empty       Source data address, formatting specific     │
  │                                              to connector type.                           │
  │  items.script           string   Empty       Lua script executed after source data is     │
  │                                              read.                                        │
  │  items.sink             dict     Empty       Sink metadata override at item level.        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: script1                                                                          │
  │    enabled: !!bool true                                                                   │
  │    connector: ActiveMQ                                                                    │
  │    scan_interval: !!int 1000                                                              │
  │    rbe: !!bool true                                                                       │
  │    itemized_read: !!bool true                                                             │
  │    init_script: |                                                                         │
  │      print('hello from Lua');                                                             │
  │    deinit_script: ~                                                                       │
  │    enter_script: print('entering loop');                                                  │
  │    exit_script: print('exiting loop');                                                    │
  │    sink:                                                                                  │
  │      transform:                                                                           │
  │        type: script                                                                       │
  │        template: Message.Data                                                             │
  │    strip_path_prefix: !!bool false                                                        │
  │    create_dummy_messages_on_startup: !!bool false                                         │
  │    items:                                                                                 │
  │      - name: randomNumber1                                                                │
  │        enabled: !!bool true                                                               │
  │        rbe: !!bool true                                                                   │
  │        every: !!int 1                                                                     │
  │        script: return math.random(10);                                                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  A Gentle Introduction to the YAML Format:                                                │
  │    https://dev.to/kalkwst/a-gentle-introduction-to-the-yaml-format-bi6                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
