
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF12 — I3x Web Server                                                CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  REST API interface for accessing contextualized manufacturing data organized as an       │
  │  I3X object graph. Builds an in-memory graph of objects with attributes and               │
  │  relationships, then exposes the data through HTTP endpoints.                             │
  │                                                                                           │
  │  Connector Type: I3xWebServer                      Source ✗    Sink ✓                     │
  │                                                                                           │
  │  Alpha Preview                                                                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "I3xWebServer".              │
  │  uri                    string   http://lo…  HTTP listener URI.                           │
  │  enable_cors            bool     true        Enable CORS support.                         │
  │  cors_origins           list     ["*"]       Allowed CORS origin domains.                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  API ENDPOINTS
  ─────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Endpoint                                    Description                                  │
  │  ──────────────────────────────────────────  ──────────────────────────────────────────── │
  │  GET /                                       API information.                             │
  │  GET /health                                 Server health status.                        │
  │  GET /stats                                  Server statistics.                           │
  │  GET /objects                                List all object instances.                   │
  │  GET /objects/{elementId}                    Get object with attributes and children.     │
  │  GET /objects/{elementId}/parent             Get parent object.                           │
  │  GET /objects/{elementId}/children           Get all child objects.                       │
  │  GET /objects/{elementId}/relationships/{t}  Get related objects by relationship type.    │
  │  GET /values/{elementId}                     Get all attributes for an object.            │
  │  GET /relationships/{elementId}              Get all relationship IDs.                    │
  │  GET /relationships/{elementId}/{type}       Get specific relationship IDs.               │
  │  GET /types                                  Get all type definitions.                    │
  │  GET /graph                                  Get entire graph as JSON.                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  NOTES
  ─────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  I3X Metadata                                                                             │
  │  ────────────                                                                             │
  │  Messages consumed by this sink must include I3X metadata defined in the sink.i3x         │
  │  property. The metadata specifies: elementId, typeId, parentId, namespace, name,          │
  │  and optional attributes and relationships.                                               │
  │                                                                                           │
  │  Object Graph                                                                             │
  │  ────────────                                                                             │
  │  The connector maintains an in-memory graph of I3X objects supporting parent-child        │
  │  hierarchies and arbitrary relationships. Types are dynamically learned from              │
  │  configuration metadata — no predefined type definitions are needed.                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: i3xServer                                                                        │
  │    connector: I3xWebServer                                                                │
  │    uri: http://localhost:8090/                                                            │
  │    enable_cors: true                                                                      │
  │    cors_origins: ["*"]                                                                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
