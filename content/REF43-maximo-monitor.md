
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF43 — Maximo Monitor                                              CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Publishes source data to an IBM Maximo Monitor (Watson IoT style)                        │
  │  MQTT endpoint. Each scan cycle merges newly received items into a                        │
  │  running device snapshot and publishes one flat JSON event.                               │
  │                                                                                           │
  │  Connector Type: MaximoMonitor              Source ✗    Sink ✓                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ─────────────────────────                    │
  │  connector              string   "Undefined" Connector type, "MaximoMonitor".             │
  │  address                string   Empty       Maximo Monitor MQTT broker host/IP.          │
  │  port                   int      8883        Broker port.                                 │
  │  org_id                 string   Empty       Org id - 1st client-id segment.              │
  │  device_type            string   Empty       Device type - 2nd client-id segment.         │
  │  device_id              string   Empty       Device id - 3rd client-id segment.           │
  │  auth_token             string   Empty       Device token (user use-token-auth).          │
  │  device                 string   Empty       Value for the payload "device" field.        │
  │  event_id               string   "data"      Event id used in the publish topic.          │
  │  qos                    int      1           Quality of Service (0, 1, 2).                │
  │  retain                 bool     FALSE       Retain published messages.                   │
  │  clean_session          bool     TRUE        MQTT clean session.                          │
  │  tls                    bool     TRUE        SSL/TLS connection.                          │
  │  tls_insecure           bool     FALSE       Allow untrusted certificates.                │
  │  client_cert_path       string   Empty       Path to client certificate (.pfx).           │
  │  client_cert_password   string   Empty       Client certificate password.                 │
  │  ca_cert_path           string   Empty       Path to CA certificate.                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  EVENT PAYLOAD
  ─────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Publish topic    iot-2/evt/{event_id}/fmt/json                                           │
  │  MQTT client id   d:{org_id}:{device_type}:{device_id}                                    │
  │  Authentication   when auth_token is set, connects as user                                │
  │                   "use-token-auth" with the token as password                             │
  │                                                                                           │
  │  Each scan cycle the sink emits one flat JSON object:                                     │
  │                                                                                           │
  │    {                                                                                      │
  │      "<itemName>": <value>,      one key per source item                                  │
  │      ...                                                                                  │
  │      "timestamp": "2026-05-21T14:03:00.000Z",   auto, UTC                                 │
  │      "device": "Mazak"           from the device property                                 │
  │    }                                                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  NOTES
  ─────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  • Per-cycle snapshot - items that did not change this cycle are                          │
  │    retained from the previous cycle, so every event carries the                           │
  │    full device state.                                                                     │
  │                                                                                           │
  │  • No Script connector - the sink builds the payload itself,                              │
  │    replacing the dataFormatter combiner used in earlier examples.                         │
  │                                                                                           │
  │  • include_filter selects which source items become metrics;                              │
  │    $SYSTEM messages are always skipped.                                                   │
  │                                                                                           │
  │  • The connection is synchronous, like the MQTT sink - an                                 │
  │    unreachable broker blocks the runner until the TCP timeout.                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: maximoMonitorSink                                                                │
  │    connector: MaximoMonitor                                                               │
  │    address: vm-maxproxy.sms-inc.net                                                       │
  │    port: !!int 8883                                                                       │
  │    tls: !!bool true                                                                       │
  │    org_id: smsinst3                                                                       │
  │    device_type: CNC_Mazak                                                                 │
  │    device_id: CNC_Mazak_001                                                               │
  │    auth_token: your-device-auth-token                                                     │
  │    device: Mazak                                                                          │
  │    event_id: status                                                                       │
  │    qos: !!int 1                                                                           │
  │    include_filter:                                                                        │
  │      - mazakSource/.*                                                                     │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  MQTTnet GitHub        https://github.com/dotnet/MQTTnet                                  │
  │  IBM Maximo Monitor    https://www.ibm.com/products/maximo                                │
  │  See also              REF18 (MQTT), EX37 (Maximo Monitor)                                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
