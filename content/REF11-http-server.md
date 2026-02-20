
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF11 — HTTP Server                                                 CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Starts an HTTP server. As a source, listens to HTTP POST requests. As a sink,            │
  │  serves all data items to external HTTP clients.                                          │
  │                                                                                           │
  │  Connector Type: HTTPServer                              Source ✓    Sink ✓               │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "HTTPServer".                │
  │  uri                    string   http://lo…  URL to listen for POST requests.             │
  │  items.address          string   Empty       URI path where to get POST data from.        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE NOTES
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  You can specify a less restrictive URI by providing the system's IP address or           │
  │  listen on all adapters by specifying http://*:8081.                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: httpServerSource1                                                                │
  │    connector: HTTPServer                                                                  │
  │    uri: http://localhost:8081/                                                            │
  │    init_script: |                                                                         │
  │      json = require('json');                                                              │
  │    items:                                                                                 │
  │      - name: postData                                                                     │
  │        address: post/data                                                                 │
  │        script: |                                                                          │
  │          return json.decode(result).hello;                                                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "HTTPServer".                │
  │  uri                    string   http://lo…  URL to serve items.                          │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK NOTES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  You can specify a less restrictive URI by providing the system's IP address or           │
  │  listen on all adapters by specifying http://*:8080.                                      │
  │                                                                                           │
  │  Endpoints:                                                                               │
  │    /items    - All items as dictionary.                                                   │
  │    /list     - All items as list.                                                         │
  │    /items/*  - Specific item by path.                                                     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: httpServerSink1                                                                  │
  │    connector: HttpServer                                                                  │
  │    uri: http://localhost:8080/                                                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
