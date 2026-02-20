
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF25 — OPC-UA                                                     CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads items from an OPC-UA server. Writes items to an OPC-UA server.                     │
  │                                                                                           │
  │  Connector Type: OpcUA                               Source ✓    Sink ✓                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "OpcUA".                     │
  │  address                string   Empty       Server hostname or IP address.               │
  │  port                   int      49320       Server port.                                 │
  │  path                   string   Empty       Server path.                                 │
  │  timeout                int      1000        Timeout in milliseconds.                     │
  │  mode                   int      None        1=None, 2=Sign, 3=SignAndEncrypt.            │
  │  policy                 int      None        1=None, 2=Basic256, 3=Basic128Rsa15,         │
  │                                              4=Basic256Sha256.                            │
  │  anonymous              bool     FALSE       Connect anonymously.                         │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │  allow_status_codes     list     Empty       Allowed status codes (won't cause errors).   │
  │  items.address          string   Empty       Node ID to read.                             │
  │  items.namespace        int      2           Namespace ID to read.                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: opcUaSource1                                                                     │
  │    connector: OpcUA                                                                       │
  │    address: localhost                                                                     │
  │    port: !!int 49320                                                                      │
  │    timeout: !!int 1000                                                                    │
  │    anonymous: !!bool false                                                                │
  │    username: chris                                                                        │
  │    password: passwordpassword                                                             │
  │    allowed_status_codes:                                                                  │
  │      - 2156724224                                                                         │
  │    items:                                                                                 │
  │      - name: DateTime                                                                     │
  │        namespace: !!int 2                                                                 │
  │        address: _System._DateTime                                                         │
  │      - name: Random                                                                       │
  │        namespace: !!int 2                                                                 │
  │        address: Simulation Examples.Functions.Random6                                     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "OpcUA".                     │
  │  address                string   Empty       Server hostname or IP address.               │
  │  port                   int      49320       Server port.                                 │
  │  timeout                int      1000        Timeout in milliseconds.                     │
  │  mode                   int      None        1=None, 2=Sign, 3=SignAndEncrypt.            │
  │  policy                 int      None        1=None, 2=Basic256, 3=Basic128Rsa15,         │
  │                                              4=Basic256Sha256.                            │
  │  anonymous              bool     FALSE       Connect anonymously.                         │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: opcUaSink1                                                                       │
  │    connector: OpcUA                                                                       │
  │    address: localhost                                                                     │
  │    port: !!int 49320                                                                      │
  │    timeout: !!int 1000                                                                    │
  │    anonymous: !!bool false                                                                │
  │    username: chris                                                                        │
  │    password: passwordpassword                                                             │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  LibUA Github: https://github.com/nauful/libua                                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
